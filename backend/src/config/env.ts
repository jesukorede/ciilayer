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
  dbPath: process.env.DB_PATH ?? "./data/operantx.sqlite",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  supabaseUrl: optional("SUPABASE_URL"),
  supabaseServiceRoleKey: optional("SUPABASE_SERVICE_ROLE_KEY")
};
