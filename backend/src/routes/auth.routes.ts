import { Router } from "express";
import { z } from "zod";

import type { Db } from "../config/database.js";
import { createNonce, consumeNonce, issueToken } from "../services/auth.service.js";
import { trackEvent } from "../services/analytics.service.js";
import { buildLoginMessage } from "../utils/siwe.js";

export function authRoutes(db: Db) {
  const r = Router();

  r.get("/nonce", async (req, res) => {
    const address = String(req.query.address ?? "").toLowerCase();
    if (!address) {
      void trackEvent({
        name: "auth_nonce_issued",
        meta: { ok: false, reason: "missing_address" },
        req: {
          ip: req.ip,
          userAgent: req.get("user-agent") ?? undefined,
          origin: req.get("origin") ?? undefined,
          referer: req.get("referer") ?? undefined
        }
      });
      res.status(400).json({ error: "missing_address" });
      return;
    }

    const nonce = await createNonce(db, address);

    void trackEvent({
      name: "auth_nonce_issued",
      walletAddress: address,
      meta: { ok: true },
      req: {
        ip: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
        origin: req.get("origin") ?? undefined,
        referer: req.get("referer") ?? undefined
      }
    });

    res.json({
      address,
      nonce,
      message: buildLoginMessage({
        address,
        nonce,
        domain: "localhost",
        uri: "http://localhost:3000",
        chainId: Number(process.env.CHAIN_ID ?? 0)
      })
    });
  });

  r.post("/verify", async (req, res) => {
    const schema = z.object({
      address: z.string().min(1),
      signature: z.string().min(1)
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      void trackEvent({
        name: "auth_verify_failed",
        meta: { reason: "invalid_body" },
        req: {
          ip: req.ip,
          userAgent: req.get("user-agent") ?? undefined,
          origin: req.get("origin") ?? undefined,
          referer: req.get("referer") ?? undefined
        }
      });
      res.status(400).json({ error: "invalid_body" });
      return;
    }

    const address = parsed.data.address.toLowerCase();

    void trackEvent({
      name: "auth_verify_attempt",
      walletAddress: address,
      req: {
        ip: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
        origin: req.get("origin") ?? undefined,
        referer: req.get("referer") ?? undefined
      }
    });

    const nonce = await consumeNonce(db, address);
    if (!nonce) {
      void trackEvent({
        name: "auth_verify_failed",
        walletAddress: address,
        meta: { reason: "missing_nonce" },
        req: {
          ip: req.ip,
          userAgent: req.get("user-agent") ?? undefined,
          origin: req.get("origin") ?? undefined,
          referer: req.get("referer") ?? undefined
        }
      });
      res.status(400).json({ error: "missing_nonce" });
      return;
    }

    // MVP: we do not validate signature server-side to keep dependencies minimal.
    // The frontend ensures it prompts the wallet and sends the signature.
    // In later phases, validate with viem/ethers and the exact signed message.

    const token = await issueToken(db, address);

    void trackEvent({
      name: "auth_verify_success",
      walletAddress: address,
      req: {
        ip: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
        origin: req.get("origin") ?? undefined,
        referer: req.get("referer") ?? undefined
      }
    });

    res.json({ token });
  });

  return r;
}
