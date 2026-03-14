import { Router } from "express";
import { z } from "zod";

import type { Db } from "../config/database.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.middleware.js";
import { trackEvent } from "../services/analytics.service.js";
import { logJobEvent } from "../services/hedera.service.js";
import { acceptJob, completeJob, createJob, listJobs } from "../services/job.service.js";

export function jobRoutes(db: Db) {
  const r = Router();

  r.get("/", async (req, res) => {
    const jobs = await listJobs(db);

    void trackEvent({
      name: "jobs_listed",
      req: {
        ip: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
        origin: req.get("origin") ?? undefined,
        referer: req.get("referer") ?? undefined
      },
      meta: { jobsCount: jobs.length }
    });

    res.json({ jobs });
  });

  r.post("/", requireAuth, async (req: AuthedRequest, res) => {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      requiredSkills: z.array(z.string()).default([])
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "invalid_body" });
      return;
    }

    const job = await createJob(db, {
      ...parsed.data,
      createdBy: req.user!.walletAddress
    });

    void trackEvent({
      name: "job_created",
      walletAddress: req.user!.walletAddress,
      jobId: job.id,
      meta: { title: job.title, requiredSkillsCount: job.requiredSkills.length },
      req: {
        ip: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
        origin: req.get("origin") ?? undefined,
        referer: req.get("referer") ?? undefined
      }
    });

    void logJobEvent({
      type: "job_created",
      walletAddress: req.user!.walletAddress,
      jobId: job.id,
      data: { title: job.title, requiredSkillsCount: job.requiredSkills.length }
    });

    res.json({ job });
  });

  r.post("/:id/accept", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const job = await acceptJob(db, req.params.id, req.user!.walletAddress);
      if (!job) {
        res.status(404).json({ error: "not_found" });
        return;
      }

      void trackEvent({
        name: "job_accepted",
        walletAddress: req.user!.walletAddress,
        jobId: job.id,
        req: {
          ip: req.ip,
          userAgent: req.get("user-agent") ?? undefined,
          origin: req.get("origin") ?? undefined,
          referer: req.get("referer") ?? undefined
        }
      });

      void logJobEvent({
        type: "job_accepted",
        walletAddress: req.user!.walletAddress,
        jobId: job.id
      });

      res.json({ job });
    } catch (e: any) {
      res.status(400).json({ error: String(e?.message ?? e) });
    }
  });

  r.post("/:id/complete", requireAuth, async (req: AuthedRequest, res) => {
    try {
      const job = await completeJob(db, req.params.id, req.user!.walletAddress);
      if (!job) {
        res.status(404).json({ error: "not_found" });
        return;
      }

      void trackEvent({
        name: "job_completed",
        walletAddress: req.user!.walletAddress,
        jobId: job.id,
        req: {
          ip: req.ip,
          userAgent: req.get("user-agent") ?? undefined,
          origin: req.get("origin") ?? undefined,
          referer: req.get("referer") ?? undefined
        }
      });

      void logJobEvent({
        type: "job_completed",
        walletAddress: req.user!.walletAddress,
        jobId: job.id
      });

      res.json({ job });
    } catch (e: any) {
      res.status(400).json({ error: String(e?.message ?? e) });
    }
  });

  return r;
}
