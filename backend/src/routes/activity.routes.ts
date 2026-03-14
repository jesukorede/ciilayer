import { Router } from "express";

import { env } from "../config/env.js";

type MirrorNodeMessage = {
  consensus_timestamp: string;
  message: string;
  sequence_number: number;
};

function decodeEvent(base64: string): any | null {
  try {
    const json = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function fetchTopicMessages(topicId: string, limit: number): Promise<Array<{ ts: string; source: string; event: any }>> {
  const base = env.hederaMirrorNodeBaseUrl.replace(/\/$/, "");
  const url = `${base}/api/v1/topics/${encodeURIComponent(topicId)}/messages?limit=${limit}&order=desc`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const body = (await res.json()) as { messages?: MirrorNodeMessage[] };
  const msgs = body.messages ?? [];

  return msgs
    .map((m) => ({
      ts: m.consensus_timestamp,
      source: topicId,
      event: decodeEvent(m.message)
    }))
    .filter((x) => x.event);
}

export function activityRoutes() {
  const r = Router();

  r.get("/activity", async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 20), 100);

    const jobTopicId = env.hederaJobTopicId;
    const machineTopicId = env.hederaMachineTopicId;

    if (!jobTopicId && !machineTopicId) {
      res.json({ enabled: false, items: [] });
      return;
    }

    const [jobItems, machineItems] = await Promise.all([
      jobTopicId ? fetchTopicMessages(jobTopicId, limit) : Promise.resolve([]),
      machineTopicId ? fetchTopicMessages(machineTopicId, limit) : Promise.resolve([])
    ]);

    const items = [...jobItems.map((i) => ({ ...i, kind: "job" as const })), ...machineItems.map((i) => ({ ...i, kind: "machine" as const }))]
      .sort((a, b) => (a.ts < b.ts ? 1 : -1))
      .slice(0, limit);

    res.json({ enabled: true, items });
  });

  return r;
}
