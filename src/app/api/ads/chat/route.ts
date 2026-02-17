import { NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { getValidAccessToken } from "@/lib/amazon-auth";
import { createMcpClient } from "@/lib/mcp-client";
import { agenticLoop, directBedrockStream } from "@/lib/bedrock";
import { getDemoCampaignSummary } from "@/lib/demo-data";
import type { Message } from "@aws-sdk/client-bedrock-runtime";

/**
 * POST /api/ads/chat
 * Streaming endpoint for AI-powered campaign recommendations.
 * Falls back to direct Bedrock (no MCP tools) with demo data if MCP is unavailable.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  const accessToken = await getValidAccessToken(session);

  if (!accessToken) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: {
    message?: string;
    history?: Array<{ role: string; content: string }>;
    accountId?: string;
    accountName?: string;
  };

  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { message, history, accountId, accountName } = body;

  if (!message || typeof message !== "string") {
    return new Response(
      JSON.stringify({ error: "message is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const conversationHistory: Message[] = (history ?? []).map((msg) => ({
    role: msg.role === "assistant" ? "assistant" : "user",
    content: [{ text: msg.content }],
  }));

  const accountContext =
    accountId && accountName ? { accountId, accountName } : undefined;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Try MCP-powered agentic loop first; fall back to direct Bedrock with demo data
      let usedMcp = false;

      try {
        const mcpClient = await createMcpClient(accessToken);
        usedMcp = true;

        try {
          const generator = agenticLoop(
            mcpClient,
            message,
            conversationHistory,
            accountContext,
          );

          for await (const chunk of generator) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`),
            );
          }
        } finally {
          await mcpClient.close().catch(() => {});
        }
      } catch (mcpError) {
        // MCP failed — fall back to direct Bedrock with demo campaign data as context
        if (usedMcp) {
          console.warn("MCP agentic loop failed:", mcpError);
        } else {
          console.warn("MCP client connection failed, using direct Bedrock:", mcpError);
        }

        try {
          const campaignContext = accountId
            ? getDemoCampaignSummary(accountId)
            : "No specific account selected. Provide general advertising optimization advice.";

          const generator = directBedrockStream(
            message,
            conversationHistory,
            campaignContext,
            accountContext,
          );

          for await (const chunk of generator) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`),
            );
          }
        } catch (bedrockError) {
          console.error("Direct Bedrock also failed:", bedrockError);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error:
                  bedrockError instanceof Error
                    ? bedrockError.message
                    : "AI service unavailable",
              })}\n\n`,
            ),
          );
        }
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
