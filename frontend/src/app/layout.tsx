import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CiiLayer MVP",
  description: "Decentralized human + machine coordination on Hedera",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
