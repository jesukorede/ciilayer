import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function optional(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

export const env = {
  port: Number(process.env.PORT ?? process.env.BACKEND_PORT ?? 4000),
  jwtSecret: required("JWT_SECRET"),
  dbPath: process.env.DB_PATH ?? "./data/ciilayer.sqlite",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  supabaseUrl: optional("SUPABASE_URL"),
  supabaseServiceRoleKey: optional("SUPABASE_SERVICE_ROLE_KEY"),
  hederaAccountId: optional("HEDERA_ACCOUNT_ID"),
  hederaPrivateKey: optional("HEDERA_PRIVATE_KEY"),
  hederaJobTopicId: optional("HEDERA_JOB_TOPIC_ID"),
  hederaMachineTopicId: optional("HEDERA_MACHINE_TOPIC_ID"),
  hederaMirrorNodeBaseUrl: process.env.HEDERA_MIRROR_NODE_BASE_URL ?? "https://testnet.mirrornode.hedera.com"
};
