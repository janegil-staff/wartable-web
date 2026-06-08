"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchGuild } from "@/lib/api";
import { classColor } from "@/lib/wow";

function rankLabel(rank) {
  if (rank === 0) return "GM";
  if (rank === 1) return "Officer";
  return `Rank ${rank}`;
}
function fmtActivity(act) {
  if (act.detail) return act.detail;
  if (act.type) return String(act.type).replace(/_/g, " ");
  return "Activity";
}
function timeAgo(ms) {
  if (!ms) return "";
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function GuildPage() {
  const { region, realm, name } = useParams();
  const [state, setState] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    fetchGuild({
      region,
      realm: decodeURIComponent(realm),
      name: decodeURIComponent(name),
    }).then((res) => {
      if (res?.error) setState({ loading: false, data: null, error: res.error });
      else setState({ loading: false, data: res, error: null });
    });
  }, [region, realm, name]);

  if (state.loading) {
    return (
      <main style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <p className="muted display" style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}>Loading guild…</p>
      </main>
    );
  }
  if (state.error || !state.data) {
    return (
      <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <h1 className="display" style={{ fontSize: 28, color: "var(--text)" }}>Guild not found</h1>
          <p className="muted" style={{ marginTop: 10 }}>Couldn’t load this guild right now.</p>
        </div>
      </main>
    );
  }

  const g = state.data;
  const roster = g.roster ?? [];
  const activity = g.activity ?? [];

  return (
    <main style={{ position: "relative", zIndex: 2, minHeight: "100vh", padding: "32px 16px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
          <h1 className="display" style={{ fontSize: "clamp(24px,4vw,34px)", fontWeight: 900, color: "var(--gold)", fontFamily: "'Cinzel',serif" }}>
            &lt;{g.name || decodeURIComponent(name)}&gt;
          </h1>
          <div className="muted" style={{ fontSize: 14, marginTop: 6, display: "flex", gap: 16, flexWrap: "wrap" }}>
            {g.realmName && <span>{g.realmName}</span>}
            {g.faction && <span style={{ textTransform: "capitalize" }}>{g.faction}</span>}
            {g.memberCount != null && <span>{g.memberCount} members</span>}
            {g.achievementPoints != null && <span>{g.achievementPoints} achievement pts</span>}
          </div>
        </div>

        <div className="wt-guild-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <h2 className="display" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ember)" }}>Roster · {roster.length}</h2>
            </div>
            <div style={{ padding: "4px 20px 16px" }}>
              {roster.length ? (
                roster.map((mem, i) => {
                  const cc = mem.class ? classColor(mem.class) : "var(--text)";
                  return (
                    <Link key={i} href={`/character/${region}/${encodeURIComponent(realm)}/${encodeURIComponent(mem.name)}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)", textDecoration: "none" }}>
                      <span style={{ flex: 1, color: cc, fontWeight: 600 }}>{mem.name}</span>
                      {mem.level != null && <span className="muted" style={{ fontSize: 12 }}>{mem.level}</span>}
                      <span style={{ fontSize: 11, color: mem.rank === 0 ? "var(--gold)" : "var(--text-muted)", fontWeight: mem.rank <= 1 ? 700 : 400, minWidth: 56, textAlign: "right" }}>{rankLabel(mem.rank)}</span>
                    </Link>
                  );
                })
              ) : (
                <p className="muted" style={{ padding: "16px 0", textAlign: "center" }}>No members found.</p>
              )}
            </div>
          </section>

          <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <h2 className="display" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ember)" }}>Recent Activity</h2>
            </div>
            <div style={{ padding: "4px 20px 16px" }}>
              {activity.length ? (
                activity.map((act, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ flex: 1, color: "var(--text)", fontSize: 13 }}>
                      {act.characterName ? <strong style={{ fontWeight: 600 }}>{act.characterName}</strong> : null}
                      {act.characterName ? " — " : ""}
                      {fmtActivity(act)}
                    </span>
                    <span className="muted" style={{ fontSize: 11 }}>{timeAgo(act.timestamp)}</span>
                  </div>
                ))
              ) : (
                <p className="muted" style={{ padding: "16px 0", textAlign: "center" }}>No recent activity.</p>
              )}
            </div>
          </section>
        </div>

        <footer style={{ textAlign: "center", padding: "8px 0 40px" }}>
          <a href="/" className="display muted" style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase" }}>Wartable</a>
        </footer>
      </div>
      <style>{`@media (max-width: 760px) { .wt-guild-grid { grid-template-columns: 1fr !important; } }`}</style>
    </main>
  );
}
