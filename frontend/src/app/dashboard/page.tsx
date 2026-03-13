"use client";

import { useEffect, useState } from "react";
import { Navbar } from "../../components/Navbar";
import { api } from "../../lib/api";

export default function DashboardPage() {
  const [me, setMe] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [{ user }, { jobs }] = await Promise.all([api.me(), api.jobs()]);
        setMe(user);
        setJobs(jobs);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, []);

  return (
    <main>
      <Navbar />
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Dashboard</h2>
        {error ? <p style={{ color: "tomato" }}>{error}</p> : null}
        {!me ? (
          <p style={{ color: "var(--muted)" }}>Connect wallet to view your dashboard.</p>
        ) : (
          <div className="row">
            <div className="stat-card" style={{ flex: "1 1 320px", minWidth: 0 }}>
              <h3 style={{ marginTop: 0 }}>You</h3>
              <div className="badge badge-active">{me.role}</div>
              <div style={{ height: 8 }} />
              <div
                className={`badge ${
                  me.pilotStatus === "approved"
                    ? "badge-complete"
                    : me.pilotStatus === "applied"
                      ? "badge-pending"
                      : "badge-inactive"
                }`}
              >
                pilot: {me.pilotStatus ?? "none"}
              </div>
              <p style={{ color: "var(--muted)" }}>{me.walletAddress}</p>
              <p>
                <strong>Skills:</strong> {me.skills?.length ? me.skills.join(", ") : "(none)"}
              </p>
              <p>
                <strong>Machines:</strong> {me.machines?.length ? me.machines.length : 0}
              </p>
            </div>
            <div className="panel" style={{ flex: "2 1 420px", minWidth: 0 }}>
              <h3 style={{ marginTop: 0 }}>Jobs</h3>
              <p style={{ color: "var(--muted)" }}>Use the Jobs page to create/accept/complete.</p>
              <div>
                {jobs.slice(0, 5).map((j) => (
                  <div key={j.id} className="card-job" style={{ marginBottom: 10 }}>
                    <div className="row" style={{ justifyContent: "space-between" }}>
                      <strong>{j.title}</strong>
                      <span
                        className={`badge ${
                          j.status === "open"
                            ? "badge-available"
                            : j.status === "accepted"
                              ? "badge-active"
                              : j.status === "completed"
                                ? "badge-complete"
                                : "badge-inactive"
                        }`}
                      >
                        {j.status}
                      </span>
                    </div>
                    <div style={{ color: "var(--muted)", marginTop: 6 }}>{j.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
