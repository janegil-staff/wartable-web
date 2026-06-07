// src/lib/api.js — fetch a shared character by code from the backend.
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export async function fetchShare(code) {
  const clean = String(code || "").replace(/\D/g, "").slice(0, 6);
  if (clean.length !== 6) return { error: "bad_code" };
  try {
    const res = await fetch(`${BASE}/share/${clean}`, { cache: "no-store" });
    if (res.status === 404) return { error: "not_found" };
    if (!res.ok) return { error: "server" };
    return await res.json(); // { label, character, updatedAt }
  } catch {
    return { error: "network" };
  }
}
