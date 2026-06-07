// src/components/Showcase.js — the character display (server component, no state).
import { classColor, QUALITY_COLOR, factionTheme } from "@/lib/wow";

function Section({ title, children }) {
  return (
    <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
      <h2 className="display" style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ember)", marginBottom: 14 }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Showcase({ c }) {
  if (!c) return null;
  const fac = factionTheme(c.faction);
  const cc = classColor(c.class);

  return (
    <div style={{ display: "grid", gap: 18, gridTemplateColumns: "1fr", maxWidth: 760, margin: "0 auto" }}>
      {/* HERO */}
      <div className="rise" style={{ position: "relative", borderRadius: 20, overflow: "hidden", border: `1px solid ${fac.glow}`, minHeight: 420, boxShadow: `0 20px 60px rgba(0,0,0,0.5)` }}>
        {c.videoUrl ? (
          <video autoPlay loop muted playsInline poster={c.render || undefined}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}>
            <source src={c.videoUrl} type="video/mp4" />
          </video>
        ) : c.render ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.render} alt={c.name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: fac.soft }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.85) 100%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 24, display: "flex", alignItems: "flex-end", gap: 16 }}>
          {c.avatar && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.avatar} alt="" style={{ width: 72, height: 72, borderRadius: 14, border: `2px solid ${cc}` }} />
          )}
          <div style={{ flex: 1 }}>
            <h1 className="display" style={{ fontSize: "clamp(28px,5vw,42px)", fontWeight: 900, color: cc, textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
              {c.name}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 16 }}>
              {[c.spec, c.class, c.race].filter(Boolean).join(" · ")}
            </p>
            {c.guild?.name && <p className="muted" style={{ fontSize: 14 }}>&lt;{c.guild.name}&gt; · {c.realmName || c.realm}</p>}
          </div>
          {c.ilvl && (
            <div style={{ textAlign: "center", border: `2px solid ${cc}`, borderRadius: 14, padding: "10px 16px", background: "rgba(0,0,0,0.45)" }}>
              <div style={{ color: "#fff", fontWeight: 900, fontSize: 26, fontFamily: "'Cinzel',serif" }}>{c.ilvl}</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, letterSpacing: "0.1em" }}>ITEM LVL</div>
            </div>
          )}
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="rise rise-2" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--border)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
        {[["Level", c.level], ["M+ Rating", c.mythicPlus?.currentRating ?? "—"], ["Achiev. Pts", c.achievementPoints ?? "—"]].map(([l, v]) => (
          <div key={l} style={{ background: "var(--surface)", padding: "18px 12px", textAlign: "center" }}>
            <div className="display" style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{v ?? "—"}</div>
            <div className="muted" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* GEAR */}
      <div className="rise rise-3">
        <Section title="Gear">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {(c.equipment ?? []).map((it, i) => (
              <div key={i} title={`${it.name} (${it.ilvl ?? ""})`} style={{ position: "relative", width: 52, height: 52, borderRadius: 8, overflow: "hidden", border: `2px solid ${QUALITY_COLOR[it.quality] || "var(--border)"}` }}>
                {it.icon
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={it.icon} alt="" style={{ width: "100%", height: "100%" }} />
                  : <div style={{ width: "100%", height: "100%", background: "var(--surface-2)" }} />}
                {it.ilvl && <span style={{ position: "absolute", right: 0, bottom: 0, fontSize: 10, fontWeight: 800, color: "#fff", background: "rgba(0,0,0,0.7)", padding: "0 2px" }}>{it.ilvl}</span>}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gap: 4 }}>
            {(c.equipment ?? []).map((it, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: QUALITY_COLOR[it.quality] || "var(--text)" }}>{it.name}</span>
                <span className="muted">{it.ilvl ?? ""}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* PROGRESS */}
      <div className="rise rise-3">
        <Section title="Mythic+ & Raids">
          {c.mythicPlus?.currentRating ? (
            <div className="display" style={{ fontSize: 32, fontWeight: 900, color: "var(--gold)", marginBottom: 10 }}>{c.mythicPlus.currentRating}</div>
          ) : null}
          {(c.mythicPlus?.bestRuns ?? []).map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
              <span>{r.dungeon}</span>
              <span style={{ color: r.completed ? "#4ade80" : "var(--text-muted)", fontWeight: 700 }}>+{r.level}</span>
            </div>
          ))}
          {(c.raids ?? []).map((raid, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 700 }}>{raid.name}</div>
              <div className="muted" style={{ fontSize: 13, display: "flex", gap: 14, flexWrap: "wrap", marginTop: 4 }}>
                {(raid.modes ?? []).map((m, j) => <span key={j}>{m.difficulty}: {m.completed}/{m.total}</span>)}
              </div>
            </div>
          ))}
        </Section>
      </div>

      {/* ACHIEVEMENTS */}
      <div className="rise rise-4">
        <Section title={`Achievements · ${c.achievementPoints ?? 0}`}>
          <div style={{ display: "grid", gap: 4, maxHeight: 360, overflowY: "auto" }}>
            {(c.achievementsList ?? []).slice(0, 200).map((a, i) => (
              <div key={a.id ?? i} style={{ padding: "6px 0", borderBottom: "1px solid var(--border)", color: "var(--text)" }}>{a.name}</div>
            ))}
            {!(c.achievementsList?.length) && <span className="muted">—</span>}
          </div>
        </Section>
      </div>

      <footer style={{ textAlign: "center", padding: "20px 0 40px" }}>
        <a href="/" className="display muted" style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase" }}>Wartable</a>
      </footer>
    </div>
  );
}
