import json
import os
import boto3
import requests

FMP_BASE = "https://financialmodelingprep.com/stable"


# ─────────────────────────── FMP data layer ───────────────────────────

def _fmp_get(endpoint: str, params: dict) -> list | dict:
    """GET a JSON response from Financial Modeling Prep (stable API)."""
    api_key = os.environ["FMP_API_KEY"]
    params["apikey"] = api_key
    url = f"{FMP_BASE}/{endpoint}"
    resp = requests.get(url, params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()

    if isinstance(data, dict) and "Error Message" in data:
        raise RuntimeError(f"FMP error: {data['Error Message']}")

    return data


def _pct_change(current: float, previous: float) -> float | None:
    """Calculate percentage change; returns None if previous is zero."""
    if previous == 0:
        return None
    return round((current - previous) / abs(previous) * 100, 2)


def _fetch_data(ticker: str) -> dict:
    """Fetch 4 quarters of income statements + live quote from FMP stable API."""

    income_raw = _fmp_get("income-statement", {
        "symbol": ticker,
        "period": "quarter",
        "limit": "4",
    })
    quote_raw = _fmp_get("quote", {"symbol": ticker})

    if not isinstance(income_raw, list) or len(income_raw) == 0:
        raise ValueError(f"No income-statement data returned for {ticker}")

    quote = quote_raw[0] if isinstance(quote_raw, list) and quote_raw else {}

    # Build chart-ready array (oldest → newest)
    quarters = list(reversed(income_raw))

    chart_data = []
    ttm_eps = 0.0

    for i, stmt in enumerate(quarters):
        revenue = stmt.get("revenue", 0) or 0
        profit = stmt.get("netIncome", 0) or 0
        eps = stmt.get("epsDiluted") or stmt.get("eps", 0) or 0
        period = stmt.get("period", "")
        fiscal_year = stmt.get("fiscalYear", "")
        gross_profit = stmt.get("grossProfit", 0) or 0

        ttm_eps += eps

        gross_margin = round((gross_profit / revenue * 100), 1) if revenue else 0

        row = {
            "date": f"{fiscal_year}-{period}",
            "revenue": round(revenue / 1e9, 2),
            "profit": round(profit / 1e9, 2),
            "eps": round(eps, 2),
            "gross_profit_ratio": gross_margin,
            "operating_income": round(
                (stmt.get("operatingIncome", 0) or 0) / 1e9, 2
            ),
            "net_income_margin": round(
                (profit / revenue * 100) if revenue else 0, 1
            ),
        }

        if i > 0:
            prev = quarters[i - 1]
            row["revenue_qoq_pct"] = _pct_change(
                revenue, prev.get("revenue", 0) or 0
            )
            row["profit_qoq_pct"] = _pct_change(
                profit, prev.get("netIncome", 0) or 0
            )
            row["eps_qoq_pct"] = _pct_change(
                eps, prev.get("epsDiluted") or prev.get("eps", 0) or 0
            )

        chart_data.append(row)

    stock_price = quote.get("price", 0) or 0
    pe_ratio = round(stock_price / ttm_eps, 1) if ttm_eps else 0
    year_low = quote.get("yearLow", "N/A")
    year_high = quote.get("yearHigh", "N/A")

    return {
        "company": quote.get("name", f"{ticker} Inc."),
        "ticker": ticker,
        "chart_data": chart_data,
        "valuation": {
            "stock_price": stock_price,
            "pe_ratio": pe_ratio,
            "market_cap_b": round((quote.get("marketCap", 0) or 0) / 1e9, 2),
            "day_change_pct": round(quote.get("changePercentage", 0) or 0, 2),
        },
        "quote_raw": {
            "range": f"${year_low} - ${year_high}",
            "avgVolume": quote.get("volume", 0) or 0,
        },
    }


# ─────────────────────────── Prompt builder ───────────────────────────

def _build_prompt(ticker: str, data: dict) -> str:
    """Build a constrained morning-briefing prompt that forces concise, data-dense output."""

    chart = data["chart_data"]
    val = data["valuation"]
    quarters_block = json.dumps(chart, indent=2)

    return f"""You are a senior equity analyst writing a morning briefing memo for a portfolio
manager who has 30 seconds to read this. Be direct and opinionated. State what matters,
skip what doesn't.

Company: **{data['company']} ({ticker})**
Price: ${val['stock_price']} | P/E: {val['pe_ratio']} | Market Cap: ${val['market_cap_b']}B

Last 4 quarters:
```json
{quarters_block}
```

---

Write your memo in EXACTLY this format. Do not deviate.

### {ticker} Scorecard

Output a markdown table with these exact columns and rows:

| Metric | Grade | Signal |
|--------|-------|--------|
| Operational Excellence | (A+ to F) | (one sentence citing margin trend) |
| Growth Efficiency | (A+ to F) | (one sentence citing revenue vs profit QoQ rates) |
| Valuation | STRETCHED / FAIR / COMPRESSED | (one sentence on P/E vs earnings trajectory) |

### Bull Case
- Exactly 2-3 bullets. Each bullet MUST start with a **bold metric** and include a specific
  number from the data. Example format: "**Revenue acceleration**: $155B to $213B (+37%) ..."
- No filler. No "it's worth noting." Just the signal.

### Bear Case
- Exactly 2-3 bullets. Same format — **bold risk label** followed by the specific numbers
  that prove it. Example: "**Margin compression**: net income margin fell from 11.8% to 9.9% ..."
- Focus on what could break the thesis. Be specific.

### Verdict
- Exactly 2 sentences. First sentence: your thesis in plain English.
  Second sentence: starts with a bold rating from this list:
  **STRONG BUY** / **BUY** / **HOLD** / **UNDERPERFORM** / **SELL**

---

HARD RULES:
- Your ENTIRE response must be under 500 words. Brevity is intelligence.
- Every bullet must contain at least one number from the data above.
- Do NOT use these phrases: "It's worth noting", "It should be mentioned", "Overall",
  "In summary", "In conclusion", "It is important to", "Looking at the data".
- Do NOT repeat the company snapshot — I already have it.
- Do NOT add sections beyond the four above.
- Use the QoQ growth rates (revenue_qoq_pct, profit_qoq_pct, eps_qoq_pct) already
  calculated in the data — do not recalculate them."""


# ─────────────────────────── Lambda handler ───────────────────────────

def lambda_handler(event, context):
    """High-Fidelity Financial Engine.

    1. Fetches live income-statement + quote data from FMP stable API.
    2. Computes QoQ growth rates and margins.
    3. Returns chart-ready metrics immediately.
    4. Invokes Bedrock for a strategic audit using real numbers.

    Response:
      { ticker, company, chartData[], valuation{}, analysis }
    """

    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
    }

    params = event.get("queryStringParameters") or {}
    ticker = params.get("ticker", "AAPL").upper().strip()

    # ── 1. Fetch live financial data ──
    try:
        data = _fetch_data(ticker)
    except Exception as exc:
        return {
            "statusCode": 502,
            "headers": headers,
            "body": json.dumps({
                "error": "DATA_FETCH_FAILED",
                "message": f"Could not retrieve data for {ticker}: {str(exc)}",
            }),
        }

    # ── 2. Structured response (instant for the frontend) ──
    response_body = {
        "ticker": data["ticker"],
        "company": data["company"],
        "chartData": data["chart_data"],
        "valuation": data["valuation"],
        "analysis": None,
    }

    # ── 3. AI audit via Bedrock ──
    try:
        prompt = _build_prompt(ticker, data)

        bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")

        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1500,
            "messages": [
                {"role": "user", "content": prompt},
            ],
        })

        ai_response = bedrock.invoke_model(
            modelId="anthropic.claude-3-5-sonnet-20240620-v1:0",
            contentType="application/json",
            accept="application/json",
            body=body,
        )

        result = json.loads(ai_response["body"].read())
        response_body["analysis"] = result["content"][0]["text"]
    except Exception as exc:
        response_body["analysis"] = f"[AI analysis unavailable: {str(exc)}]"

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps(response_body),
    }
