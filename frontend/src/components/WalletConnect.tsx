"use client";

import { useEffect, useState } from "react";
import { api, setToken } from "../lib/api";
import { connectInjectedWallet, connectWalletConnect, disconnectWallet, signMessage } from "../lib/wallet";

export function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showChooser, setShowChooser] = useState(false);

  const isMobile = typeof window !== "undefined" ? /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) : false;
  const wcEnabled = Boolean(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID);

  const metamaskDeepLink = (() => {
    if (typeof window === "undefined") return "";
    const url = window.location.href;
    return `https://metamask.app.link/dapp/${url.replace(/^https?:\/\//, "")}`;
  })();

  useEffect(() => {
    const a = localStorage.getItem("ciilayer_address") ?? localStorage.getItem("operantx_address");
    if (a) setAddress(a);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (msg: string) => {
      if (!msg) return;
      if (/Failed to connect to MetaMask/i.test(msg)) {
        setError("Failed to connect to MetaMask. Make sure the extension is unlocked, then try again.");
      }
    };

    const onError = (ev: ErrorEvent) => {
      handler(String(ev?.message ?? ""));
      if (/Failed to connect to MetaMask/i.test(String(ev?.message ?? ""))) {
        ev.preventDefault();
        return true;
      }
      return false;
    };

    const onUnhandled = (ev: PromiseRejectionEvent) => {
      const reason: any = ev?.reason;
      const msg = String(reason?.message ?? reason ?? "");
      handler(msg);
      if (/Failed to connect to MetaMask/i.test(msg)) {
        ev.preventDefault();
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandled);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandled);
    };
  }, []);

  async function connectAndLogin(connectFn: () => Promise<`0x${string}`>) {
    setBusy(true);
    setError(null);
    try {
      const addr = await connectFn();
      const { message } = await api.nonce(addr);
      const sig = await signMessage(message, addr);
      const { token } = await api.verify(addr, sig);

      setToken(token);
      localStorage.setItem("ciilayer_address", addr);
      setAddress(addr);
      setShowChooser(false);
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg === "backend_unreachable") {
        setError("Backend is not reachable.");
      } else if (msg === "no_wallet") {
        setError(isMobile ? "No wallet detected in this browser." : "No wallet detected (install MetaMask/Rabby). ");
      } else if (/Failed to connect to MetaMask/i.test(msg)) {
        setError("Failed to connect to MetaMask. Make sure the extension is unlocked, then try again.");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  function onOpenChooser() {
    setError(null);
    setShowChooser(true);
  }

  function onDisconnect() {
    setToken(null);
    localStorage.removeItem("ciilayer_address");
    localStorage.removeItem("operantx_address");
    setAddress(null);
    disconnectWallet().catch(() => {});
  }

  if (!address) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, position: "relative" }}>
        <button className="btn" onClick={onOpenChooser} disabled={busy}>
          {busy ? "Connecting..." : "Connect Wallet"}
        </button>
        {showChooser ? (
          <div
            className="panel"
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              zIndex: 50,
              width: "min(92vw, 280px)",
              padding: 12
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>Choose wallet</strong>
              <button
                className="btn secondary"
                onClick={() => setShowChooser(false)}
                style={{ padding: "6px 10px" }}
                disabled={busy}
              >
                Close
              </button>
            </div>
            <div style={{ height: 10 }} />
            <button className="btn" onClick={() => connectAndLogin(connectInjectedWallet)} disabled={busy}>
              MetaMask / Browser Wallet
            </button>
            <div style={{ height: 8 }} />
            <button
              className="btn secondary"
              onClick={() =>
                wcEnabled ? connectAndLogin(connectWalletConnect) : setError("WalletConnect is not configured on this site.")
              }
              disabled={busy}
            >
              WalletConnect
            </button>
            {isMobile ? (
              <>
                <div style={{ height: 8 }} />
                <a className="btn secondary" href={metamaskDeepLink} target="_blank" rel="noreferrer">
                  Open in MetaMask
                </a>
              </>
            ) : null}
          </div>
        ) : null}
        {isMobile ? (
          <a className="btn secondary" href={metamaskDeepLink} target="_blank" rel="noreferrer">
            Open in MetaMask
          </a>
        ) : null}
        {error === "No wallet detected in this browser." && isMobile && wcEnabled ? (
          <div style={{ color: "var(--muted)", fontSize: 12, maxWidth: 240, textAlign: "right" }}>
            Tip: if you don’t have MetaMask mobile, use WalletConnect QR from a desktop browser.
          </div>
        ) : null}
        {error === "No wallet detected in this browser." && !wcEnabled ? (
          <div style={{ color: "var(--muted)", fontSize: 12, maxWidth: 220, textAlign: "right" }}>
            Tip: install MetaMask mobile or open this site inside a wallet browser.
          </div>
        ) : null}
        {error ? <div style={{ color: "tomato", fontSize: 12 }}>{error}</div> : null}
      </div>
    );
  }

  return (
    <button className="btn secondary" onClick={onDisconnect}>
      {address.slice(0, 6)}…{address.slice(-4)}
    </button>
  );
}
