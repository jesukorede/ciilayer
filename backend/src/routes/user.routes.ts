import { Router } from "express";
import { z } from "zod";

import type { Db } from "../config/database.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.middleware.js";
import { trackEvent } from "../services/analytics.service.js";
import { getUser, updateUser } from "../services/user.service.js";
import { applyForPilot } from "../services/pilot.service.js";

export function userRoutes(db: Db) {
  const r = Router();

  r.get("/me", requireAuth, async (req: AuthedRequest, res) => {
    void trackEvent({
      name: "user_me_viewed",
      walletAddress: req.user!.walletAddress,
      req: {
        ip: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
        origin: req.get("origin") ?? undefined,
        referer: req.get("referer") ?? undefined
      }
    });
    const me = await getUser(db, req.user!.walletAddress);
    res.json({ user: me });
  });

  r.put("/me", requireAuth, async (req: AuthedRequest, res) => {
    const schema = z.object({
      role: z.enum(["human", "machine_owner"]).optional(),
      skills: z.array(z.string()).optional(),
      machines: z
        .array(
          z.object({
            name: z.string().min(1),
            type: z.string().min(1),
            capabilities: z.array(z.string())
          })
        )
        .optional()
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }

    const updated = await updateUser(db, req.user!.walletAddress, parsed.data);

    void trackEvent({
      name: "user_me_updated",
      walletAddress: req.user!.walletAddress,
      meta: { updatedKeys: Object.keys(parsed.data) },
      req: {
        ip: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
        origin: req.get("origin") ?? undefined,
        referer: req.get("referer") ?? undefined
      }
    });

    res.json({ user: updated });
  });

  r.post("/me/pilot/apply", requireAuth, async (req: AuthedRequest, res) => {
    const out = await applyForPilot(db, req.user!.walletAddress);
    if (!out) {
      res.status(404).json({ error: "not_found" });
      return;
    }

    void trackEvent({
      name: "pilot_applied",
      walletAddress: req.user!.walletAddress,
      req: {
        ip: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
        origin: req.get("origin") ?? undefined,
        referer: req.get("referer") ?? undefined
      }
    });

    const me = await getUser(db, req.user!.walletAddress);
    res.json({ user: me });
  });

  return r;
}
