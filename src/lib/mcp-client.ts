import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_ENDPOINT =
  process.env.AMAZON_ADS_MCP_ENDPOINT ??
  "https://advertising.amazon.com/mcp";

/**
 * Create an MCP client connected to the Amazon Ads MCP server.
 * Each request creates a fresh, stateless connection via Streamable HTTP.
 */
export async function createMcpClient(accessToken: string) {
  const transport = new StreamableHTTPClientTransport(
    new URL(MCP_ENDPOINT),
    {
      requestInit: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Amazon-Advertising-API-ClientId":
            process.env.AMAZON_ADS_CLIENT_ID ?? "",
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
 */
export async function mcpToolCall(
  accessToken: string,
  toolName: string,
  args: Record<string, unknown>,
) {
  const client = await createMcpClient(accessToken);
  try {
    return await callMcpTool(client, toolName, args);
  } finally {
    await client.close();
  }
}
