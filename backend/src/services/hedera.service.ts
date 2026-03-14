import { Client, PrivateKey, TopicMessageSubmitTransaction } from "@hashgraph/sdk";

import { env } from "../config/env.js";

export type HcsEvent = {
  type: string;
  timestamp: string;
  walletAddress?: string;
  jobId?: string;
  data?: Record<string, unknown>;
};

let cachedClient: Client | null = null;

function getClient(): Client | null {
  if (cachedClient) return cachedClient;
  if (!env.hederaAccountId || !env.hederaPrivateKey) return null;

  try {
    cachedClient = Client.forTestnet().setOperator(
      env.hederaAccountId,
      PrivateKey.fromStringECDSA(env.hederaPrivateKey)
    );
    return cachedClient;
  } catch {
    return null;
  }
}

function nowIso() {
  return new Date().toISOString();
}

export function isHcsEnabled(): boolean {
  return Boolean(env.hederaAccountId && env.hederaPrivateKey && env.hederaJobTopicId && env.hederaMachineTopicId);
}

async function submitToTopic(topicId: string | undefined, event: HcsEvent): Promise<void> {
  const client = getClient();
  if (!client) return;
  if (!topicId) return;

  try {
    const msg = Buffer.from(JSON.stringify(event), "utf8");
    await new TopicMessageSubmitTransaction({ topicId, message: msg }).execute(client);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[hcs] submit failed", e);
  }
}

export async function logJobEvent(params: Omit<HcsEvent, "timestamp">): Promise<void> {
  await submitToTopic(env.hederaJobTopicId, { ...params, timestamp: nowIso() });
}

export async function logMachineEvent(params: Omit<HcsEvent, "timestamp">): Promise<void> {
  await submitToTopic(env.hederaMachineTopicId, { ...params, timestamp: nowIso() });
}
