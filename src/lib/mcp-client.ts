import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_ENDPOINT =
  process.env.AMAZON_ADS_MCP_ENDPOINT ??
  "https://advertising-ai.amazon.com/mcp";

/**
 * Create an MCP client connected to the Amazon Ads MCP server.
 * Each request creates a fresh, stateless connection via Streamable HTTP.
 * Uses Dynamic Account Context mode (no fixed account headers).
 */
export async function createMcpClient(accessToken: string) {
  const transport = new StreamableHTTPClientTransport(
    new URL(MCP_ENDPOINT),
    {
      requestInit: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Amazon-Ads-ClientId": process.env.AMAZON_ADS_CLIENT_ID ?? "",
          Accept: "application/json, text/event-stream",
        },
      },
    },
  );

  const client = new Client(
    { name: "ads-optimizer", version: "1.0.0" },
    { capabilities: {} },
  );

  await client.connect(transport);
  return client;
}

/**
 * List all available tools from the MCP server.
 */
export async function listMcpTools(client: Client) {
  const result = await client.listTools();
  return result.tools;
}

/**
 * Call a specific MCP tool by name with arguments.
 */
export async function callMcpTool(
  client: Client,
  toolName: string,
  args: Record<string, unknown>,
) {
  const result = await client.callTool({ name: toolName, arguments: args });
  return result;
}

/**
 * Convenience: create client, call tool, close client.
 * Handles the full lifecycle for a single tool invocation.
 * On first use per session, logs available tools for debugging.
 */
export async function mcpToolCall(
  accessToken: string,
  toolName: string,
  args: Record<string, unknown>,
) {
  const client = await createMcpClient(accessToken);
  try {
    const tools = await listMcpTools(client);
    const target = tools.find((t) => t.name === toolName);
    if (target) {
      console.log("[mcp] Tool schema for", toolName, ":", JSON.stringify(target.inputSchema).slice(0, 2000));
    }
    return await callMcpTool(client, toolName, args);
  } finally {
    await client.close();
  }
}
