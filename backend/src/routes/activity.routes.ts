import { Router } from "express";

import { env } from "../config/env.js";

type MirrorNodeMessage = {
  consensus_timestamp: string;
  message: string;
  sequence_number: number;
};

type FetchResult = { items: Array<{ ts: string; source: string; event: any }>; warning?: string };

function decodeEvent(base64: string): any | null {
  try {
    const json = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function fetchJsonWithTimeout(url: string, timeoutMs: number): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchTopicMessages(
  topicId: string,
  limit: number
): Promise<FetchResult> {
  const base = env.hederaMirrorNodeBaseUrl.replace(/\/$/, "");
  const url = `${base}/api/v1/topics/${encodeURIComponent(topicId)}/messages?limit=${limit}&order=desc`;

  try {
    const body = (await fetchJsonWithTimeout(url, 8000)) as { messages?: MirrorNodeMessage[] } | null;
    if (!body) return { items: [] };

    const msgs = body.messages ?? [];
    const items = msgs
      .map((m) => ({
        ts: m.consensus_timestamp,
        source: topicId,
        event: decodeEvent(m.message)
      }))
      .filter((x) => x.event);

    return { items };
  } catch (e: any) {
    const message = typeof e?.message === "string" ? e.message : "fetch failed";
    return { items: [], warning: message };
  }
}

export function activityRoutes() {
  const r = Router();

  r.get("/activity", async (req, res) => {
    try {
      const limit = Math.min(Number(req.query.limit ?? 20), 100);

      const jobTopicId = env.hederaJobTopicId;
      const machineTopicId = env.hederaMachineTopicId;

      if (!jobTopicId && !machineTopicId) {
        res.json({ enabled: false, items: [] });
        return;
      }

      const [jobResult, machineResult]: [FetchResult, FetchResult] = await Promise.all([
        jobTopicId ? fetchTopicMessages(jobTopicId, limit) : Promise.resolve<FetchResult>({ items: [], warning: undefined }),
        machineTopicId ? fetchTopicMessages(machineTopicId, limit) : Promise.resolve<FetchResult>({ items: [], warning: undefined })
      ]);

      const warnings = [jobResult.warning, machineResult.warning].filter(Boolean);

      const items = [
        ...jobResult.items.map((i) => ({ ...i, kind: "job" as const })),
        ...machineResult.items.map((i) => ({ ...i, kind: "machine" as const }))
      ]
        .sort((a, b) => (a.ts < b.ts ? 1 : -1))
        .slice(0, limit);

      res.json({ enabled: true, items, warnings });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[activity] failed", e);
      res.json({ enabled: true, items: [], warnings: ["activity feed unavailable"] });
    }
  });

  return r;
}
