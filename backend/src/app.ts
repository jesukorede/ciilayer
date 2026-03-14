import express from "express";
import cors from "cors";

import type { Db } from "./config/database.js";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/auth.routes.js";
import { userRoutes } from "./routes/user.routes.js";
import { jobRoutes } from "./routes/job.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";
import { activityRoutes } from "./routes/activity.routes.js";

export function createApp(db: Db) {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/auth", authRoutes(db));
  app.use(userRoutes(db));
  app.use("/jobs", jobRoutes(db));
  app.use("/admin", adminRoutes(db));
  app.use("/api", activityRoutes());

  return app;
}
