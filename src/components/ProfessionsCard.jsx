// src/components/ProfessionsCard.jsx
"use client";
export default function ProfessionsCard({ professions }) {
  const list = professions ?? [];
  if (!list.length) return null;
  return (
    <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <h2 className="display" style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ember)" }}>Professions</h2>
      </div>
      <div style={{ padding: "4px 20px 16px" }}>
        {list.map((p, i) => {
          const pct = p.skill != null && p.max ? Math.round((p.skill / p.max) * 100) : null;
          return (
            <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: pct != null ? 6 : 0 }}>
                <span style={{ color: "var(--text)", fontWeight: 600 }}>{p.name}</span>
                {p.skill != null && <span className="muted" style={{ fontSize: 13 }}>{p.skill}{p.max ? ` / ${p.max}` : ""}</span>}
              </div>
              {pct != null && (
                <div style={{ height: 6, borderRadius: 3, background: "var(--bg-2)", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, var(--ember), var(--ember-bright))" }} />
                </div>
              )}
              {p.tier && <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>{p.tier}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
