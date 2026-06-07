"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchShare } from "@/lib/api";
import Showcase from "@/components/Showcase";
import ProgressCalendar from "@/components/ProgressCalendar";

export default function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    let code = null;
    try {
      code = sessionStorage.getItem("wt_code");
    } catch {}
    if (!code) {
      router.replace("/");
      return;
    }

    // cache is keyed to THIS code — a different code won't read stale data
    const cacheKey = `wt_character_${code}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        setState({ loading: false, data: JSON.parse(cached), error: null });
        return;
      }
    } catch {}

    fetchShare(code).then((res) => {
      if (res?.error || !res?.character) {
        setState({ loading: false, data: null, error: res?.error || "server" });
      } else {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(res));
        } catch {}
        setState({ loading: false, data: res, error: null });
      }
    });
  }, [router]);

  if (state.loading) {
    return (
      <main
        style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}
      >
        <p
          className="muted display"
          style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}
        >
          Loading…
        </p>
      </main>
    );
  }

  if (state.error || !state.data) {
    const msg =
      state.error === "not_found"
        ? "No character found for that code."
        : state.error === "bad_code"
          ? "That code isn't valid — it should be 6 digits."
          : state.error === "expired"
            ? "That code has expired. Ask for a new one."
            : "Couldn't load this character right now.";
    return (
      <main
        style={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1
            className="display"
            style={{ fontSize: 28, color: "var(--text)" }}
          >
            Not found
          </h1>
          <p className="muted" style={{ marginTop: 10 }}>
            {msg}
          </p>
          <a
            href="/"
            className="display"
            style={{
              display: "inline-block",
              marginTop: 22,
              padding: "12px 22px",
              borderRadius: 12,
              color: "#1a1206",
              background:
                "linear-gradient(180deg, var(--ember-bright), var(--ember))",
              fontWeight: 700,
            }}
          >
            Try another code
          </a>
        </div>
      </main>
    );
  }

  const { character, progress, schedule } = state.data;

  return (
    <main
      style={{
        position: "relative",
        zIndex: 2,
        minHeight: "100vh",
        padding: "32px 16px",
      }}
    >
      <div
        style={{
          maxWidth: 880,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <Showcase c={character} />
        {progress?.snapshots?.length ? (
          <ProgressCalendar
            progress={progress}
            resets={schedule?.resets ?? []}
            affixes={schedule?.affixes ?? []}
          />
        ) : null}
      </div>
    </main>
  );
}
