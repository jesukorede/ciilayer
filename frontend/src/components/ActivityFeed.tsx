"use client";

import { useEffect, useState } from "react";

import { api } from "../lib/api";

type ActivityItem = {
  ts: string;
  kind: "job" | "machine";
  event: any;
};

export function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      try {
        const out = await api.activity(20);
        if (cancelled) return;
        setEnabled(Boolean(out.enabled));
        setItems(out.items ?? []);
        setError(null);
      } catch (e: any) {
        if (cancelled) return;
        setError(e.message ?? "activity_failed");
      }
    }

    void tick();
    const t = setInterval(() => void tick(), 5000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  return (
    <div className="panel" style={{ marginTop: 10 }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ marginTop: 0, marginBottom: 0 }}>Activity</h3>
        <span className={`badge ${enabled ? "badge-active" : "badge-inactive"}`}>{enabled ? "mirror node" : "disabled"}</span>
      </div>
      {error ? <p style={{ color: "tomato" }}>{error}</p> : null}
      {!items.length ? (
        <p style={{ color: "var(--muted)", marginTop: 10 }}>No activity yet.</p>
      ) : (
        <div style={{ marginTop: 10 }}>
          {items.map((it, idx) => {
            const type = String(it?.event?.type ?? it.kind);
            const wallet = it?.event?.walletAddress ? String(it.event.walletAddress) : "";
            const jobId = it?.event?.jobId ? String(it.event.jobId) : "";

            return (
              <div key={`${it.ts}-${idx}`} className="card-job" style={{ marginBottom: 10 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <strong>{type.replaceAll("_", " ")}</strong>
                  <span className={`badge ${it.kind === "job" ? "badge-available" : "badge-active"}`}>{it.kind}</span>
                </div>
                <div style={{ color: "var(--muted)", marginTop: 6 }}>
                  {jobId ? `job: ${jobId}` : null}
                  {jobId && wallet ? " • " : null}
                  {wallet ? `by: ${wallet.slice(0, 10)}…` : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
