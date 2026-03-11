import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { env } from "../config/env.js";

type AnalyticsEventName =
  | "auth_nonce_issued"
  | "auth_verify_attempt"
  | "auth_verify_success"
  | "auth_verify_failed"
  | "user_me_viewed"
  | "user_me_updated"
  | "pilot_applied"
  | "jobs_listed"
  | "job_created"
  | "job_accepted"
  | "job_completed";

export type TrackEventParams = {
  name: AnalyticsEventName;
  walletAddress?: string;
  jobId?: string;
  meta?: Record<string, unknown>;
  req?: {
    ip?: string;
    userAgent?: string;
    origin?: string;
    referer?: string;
  };
};

let cached: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient | null {
  if (cached) return cached;
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) return null;
  cached = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return cached;
}

export async function trackEvent(params: TrackEventParams): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  const payload = {
    name: params.name,
    wallet_address: params.walletAddress ? String(params.walletAddress).toLowerCase() : null,
    job_id: params.jobId ?? null,
    meta: params.meta ?? null,
    ip: params.req?.ip ?? null,
    user_agent: params.req?.userAgent ?? null,
    origin: params.req?.origin ?? null,
    referer: params.req?.referer ?? null
  };

  try {
    const { error } = await client.from("analytics_events").insert(payload);
    if (error) {
      // eslint-disable-next-line no-console
      console.warn("[analytics] failed to insert event", error.message);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[analytics] unexpected error", e);
  }
}
