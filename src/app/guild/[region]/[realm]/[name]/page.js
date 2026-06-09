"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import { fetchGuild, fetchCharacter } from "@/lib/api";
import { classColor } from "@/lib/wow";
import GearGrid from "@/components/GearGrid";
import ProfessionsCard from "@/components/ProfessionsCard";

function rankLabel(rank) {
  if (rank === 0) return "Guild Master";
  if (rank === 1) return "Officer";
  return `Rank ${rank}`;
}
function rankShort(rank) {
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
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);                 // roster member (thin)
  const [detail, setDetail] = useState({ loading: false, data: null, error: null });
  const cacheRef = useRef({});                                    // name(lower) -> character

  const realmDecoded = decodeURIComponent(realm);

  useEffect(() => {
    fetchGuild({ region, realm: realmDecoded, name: decodeURIComponent(name) }).then((res) => {
      if (res?.error) setState({ loading: false, data: null, error: res.error });
      else setState({ loading: false, data: res, error: null });
    });
  }, [region, realm, name, realmDecoded]);

  const openMember = useCallback((mem) => {
    setSelected(mem);
    const key = String(mem.name).toLowerCase();
    const cached = cacheRef.current[key];
    if (cached) {
      setDetail({ loading: false, data: cached, error: null });
      return;
    }
    setDetail({ loading: true, data: null, error: null });
    // roster has no per-member realm; use the guild realm (works for same-realm members)
    fetchCharacter({ region, realm: realmDecoded, name: mem.name })
      .then((res) => {
        if (res?.error || !res) {
          setDetail({ loading: false, data: null, error: res?.error || "server" });
        } else {
          const character = res.character ?? res;               // tolerate either shape
          cacheRef.current[key] = character;
          setDetail({ loading: false, data: character, error: null });
        }
      })
      .catch(() => setDetail({ loading: false, data: null, error: "network" }));
  }, [region, realmDecoded]);

  const closeModal = useCallback(() => {
    setSelected(null);
    setDetail({ loading: false, data: null, error: null });
  }, []);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, closeModal]);

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

  const filtered = roster.filter((mem) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      String(mem.name ?? "").toLowerCase().includes(q) ||
      String(mem.class ?? "").toLowerCase().includes(q) ||
      String(mem.race ?? "").toLowerCase().includes(q) ||
      rankLabel(mem.rank).toLowerCase().includes(q)
    );
  });

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
              <h2 className="display" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ember)" }}>
                Roster · {filtered.length}{query.trim() && filtered.length !== roster.length ? ` / ${roster.length}` : ""}
              </h2>
              <div style={{ position: "relative", marginTop: 12 }}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, class, race or rank…"
                  aria-label="Search roster"
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "9px 32px 9px 12px",
                    background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10,
                    color: "var(--text)", fontFamily: "inherit", fontSize: 13, outline: "none",
                  }}
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} aria-label="Clear search"
                    style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer",
                      fontSize: 16, lineHeight: 1, padding: 4, fontFamily: "inherit" }}>×</button>
                )}
              </div>
            </div>
            <div style={{ padding: "4px 20px 16px" }}>
              {filtered.length ? (
                filtered.map((mem, i) => {
                  const cc = mem.class ? classColor(mem.class) : "var(--text)";
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => openMember(mem)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 0", border: "none", borderBottom: "1px solid var(--border)",
                        background: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                      }}
                    >
                      <span style={{ flex: 1, color: cc, fontWeight: 600 }}>{mem.name}</span>
                      {mem.level != null && <span className="muted" style={{ fontSize: 12 }}>{mem.level}</span>}
                      <span style={{ fontSize: 11, color: mem.rank === 0 ? "var(--gold)" : "var(--text-muted)", fontWeight: mem.rank <= 1 ? 700 : 400, minWidth: 56, textAlign: "right" }}>{rankShort(mem.rank)}</span>
                    </button>
                  );
                })
              ) : (
                <p className="muted" style={{ padding: "16px 0", textAlign: "center" }}>
                  {query.trim() ? `No members match \u201c${query}\u201d.` : "No members found."}
                </p>
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

      {selected && (
        <MemberModal member={selected} detail={detail} onClose={closeModal} />
      )}

      <style>{`@media (max-width: 760px) { .wt-guild-grid { grid-template-columns: 1fr !important; } }`}</style>
    </main>
  );
}

function Dropdown({ label, count, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 12 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 14px", background: "var(--bg-2)",
          border: "1px solid var(--border)", borderRadius: open ? "12px 12px 0 0" : 12,
          cursor: "pointer", fontFamily: "inherit", color: "var(--text)",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold)", fontFamily: "'Cinzel',serif" }}>
          {label}
        </span>
        <span style={{ display: "flex", alignItems: "center" }}>
          {count != null && count !== "" && (
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>{count}</span>
          )}
          <span style={{
            display: "inline-block", marginLeft: 10, lineHeight: 1, fontSize: 14, color: "var(--text-muted)",
            transition: "transform 160ms ease", transform: open ? "rotate(90deg)" : "rotate(0deg)",
          }}>›</span>
        </span>
      </button>
      {open && (
        <div style={{ border: "1px solid var(--border)", borderTop: "none", borderRadius: "0 0 12px 12px", background: "var(--surface)", padding: 14 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function MemberModal({ member, detail, onClose }) {
  const d = detail.data;
  const cc = member.class ? classColor(member.class) : "var(--gold)";
  const isGM = member.rank === 0;
  const isOfficer = member.rank === 1;
  const initial = String(member.name ?? "?").charAt(0).toUpperCase();

  // portal target only exists on the client
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.66)", backdropFilter: "blur(3px)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 9999, padding: "40px 20px", overflowY: "auto" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`${member.name} details`}
        style={{
          background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18,
          width: "100%", maxWidth: 460, boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
          marginBottom: 40,
        }}
      >
        {/* class-colored header band */}
        <div style={{
          position: "relative",
          padding: "26px 24px 22px",
          background: `linear-gradient(150deg, color-mix(in srgb, ${cc} 30%, var(--surface)) 0%, var(--surface) 75%)`,
          borderBottom: "1px solid var(--border)",
          borderTopLeftRadius: 18, borderTopRightRadius: 18,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {d?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.avatar} alt="" style={{ width: 64, height: 64, borderRadius: 16, flexShrink: 0, border: `2px solid ${cc}`, objectFit: "cover" }} />
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: `color-mix(in srgb, ${cc} 22%, var(--bg-2))`,
                border: `2px solid ${cc}`,
                fontFamily: "'Cinzel',serif", fontWeight: 900, fontSize: 28, color: cc,
                boxShadow: `0 0 24px color-mix(in srgb, ${cc} 35%, transparent)`,
              }}>
                {initial}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="display" style={{ fontSize: 24, fontWeight: 900, color: cc, fontFamily: "'Cinzel',serif", lineHeight: 1.1, wordBreak: "break-word" }}>
                {member.name}
              </div>
              <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                {[d?.spec, member.race, member.class].filter(Boolean).join(" \u00b7 ") || "\u2014"}
              </div>
            </div>
            {d?.ilvl && (
              <div style={{ textAlign: "center", border: `2px solid ${cc}`, borderRadius: 12, padding: "8px 12px", flexShrink: 0 }}>
                <div style={{ color: "var(--text)", fontWeight: 900, fontSize: 20, fontFamily: "'Cinzel',serif" }}>{d.ilvl}</div>
                <div className="muted" style={{ fontSize: 9, letterSpacing: "0.1em" }}>ITEM LVL</div>
              </div>
            )}
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16,
            padding: "5px 12px", borderRadius: 999,
            background: isGM ? "color-mix(in srgb, var(--gold) 18%, transparent)" : "var(--bg-2)",
            border: `1px solid ${isGM ? "var(--gold)" : "var(--border)"}`,
          }}>
            <span style={{ fontSize: 12 }}>{isGM ? "\u2605" : isOfficer ? "\u2726" : "\u2022"}</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: isGM ? "var(--gold)" : "var(--text-muted)" }}>
              {rankLabel(member.rank)}
            </span>
          </div>
        </div>

        {/* body */}
        <div style={{ padding: "18px 24px 8px" }}>
          {detail.loading && (
            <p className="muted" style={{ padding: "30px 0", textAlign: "center", letterSpacing: "0.12em", textTransform: "uppercase", fontSize: 12 }}>
              Loading profile…
            </p>
          )}

          {!detail.loading && detail.error && (
            <p className="muted" style={{ padding: "20px 0", textAlign: "center", fontSize: 13 }}>
              {detail.error === "not_found"
                ? "This member couldn’t be found on the guild realm. They may play on a connected realm."
                : "Couldn’t load this profile right now."}
            </p>
          )}

          {!detail.loading && d && (
            <>
              {/* quick stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
                {[["Level", d.level ?? member.level], ["M+ Rating", d.mythicPlus?.currentRating ?? "—"], ["Achiev.", d.achievementPoints ?? "—"]].map(([l, v]) => (
                  <div key={l} style={{ background: "var(--surface)", padding: "12px 8px", textAlign: "center" }}>
                    <div className="display" style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{v ?? "—"}</div>
                    <div className="muted" style={{ fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* gear — collapsible, reuse existing component */}
              {(d.gear?.length ?? d.items?.length ?? 0) >= 0 && (
                <Dropdown label="Gear" count={d.ilvl ? `${d.ilvl} ilvl` : null}>
                  <GearGrid c={d} />
                </Dropdown>
              )}

              {/* professions — collapsible, reuse existing component */}
              {(d.professions?.length ?? 0) > 0 && (
                <Dropdown label="Professions" count={d.professions.length}>
                  <ProfessionsCard professions={d.professions} />
                </Dropdown>
              )}

              {/* raids — collapsible */}
              {(d.raids?.length ?? 0) > 0 && (
                <Dropdown label="Raids" count={d.raids.length}>
                  {d.raids.map((raid, i) => (
                    <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ fontWeight: 700, color: "var(--text)", fontSize: 14 }}>{raid.name}</div>
                      <div className="muted" style={{ fontSize: 12, display: "flex", gap: 12, flexWrap: "wrap", marginTop: 3 }}>
                        {(raid.modes ?? []).map((m, j) => <span key={j}>{m.difficulty}: {m.completed}/{m.total}</span>)}
                      </div>
                    </div>
                  ))}
                </Dropdown>
              )}
            </>
          )}
        </div>

        <div style={{ padding: "12px 24px 22px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", cursor: "pointer",
              background: "linear-gradient(180deg, var(--ember-bright), var(--ember))", color: "#1a1206",
              fontWeight: 700, fontFamily: "'Cinzel',serif", letterSpacing: "0.04em" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}