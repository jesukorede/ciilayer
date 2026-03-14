import { Navbar } from "../components/Navbar";

export default function Page() {
  return (
    <main>
      <Navbar />
      <div className="hero">
        <div className="row" style={{ alignItems: "stretch", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 520px", paddingTop: 18 }}>
            <div className="badge">hedera testnet • coordination MVP</div>
            <h1
              style={{
                margin: "14px 0 12px",
                fontSize: "clamp(34px, 6vw, 48px)",
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              A coordination layer for
              <span style={{ display: "block" }}>humans + machines.</span>
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, maxWidth: 560, margin: 0 }}>
              CiiLayer helps you publish capabilities, match to real tasks, and track execution status with wallet-based identities on Hedera.
            </p>
            <div className="row hero-actions" style={{ marginTop: 16 }}>
              <a className="btn secondary" href="/jobs">
                Browse Jobs
              </a>
            </div>
            <div style={{ marginTop: 14, color: "var(--muted)", fontSize: 12, lineHeight: 1.6 }}>
              MVP focus: create → accept → complete. Payments/reputation come later.
            </div>
          </div>

          <div className="panel" style={{ flex: "0 1 460px" }}>
            <h3 style={{ margin: 0 }}>What you can do today</h3>
            <div style={{ height: 10 }} />
            <div className="features-grid">
              <div className="panel feature-card" style={{ boxShadow: "none" }}>
                <div className="badge">Profiles</div>
                <div style={{ marginTop: 10, fontWeight: 700 }}>Skills + capabilities</div>
                <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>
                  Humans list skills. Machine owners list service capabilities.
                </div>
              </div>
              <div className="panel feature-card" style={{ boxShadow: "none" }}>
                <div className="badge">Jobs</div>
                <div style={{ marginTop: 10, fontWeight: 700 }}>Simple lifecycle</div>
                <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>
                  Post tasks, accept them, and mark complete for pilots.
                </div>
              </div>
              <div className="panel feature-card" style={{ boxShadow: "none" }}>
                <div className="badge">Identity</div>
                <div style={{ marginTop: 10, fontWeight: 700 }}>Wallet-based access</div>
                <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>
                  Connect once and use the same account across roles.
                </div>
              </div>
              <div className="panel feature-card" style={{ boxShadow: "none" }}>
                <div className="badge">On-chain hooks</div>
                <div style={{ marginTop: 10, fontWeight: 700 }}>Registry events</div>
                <div style={{ marginTop: 6, color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>
                  Minimal contract for job hashes + completion confirmations.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18 }} className="row">
          <div className="panel" style={{ flex: "1 1 320px" }}>
            <div className="badge">Machine owners</div>
            <h3 style={{ margin: "10px 0 6px" }}>Offer services</h3>
            <p style={{ color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              Represent devices/robots/compute as service entities and surface availability.
            </p>
          </div>
          <div className="panel" style={{ flex: "1 1 320px" }}>
            <div className="badge">Operators</div>
            <h3 style={{ margin: "10px 0 6px" }}>Execute work</h3>
            <p style={{ color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              Accept tasks that need real-world action and coordinate fulfillment.
            </p>
          </div>
          <div className="panel" style={{ flex: "1 1 320px" }}>
            <div className="badge">Job creators</div>
            <h3 style={{ margin: "10px 0 6px" }}>Coordinate teams</h3>
            <p style={{ color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
              Create jobs that require human + machine capabilities and track progress.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
