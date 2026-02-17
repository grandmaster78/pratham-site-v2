import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.DYNAMO_TABLE_NAME ?? "ads-optimizer-cache";

const ddbClient = new DynamoDBClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(ddbClient);

/**
 * SHA-256 hash of the access token to use as a user-scoped partition key.
 * Never stores the raw token in DynamoDB.
 */
export async function hashToken(accessToken: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(accessToken);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `USER#${hex}`;
}

export interface CacheEntry<T = unknown> {
  data: T;
  source: "mcp" | "demo";
  cachedAt: number;
}

/**
 * Retrieve a cached entry from DynamoDB.
 * Returns null if not found or if TTL has logically expired
 * (DynamoDB TTL deletion is eventually consistent, so we also check client-side).
 */
export async function getCached<T = unknown>(
  userHash: string,
  sortKey: string,
): Promise<CacheEntry<T> | null> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { pk: userHash, sk: sortKey },
      }),
    );

    if (!result.Item) return null;

    const now = Math.floor(Date.now() / 1000);
    if (result.Item.ttl && result.Item.ttl < now) return null;

    return {
      data: JSON.parse(result.Item.data as string) as T,
      source: result.Item.source as "mcp" | "demo",
      cachedAt: result.Item.cachedAt as number,
    };
  } catch (error) {
    console.warn("DynamoDB cache read failed (non-fatal):", error);
    return null;
  }
}

/**
 * Write a cache entry to DynamoDB with a TTL.
 */
export async function setCache(
  userHash: string,
  sortKey: string,
  data: unknown,
  source: "mcp" | "demo",
  ttlSeconds: number,
): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          pk: userHash,
          sk: sortKey,
          data: JSON.stringify(data),
          source,
          cachedAt: now,
          ttl: now + ttlSeconds,
        },
      }),
    );
  } catch (error) {
    console.warn("DynamoDB cache write failed (non-fatal):", error);
  }
}

/** TTL durations in seconds */
export const TTL = {
  ACCOUNTS_LIVE: 86400,    // 24 hours
  CAMPAIGNS_LIVE: 3600,    // 1 hour
  DEMO: 300,               // 5 minutes
} as const;
