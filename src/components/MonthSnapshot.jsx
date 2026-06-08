// src/components/MonthSnapshot.jsx — full-width snapshot strip above the
// dashboard grid. A row of metric tiles, each showing the current value and
// the change vs. baseline. Computed entirely from progress.snapshots.
"use client";
import { useMemo } from "react";

function bossTotal(snap) {
  let n = 0;
  (snap?.raids ?? []).forEach((r) => (r.modes ?? []).forEach((m) => { n += m.completed ?? 0; }));
  return n;
}
function ym(d) { return (d || "").slice(0, 7); }
function fmtDate(ms) {
  if (!ms) return null;
  try { return new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" }); }
  catch { return null; }
}

export default function MonthSnapshot({ progress, character }) {
  const snapshots = progress?.snapshots ?? [];
  const view = useMemo(() => {
    if (!snapshots.length) return null;
    const latest = snapshots[snapshots.length - 1];
    const latestMonth = ym(latest.date);
    let baseline = null;
    for (let i = snapshots.length - 1; i >= 0; i--) {
      if (ym(snapshots[i].date) < latestMonth) { baseline = snapshots[i]; break; }
    }
    const comparingMonths = !!baseline;
    if (!baseline) baseline = snapshots.find((s) => ym(s.date) === latestMonth) ?? latest;
    const metrics = [
      { key: "ilvl", label: "Item Level", now: latest.ilvl ?? 0, was: baseline.ilvl ?? 0 },
      { key: "mplus", label: "Mythic+", now: Math.round(latest.mythicRating ?? 0), was: Math.round(baseline.mythicRating ?? 0) },
      { key: "level", label: "Level", now: latest.level ?? 0, was: baseline.level ?? 0 },
      { key: "kills", label: "Boss Kills", now: bossTotal(latest), was: bossTotal(baseline) },
      { key: "achv", label: "Achiev. Pts", now: latest.achievementPoints ?? 0, was: baseline.achievementPoints ?? 0 },
    ].map((m) => ({ ...m, delta: m.now - m.was }));
    const monthSnaps = snapshots.filter((s) => ym(s.date) === latestMonth);
    const playedDays = monthSnaps.filter((s) => s.played).length;
    let streak = 0;
    for (let i = monthSnaps.length - 1; i >= 0; i--) { if (monthSnaps[i].played) streak++; else break; }
    return { metrics, playedDays, streak, comparingMonths };
  }, [snapshots]);

  if (!view) return null;
  const { metrics, playedDays, streak, comparingMonths } = view;
  const lastLogin = fmtDate(character?.lastLogin);
  const tiles = [
    ...metrics.map((m) => ({ label: m.label, value: m.now, delta: m.delta })),
    { label: "Day Streak", value: streak, accent: "var(--ember)" },
    { label: "Days Played", value: playedDays },
  ];
  if (lastLogin) tiles.push({ label: "Last Login", value: lastLogin, small: true });

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Snapshot</span>
        <span className="display" style={{ fontSize: 11, color: "var(--gold)", letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Cinzel',serif" }}>
          {comparingMonths ? "vs. last month" : "this month so far"}
        </span>
      </div>
      <div className="wt-snapshot-tiles" style={{ display: "grid", gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))`, gap: 1, background: "var(--border)" }}>
        {tiles.map((t, i) => (
          <div key={i} style={{ background: "var(--surface)", padding: "16px 10px", textAlign: "center", minWidth: 0 }}>
            <div className="display" style={{ fontSize: t.small ? 16 : 22, fontWeight: 800, color: t.accent || "var(--text)", fontFamily: "'Cinzel',serif", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {t.value}
            </div>
            {t.delta != null && t.delta !== 0 && (
              <div style={{ fontSize: 11, fontWeight: 700, color: t.delta > 0 ? "#4ade80" : "var(--text-muted)", marginTop: 2 }}>
                {t.delta > 0 ? `↑ +${t.delta}` : t.delta}
              </div>
            )}
            <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>{t.label}</div>
          </div>
        ))}
      </div>
      <style>{`@media (max-width: 720px) { .wt-snapshot-tiles { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; } }`}</style>
    </div>
  );
}
