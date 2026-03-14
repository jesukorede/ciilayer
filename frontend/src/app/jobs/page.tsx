"use client";

import { useEffect, useState } from "react";
import { Navbar } from "../../components/Navbar";
import { api } from "../../lib/api";
import { acceptJobOnchain, confirmCompletionOnchain, recordJobOnchain } from "../../lib/registry";

function splitCsv(s: string) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const { jobs } = await api.jobs();
    setJobs(jobs);
  }

  useEffect(() => {
    (async () => {
      try {
        const [{ jobs }, { user }] = await Promise.all([api.jobs(), api.me()]);
        setJobs(jobs);
        setMe(user);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, []);

  async function onCreate() {
    setError(null);
    try {
      const { job } = await api.createJob({ title, description, requiredSkills: splitCsv(requiredSkills) });
      setTitle("");
      setDescription("");
      setRequiredSkills("");

      try {
        await recordJobOnchain(job);
      } catch {
        // best-effort on-chain registry
      }

      await refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function onAccept(id: string) {
    setError(null);
    try {
      await api.acceptJob(id);

      try {
        await acceptJobOnchain(id);
      } catch {
        // best-effort on-chain registry
      }

      await refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function onComplete(id: string) {
    setError(null);
    try {
      await api.completeJob(id);

      try {
        await confirmCompletionOnchain(id);
      } catch {
        // best-effort on-chain registry
      }

      await refresh();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <main>
      <Navbar />
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Jobs</h2>
        {error ? <p style={{ color: "tomato" }}>{error}</p> : null}
        <div className="row">
          <div className="panel" style={{ flex: "1 1 360px", minWidth: 0 }}>
            <h3 style={{ marginTop: 0 }}>Create job</h3>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
            <div style={{ height: 10 }} />
            <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
            <div style={{ height: 10 }} />
            <input
              className="input"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              placeholder="Required skills (comma-separated)"
            />
            <div style={{ height: 10 }} />
            <button className="btn" onClick={onCreate}>
              Create
            </button>
            <p style={{ color: "var(--muted)" }}>
              Note: you must be connected to create jobs.
            </p>
          </div>
          <div className="panel" style={{ flex: "2 1 420px", minWidth: 0 }}>
            <h3 style={{ marginTop: 0 }}>Open jobs</h3>
            {jobs.map((j) => (
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
                <div style={{ marginTop: 8, color: "var(--muted)" }}>
                  Required: {(j.requiredSkills ?? []).length ? j.requiredSkills.join(", ") : "(none)"}
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                  {j.status === "open" ? (
                    <button className="btn secondary" onClick={() => onAccept(j.id)}>
                      Accept
                    </button>
                  ) : null}
                  {j.status === "accepted" ? (
                    <button className="btn" onClick={() => onComplete(j.id)}>
                      Complete
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
