"use client";
// src/components/Header.js — shared web header. Recover-style tab nav (Dashboard
// + Guild) shows once a character is loaded; underline marks the active tab.
// Far-right: theme toggle + exit (clears the entered code, returns to landing).
// Theme persists in a cookie.
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const [theme, setTheme] = useState("dark");
  const [guild, setGuild] = useState(null); // { name, realm, region }
  const pathname = usePathname();
  const router = useRouter();
  const onDashboard = pathname === "/dashboard";

  useEffect(() => {
    const saved = document.cookie.match(/wt_theme=(dark|light)/)?.[1] || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  // Read the active character's guild from the cached share payload so we can
  // show a Guild tab. Re-checks on route change.
  useEffect(() => {
    try {
      const code = sessionStorage.getItem("wt_code");
      if (!code) { setGuild(null); return; }
      const cached = sessionStorage.getItem(`wt_character_${code}`);
      if (!cached) { setGuild(null); return; }
      const data = JSON.parse(cached);
      const c = data?.character;
      if (c?.guild?.name) {
        setGuild({
          name: c.guild.name,
          realm: c.guild.realm || c.realm,
          region: c.region || "eu",
        });
      } else {
        setGuild(null);
      }
    } catch {
      setGuild(null);
    }
  }, [pathname]);

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

  // Recover-style tab: text + active underline, not a pill.
  const guildHref = guild
    ? `/guild/${guild.region}/${encodeURIComponent(guild.realm)}/${encodeURIComponent(guild.name)}`
    : null;
  const onGuild = pathname?.startsWith("/guild/");

  // tabs only exist once a character is loaded (guild present implies loaded)
  const showTabs = !!guild;

  const tabStyle = (active) => ({
    position: "relative",
    display: "flex",
    alignItems: "center",
    height: 40,
    padding: "0 4px",
    color: active ? "var(--text)" : "var(--text-muted)",
    fontSize: 14,
    fontWeight: 700,
    textDecoration: "none",
    letterSpacing: "0.02em",
    transition: "color 140ms ease",
  });

  const underline = (active) => ({
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -15, // sit on the header's bottom border
    height: 2,
    borderRadius: 2,
    background: active ? "var(--ember)" : "transparent",
    transition: "background 140ms ease",
  });

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 10,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px clamp(16px,4vw,40px)",
      borderBottom: "1px solid var(--border)",
      background: "color-mix(in srgb, var(--bg) 85%, transparent)",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <Link
          href="/dashboard"
          className="display"
          style={{ fontSize: 16, fontWeight: 900, letterSpacing: "0.22em", color: "var(--gold)", textTransform: "uppercase", textDecoration: "none" }}
        >
          Wartable
        </Link>

        {showTabs && (
          <nav style={{ display: "flex", alignItems: "center", gap: 22 }} aria-label="Primary">
            <Link href="/dashboard" style={tabStyle(onDashboard)}>
              Character
              <span style={underline(onDashboard)} />
            </Link>
            <Link href={guildHref} style={tabStyle(onGuild)} title={`<${guild.name}>`}>
              Guild
              <span style={underline(onGuild)} />
            </Link>
          </nav>
        )}
      </div>

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