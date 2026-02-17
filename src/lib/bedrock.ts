import {
  BedrockRuntimeClient,
  ConverseStreamCommand,
  type Message,
  type ContentBlock,
  type ToolConfiguration,
  type ToolResultContentBlock,
  type Tool,
} from "@aws-sdk/client-bedrock-runtime";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { callMcpTool, listMcpTools } from "./mcp-client";

const MODEL_ID = "us.anthropic.claude-3-5-sonnet-20241022-v2:0";

const SYSTEM_PROMPT = `You are an expert Amazon Advertising optimization consultant. You have access to tools that connect to the Amazon Ads API via MCP (Model Context Protocol).

Your role is to:
1. Analyze campaign performance data (impressions, clicks, spend, ACOS, ROAS)
2. Identify underperforming and high-potential campaigns
3. Recommend specific budget and bid optimizations with reasoning
4. Explain trade-offs between aggressive and conservative strategies

When making recommendations:
- Always reference specific campaign names and metrics
- Provide concrete numbers (e.g., "increase daily budget from $50 to $75")
- Consider ACOS targets, ROAS, and overall profitability
- Flag campaigns with high spend but low conversion rates
- Identify campaigns with good ACOS that could benefit from budget increases

Be concise and actionable. Format recommendations with clear headers and bullet points.`;

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

/**
 * Convert MCP tool definitions to Bedrock tool configuration format.
 * Uses the discriminated-union shape the SDK expects.
 */
export function mcpToolsToBedrock(
  mcpTools: Awaited<ReturnType<typeof listMcpTools>>,
): ToolConfiguration {
  const tools: Tool[] = mcpTools.map((t) => ({
    toolSpec: {
      name: t.name,
      description: t.description ?? "",
      inputSchema: {
        json: (t.inputSchema ?? {}) as __DocumentType,
      },
    },
  }) as Tool.ToolSpecMember);

  return { tools };
}

// Re-export the internal document type used by the SDK for schema values
type __DocumentType =
  | null
  | boolean
  | number
  | string
  | __DocumentType[]
  | { [key: string]: __DocumentType };

/**
 * Execute the agentic tool-use loop:
 * 1. Send messages to Bedrock
 * 2. If Bedrock requests tool use, execute via MCP
 * 3. Feed results back, repeat until final text response
 *
 * Yields text chunks as they stream in.
 */
export async function* agenticLoop(
  mcpClient: Client,
  userMessage: string,
  conversationHistory: Message[],
  accountContext?: { accountId: string; accountName: string },
): AsyncGenerator<string> {
  const mcpTools = await listMcpTools(mcpClient);
  const toolConfig = mcpToolsToBedrock(mcpTools);

  const contextPrefix = accountContext
    ? `[Context: Currently viewing account "${accountContext.accountName}" (ID: ${accountContext.accountId})]\n\n`
    : "";

  const messages: Message[] = [
    ...conversationHistory,
    {
      role: "user",
      content: [{ text: `${contextPrefix}${userMessage}` }],
    },
  ];

  const MAX_ITERATIONS = 10;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const command = new ConverseStreamCommand({
      modelId: MODEL_ID,
      system: [{ text: SYSTEM_PROMPT }],
      messages,
      toolConfig,
    });

    const response = await bedrockClient.send(command);
    if (!response.stream) break;

    let currentText = "";
    const toolUseBlocks: Array<{
      toolUseId: string;
      name: string;
      input: string;
    }> = [];
    let currentToolUse: {
      toolUseId: string;
      name: string;
      input: string;
    } | null = null;
    let stopReason: string | undefined;

    for await (const event of response.stream) {
      if (event.contentBlockStart?.start?.toolUse) {
        currentToolUse = {
          toolUseId: event.contentBlockStart.start.toolUse.toolUseId ?? "",
          name: event.contentBlockStart.start.toolUse.name ?? "",
          input: "",
        };
      } else if (event.contentBlockDelta?.delta?.toolUse) {
        if (currentToolUse) {
          currentToolUse.input += event.contentBlockDelta.delta.toolUse.input ?? "";
        }
      } else if (event.contentBlockDelta?.delta?.text) {
        const chunk = event.contentBlockDelta.delta.text;
        currentText += chunk;
        yield chunk;
      } else if (event.contentBlockStop && currentToolUse) {
        toolUseBlocks.push(currentToolUse);
        currentToolUse = null;
      } else if (event.messageStop) {
        stopReason = event.messageStop.stopReason;
      }
    }

    // If the model finished with text (not tool use), we're done
    if (stopReason !== "tool_use" || toolUseBlocks.length === 0) {
      break;
    }

    // Build assistant message with text + tool_use blocks
    const assistantContent: ContentBlock[] = [];
    if (currentText) {
      assistantContent.push({ text: currentText });
    }
    for (const tu of toolUseBlocks) {
      let parsedInput: __DocumentType = {};
      try {
        parsedInput = JSON.parse(tu.input) as __DocumentType;
      } catch {
        parsedInput = {};
      }
      assistantContent.push({
        toolUse: {
          toolUseId: tu.toolUseId,
          name: tu.name,
          input: parsedInput,
        },
      } as ContentBlock);
    }

    messages.push({ role: "assistant", content: assistantContent });

    // Execute each tool call via MCP and collect results
    const toolResults: ContentBlock[] = [];
    for (const tu of toolUseBlocks) {
      let parsedInput: Record<string, unknown> = {};
      try {
        parsedInput = JSON.parse(tu.input);
      } catch {
        parsedInput = {};
      }

      yield `\n\n_Calling tool: ${tu.name}..._\n\n`;

      try {
        const result = await callMcpTool(mcpClient, tu.name, parsedInput);
        const resultContent: ToolResultContentBlock[] = [];
        if (result.content && Array.isArray(result.content)) {
          for (const item of result.content) {
            if (
              typeof item === "object" &&
              item !== null &&
              "text" in item &&
              typeof item.text === "string"
            ) {
              resultContent.push({ text: item.text });
            }
          }
        }
        if (resultContent.length === 0) {
          resultContent.push({ text: JSON.stringify(result) });
        }
        toolResults.push({
          toolResult: {
            toolUseId: tu.toolUseId,
            content: resultContent,
          },
        });
      } catch (error) {
        toolResults.push({
          toolResult: {
            toolUseId: tu.toolUseId,
            content: [
              {
                text: `Error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            status: "error",
          },
        });
      }
    }

    messages.push({ role: "user", content: toolResults });

    // Reset for next iteration
    currentText = "";
  }
}

/**
 * Direct Bedrock streaming without MCP tools.
 * Used in demo mode: campaign data is injected into the system prompt
 * so the AI can analyze it and give real recommendations.
 */
export async function* directBedrockStream(
  userMessage: string,
  conversationHistory: Message[],
  campaignContext: string,
  accountContext?: { accountId: string; accountName: string },
): AsyncGenerator<string> {
  const contextPrefix = accountContext
    ? `[Context: Currently viewing account "${accountContext.accountName}" (ID: ${accountContext.accountId})]\n\n`
    : "";

  const demoSystemPrompt = `${SYSTEM_PROMPT}

IMPORTANT: You are currently operating in demo mode without direct API access. The campaign data below has been provided to you as context. Analyze it and provide specific, actionable recommendations based on the numbers.

--- CAMPAIGN DATA ---
${campaignContext}
--- END CAMPAIGN DATA ---`;

  const messages: Message[] = [
    ...conversationHistory,
    {
      role: "user",
      content: [{ text: `${contextPrefix}${userMessage}` }],
    },
  ];

  const command = new ConverseStreamCommand({
    modelId: MODEL_ID,
    system: [{ text: demoSystemPrompt }],
    messages,
  });

  const response = await bedrockClient.send(command);
  if (!response.stream) return;

  for await (const event of response.stream) {
    if (event.contentBlockDelta?.delta?.text) {
      yield event.contentBlockDelta.delta.text;
    }
  }
}
