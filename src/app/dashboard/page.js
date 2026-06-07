"use client";
// src/app/dashboard/page.js — shows the character for the code entered on home.
// The code is NOT in the URL; it's read from sessionStorage (set by the home
// form). Fetches client-side and renders the showcase.
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchShare } from "@/lib/api";
import Showcase from "@/components/Showcase";

export default function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState({ loading: true, character: null, error: null });

  useEffect(() => {
    let code = null;
    try { code = sessionStorage.getItem("wt_code"); } catch {}
    if (!code) { router.replace("/"); return; }

    fetchShare(code).then((res) => {
      if (res?.error || !res?.character) {
        setState({ loading: false, character: null, error: res?.error || "server" });
      } else {
        setState({ loading: false, character: res.character, error: null });
      }
    });
  }, [router]);

  if (state.loading) {
    return (
      <main style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <p className="muted display" style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}>Loading…</p>
      </main>
    );
  }

  if (state.error || !state.character) {
    const msg = state.error === "not_found" ? "No character found for that code."
      : state.error === "bad_code" ? "That code isn't valid — it should be 6 digits."
      : state.error === "expired" ? "That code has expired. Ask for a new one."
      : "Couldn't load this character right now.";
    return (
      <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <h1 className="display" style={{ fontSize: 28, color: "var(--text)" }}>Not found</h1>
          <p className="muted" style={{ marginTop: 10 }}>{msg}</p>
          <a href="/" className="display" style={{ display: "inline-block", marginTop: 22, padding: "12px 22px", borderRadius: 12, color: "#1a1206", background: "linear-gradient(180deg, var(--ember-bright), var(--ember))", fontWeight: 700 }}>
            Try another code
          </a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ position: "relative", zIndex: 2, minHeight: "100vh", padding: "32px 16px" }}>
      <Showcase c={state.character} />
    </main>
  );
}
