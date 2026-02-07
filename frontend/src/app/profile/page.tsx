"use client";

import { useEffect, useState } from "react";
import { Navbar } from "../../components/Navbar";
import { api } from "../../lib/api";

function splitCsv(s: string) {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default function ProfilePage() {
  const [me, setMe] = useState<any>(null);
  const [role, setRole] = useState("human");
  const [skills, setSkills] = useState("");
  const [machineName, setMachineName] = useState("");
  const [machineType, setMachineType] = useState("");
  const [machineCaps, setMachineCaps] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { user } = await api.me();
        setMe(user);
        setRole(user?.role ?? "human");
        setSkills((user?.skills ?? []).join(", "));
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, []);

  async function onSave() {
    setSaved(false);
    setError(null);

    try {
      const machines = [...(me?.machines ?? [])];
      if (machineName && machineType) {
        machines.push({
          name: machineName,
          type: machineType,
          capabilities: splitCsv(machineCaps)
        });
      }

      const { user } = await api.updateMe({
        role,
        skills: splitCsv(skills),
        machines
      });
      setMe(user);
      setMachineName("");
      setMachineType("");
      setMachineCaps("");
      setSaved(true);
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <main>
      <Navbar />
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Profile</h2>
        {error ? <p style={{ color: "tomato" }}>{error}</p> : null}
        {saved ? <p style={{ color: "#34d399" }}>Saved.</p> : null}
        {!me ? (
          <p style={{ color: "var(--muted)" }}>Connect wallet to edit your profile.</p>
        ) : (
          <div className="row">
            <div className="panel" style={{ flex: "1 1 360px", minWidth: 0 }}>
              <label>Role</label>
              <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="human">human</option>
                <option value="machine_owner">machine_owner</option>
              </select>
              <div style={{ height: 10 }} />
              <label>Skills (comma-separated)</label>
              <input className="input" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="programming, diagnostics" />
              <div style={{ height: 10 }} />
              <button className="btn" onClick={onSave}>
                Save
              </button>
            </div>
            <div className="panel" style={{ flex: "1 1 360px", minWidth: 0 }}>
              <h3 style={{ marginTop: 0 }}>Add machine</h3>
              <input className="input" value={machineName} onChange={(e) => setMachineName(e.target.value)} placeholder="Name" />
              <div style={{ height: 10 }} />
              <input className="input" value={machineType} onChange={(e) => setMachineType(e.target.value)} placeholder="Type (robot, sensor, compute...)" />
              <div style={{ height: 10 }} />
              <input className="input" value={machineCaps} onChange={(e) => setMachineCaps(e.target.value)} placeholder="Capabilities (comma-separated)" />
              <div style={{ height: 10 }} />
              <button className="btn secondary" onClick={onSave}>
                Save (incl. machine)
              </button>
              <div style={{ height: 10 }} />
              <div>
                <strong>Machines:</strong>
                <div style={{ marginTop: 8 }}>
                  {(me.machines ?? []).map((m: any, idx: number) => (
                    <div key={idx} className="panel" style={{ marginBottom: 8 }}>
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <strong>{m.name}</strong>
                        <span className="badge">{m.type}</span>
                      </div>
                      <div style={{ color: "var(--muted)", marginTop: 6 }}>{(m.capabilities ?? []).join(", ")}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
