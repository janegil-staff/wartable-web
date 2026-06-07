// in src/lib/api.js — returns the FULL share payload (character + progress + schedule),
// not just the character, so the dashboard can render the calendar.
export async function fetchShare(code) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  try {
    const res = await fetch(`${base}/share/${encodeURIComponent(code)}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      // map known statuses to the error codes the dashboard expects
      if (res.status === 404) return { error: "not_found" };
      if (res.status === 410) return { error: "expired" };
      if (res.status === 400) return { error: "bad_code" };
      return { error: "server" };
    }
    const data = await res.json();
    return data; // { label, character, progress, schedule, updatedAt } — the WHOLE thing
  } catch {
    return { error: "server" };
  }
}