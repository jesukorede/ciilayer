"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletConnect } from "./WalletConnect";

export function Navbar() {
  const path = usePathname();

  return (
    <div className="nav">
      <div className="row" style={{ alignItems: "center", gap: 10 }}>
        <img
          src="/logo.svg"
          alt="CiiLayer"
          width={28}
          height={28}
          style={{ display: "block", background: "var(--color-brand)", borderRadius: 8, padding: 4 }}
        />
        <strong>CiiLayer</strong>
      </div>
      <div className="row nav-links" style={{ alignItems: "center" }}>
        <Link className={path === "/" ? "active" : ""} href="/">
          Home
        </Link>
        <Link className={path?.startsWith("/dashboard") ? "active" : ""} href="/dashboard">
          Dashboard
        </Link>
        <Link className={path?.startsWith("/jobs") ? "active" : ""} href="/jobs">
          Jobs
        </Link>
        <Link className={path?.startsWith("/profile") ? "active" : ""} href="/profile">
          Profile
        </Link>
        <WalletConnect />
      </div>
    </div>
  );
}
