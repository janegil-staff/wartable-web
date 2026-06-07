"use client";
// src/components/Header.js — shared web header: Wartable (home) link far-left,
// theme toggle + exit button far-right. The exit button clears the entered code
// and returns to the landing page (the web has no accounts; "exit" = start over).
// Theme persists in a cookie so server-rendered /dashboard pages keep the choice.
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const [theme, setTheme] = useState("dark");
  const pathname = usePathname();
  const router = useRouter();
  const onDashboard = pathname === "/dashboard";

  useEffect(() => {
    const saved = document.cookie.match(/wt_theme=(dark|light)/)?.[1] || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    document.cookie = `wt_theme=${next}; path=/; max-age=31536000`;
  };

  const exit = () => {
    try { sessionStorage.removeItem("wt_code"); } catch {}
    router.push("/");
  };

  const btnStyle = {
    width: 40, height: 40, borderRadius: 999, border: "1px solid var(--border)",
    background: "var(--surface)", color: "var(--text)", cursor: "pointer", fontSize: 18,
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 10,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px clamp(16px,4vw,40px)",
      borderBottom: "1px solid var(--border)",
      background: "color-mix(in srgb, var(--bg) 85%, transparent)",
      backdropFilter: "blur(8px)",
    }}>
      <Link href="/" className="display" style={{ fontSize: 16, fontWeight: 900, letterSpacing: "0.22em", color: "var(--gold)", textTransform: "uppercase" }}>
        Wartable
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={toggle} aria-label="Toggle theme" style={btnStyle}>
          {theme === "dark" ? "☾" : "☀"}
        </button>
        {onDashboard ? (
          <button onClick={exit} aria-label="Exit" title="Exit"
            style={{ ...btnStyle, width: "auto", paddingInline: 16, gap: 6, fontSize: 14, fontWeight: 700 }}>
            <span style={{ fontSize: 16 }}>⎋</span> Exit
          </button>
        ) : null}
      </div>
    </header>
  );
}
