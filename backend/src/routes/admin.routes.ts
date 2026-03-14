import { Router } from "express";
import { z } from "zod";

import type { Db } from "../config/database.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { getAnalyticsEvents, isAnalyticsEnabled } from "../services/analytics.service.js";

export function adminRoutes(db: Db) {
  const r = Router();

  r.get("/users", requireAdmin, async (_req, res) => {
    const rows = await db.all<any[]>(
      "SELECT walletAddress, role, pilotStatus, createdAt FROM users ORDER BY createdAt DESC"
    );
    res.json({ users: rows });
  });

  r.post("/users/:walletAddress/pilot-status", requireAdmin, async (req, res) => {
    const schema = z.object({ pilotStatus: z.enum(["none", "applied", "approved"]) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }

    const walletAddress = String(req.params.walletAddress).toLowerCase();
    await db.run(
      "UPDATE users SET pilotStatus = ? WHERE walletAddress = ?",
      parsed.data.pilotStatus,
      walletAddress
    );
    const updated = await db.get<any>(
      "SELECT walletAddress, role, pilotStatus, createdAt FROM users WHERE walletAddress = ?",
      walletAddress
    );

    res.json({ user: updated });
  });

  r.get("/analytics/events", requireAdmin, async (req, res) => {
    const limit = Math.min(Number(req.query.limit ?? 100), 500);
    if (!isAnalyticsEnabled()) {
      res.json({ enabled: false, events: [] });
      return;
    }

    const events = await getAnalyticsEvents({ limit });
    res.json({ enabled: true, events });
  });

  r.get("/analytics/events/:walletAddress", requireAdmin, async (req, res) => {
    const walletAddress = String(req.params.walletAddress).toLowerCase();
    const limit = Math.min(Number(req.query.limit ?? 200), 500);
    if (!isAnalyticsEnabled()) {
      res.json({ enabled: false, events: [] });
      return;
    }

    const events = await getAnalyticsEvents({ walletAddress, limit });
    res.json({ enabled: true, walletAddress, events });
  });

  return r;
}
