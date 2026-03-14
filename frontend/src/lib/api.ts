const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000").replace(/\/$/, "");

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ciilayer_token") ?? localStorage.getItem("operantx_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) {
    localStorage.removeItem("ciilayer_token");
    localStorage.removeItem("operantx_token");
  } else {
    localStorage.setItem("ciilayer_token", token);
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as any)
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers
    });
  } catch {
    throw new Error("backend_unreachable");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `http_${res.status}`);
  }

  return (await res.json()) as T;
}

export const api = {
  health: () => req<{ ok: boolean }>("/health"),
  nonce: (address: string) => req<{ address: string; nonce: string; message: string }>(`/auth/nonce?address=${address}`),
  verify: (address: string, signature: string) =>
    req<{ token: string }>("/auth/verify", { method: "POST", body: JSON.stringify({ address, signature }) }),
  me: () => req<{ user: any }>("/me"),
  updateMe: (payload: any) => req<{ user: any }>("/me", { method: "PUT", body: JSON.stringify(payload) }),
  applyPilot: () => req<{ user: any }>("/me/pilot/apply", { method: "POST" }),
  activity: (limit = 20) => req<{ enabled: boolean; items: any[] }>(`/api/activity?limit=${limit}`),
  jobs: () => req<{ jobs: any[] }>("/jobs"),
  createJob: (payload: { title: string; description: string; requiredSkills: string[] }) =>
    req<{ job: any }>("/jobs", { method: "POST", body: JSON.stringify(payload) }),
  acceptJob: (id: string) => req<{ job: any }>(`/jobs/${id}/accept`, { method: "POST" }),
  completeJob: (id: string) => req<{ job: any }>(`/jobs/${id}/complete`, { method: "POST" })
};
