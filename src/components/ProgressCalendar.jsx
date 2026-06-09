// src/components/ProgressCalendar.jsx — month calendar for the shared character.
// Colours days by PROGRESS (ilvl/rating/boss-kill diffs from progress.snapshots)
// AND overlays dated history events (charEvents: M+ runs / raid kills /
// achievements) as typed dots, with details in the day modal.
"use client";
import { useState, useMemo } from "react";

function pad(n) { return String(n).padStart(2, "0"); }
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function firstDow(y, m) { return (new Date(y, m, 1).getDay() + 6) % 7; } // Monday=0
function ymd(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}`; }
function todayStr() { const n = new Date(); return ymd(n.getFullYear(), n.getMonth(), n.getDate()); }

function bossTotal(snap) {
  let n = 0;
  (snap?.raids ?? []).forEach((r) => (r.modes ?? []).forEach((m) => { n += m.completed ?? 0; }));
  return n;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["M","T","W","T","F","S","S"];

// event-type → dot colour + human label
const EVENT_META = {
  mplusRun:    { color: "var(--ember-bright, #f0a04b)", label: "Mythic+" },
  raidKill:    { color: "var(--gold, #c8a24a)",         label: "Raid kill" },
  achievement: { color: "var(--alliance, #3fa7ff)",     label: "Achievement" },
};

export default function ProgressCalendar({ progress, charEvents = [], resets = [], affixes = [] }) {
  const snapshots = progress?.snapshots ?? [];

  const byDay = useMemo(() => {
    const map = {};
    snapshots.forEach((s, i) => {
      const prev = snapshots[i - 1];
      const ilvlUp = prev ? (s.ilvl ?? 0) - (prev.ilvl ?? 0) : 0;
      const kills = bossTotal(s);
      const newKills = prev ? Math.max(0, kills - bossTotal(prev)) : 0;
      const ratingUp = prev ? (s.mythicRating ?? 0) - (prev.mythicRating ?? 0) : 0;
      map[s.date] = { snap: s, ilvlUp, newKills, ratingUp, played: s.played };
    });
    return map;
  }, [snapshots]);

  // group dated history events by day → { 'YYYY-MM-DD': [{kind,label}] }
  const eventsByDay = useMemo(() => {
    const map = {};
    (charEvents ?? []).forEach((e) => {
      if (!e?.date) return;
      (map[e.date] ||= []).push(e);
    });
    return map;
  }, [charEvents]);

  const resetSet = useMemo(() => new Set(resets), [resets]);

  const initial = useMemo(() => {
    const last = snapshots[snapshots.length - 1];
    const anchor = last ? last.date : (charEvents[0]?.date ?? null);
    const d = anchor ? new Date(anchor) : new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  }, [snapshots, charEvents]);

  const [month, setMonth] = useState(initial);
  const [modalDate, setModalDate] = useState(null);

  const { y, m } = month;
  const days = daysInMonth(y, m);
  const firstDay = firstDow(y, m);
  const today = todayStr();

  const navBtn = {
    background: "none", border: "1px solid var(--border)", borderRadius: 6,
    width: 28, height: 28, cursor: "pointer", color: "var(--text-muted)",
    fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit",
  };

  const sel = modalDate ? byDay[modalDate] : null;
  const selEvents = modalDate ? (eventsByDay[modalDate] ?? []) : [];
  const selReset = modalDate ? resetSet.has(modalDate) : false;

  // distinct event-kinds present on a day, for the dot row (max 3 dots)
  function dayDots(ds) {
    const evs = eventsByDay[ds] ?? [];
    const kinds = [];
    for (const e of evs) if (!kinds.includes(e.kind)) kinds.push(e.kind);
    return kinds;
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
      {affixes.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ember)", letterSpacing: 1, textTransform: "uppercase" }}>
            This week
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{affixes.join(" · ")}</span>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px 8px" }}>
        <button onClick={() => { const d = new Date(y, m - 1); setMonth({ y: d.getFullYear(), m: d.getMonth() }); }} style={navBtn}>‹</button>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", letterSpacing: 1.2, textTransform: "uppercase", fontFamily: "'Cinzel',serif" }}>
          {MONTHS[m]} {y}
        </span>
        <button onClick={() => { const d = new Date(y, m + 1); setMonth({ y: d.getFullYear(), m: d.getMonth() }); }} style={navBtn}>›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "0 10px", gap: 3 }}>
        {WEEKDAYS.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: "var(--text-muted)", paddingBottom: 4 }}>{d}</div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", padding: "0 10px 12px", gap: 3 }}>
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const ds = ymd(y, m, day);
          const info = byDay[ds];
          const dots = dayDots(ds);
          const isToday = ds === today;
          const isReset = resetSet.has(ds);
          const played = info?.played;
          const hasProgress = info && (info.ilvlUp > 0 || info.newKills > 0 || info.ratingUp > 0);
          const clickable = !!info || isReset || dots.length > 0;

          return (
            <button
              key={day}
              onClick={() => clickable && setModalDate(ds)}
              style={{
                aspectRatio: "1", borderRadius: 10, fontFamily: "inherit",
                border: isToday ? "2px solid var(--ember)" : "1px solid var(--border)",
                background: hasProgress ? "var(--ember)" : played ? "var(--ember-soft, rgba(217,138,61,0.25))" : "var(--bg-2)",
                color: hasProgress ? "#1a1206" : "var(--text)",
                cursor: clickable ? "pointer" : "default",
                position: "relative", display: "flex", alignItems: "flex-start",
                justifyContent: "flex-start", padding: 5, fontSize: 12,
                fontWeight: isToday ? 800 : 600,
              }}
            >
              {day}
              <span style={{
                position: "absolute", bottom: 3, right: 4, left: 4,
                display: "flex", flexWrap: "wrap-reverse", gap: 2,
                justifyContent: "flex-end", alignItems: "flex-end",
              }}>
                {info?.newKills > 0 ? <Dot color="var(--gold)" /> : null}
                {dots.map((k) => <Dot key={k} color={EVENT_META[k]?.color ?? "var(--text-muted)"} />)}
                {isReset ? <Dot color="var(--text-muted)" /> : null}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", padding: "0 14px 14px" }}>
        <LegendItem swatch="var(--ember)" label="Progress" />
        <LegendItem swatch="var(--ember-soft, rgba(217,138,61,0.25))" label="Played" />
        <LegendItem dot={EVENT_META.mplusRun.color} label="Mythic+" />
        <LegendItem dot={EVENT_META.raidKill.color} label="Raid kill" />
        <LegendItem dot={EVENT_META.achievement.color} label="Achievement" />
        <LegendItem dot="var(--text-muted)" label="Reset" />
      </div>

      {modalDate && (sel || selReset || selEvents.length > 0) && (
        <div
          onClick={() => setModalDate(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, width: "100%", maxWidth: 380, maxHeight: "80vh", overflowY: "auto" }}
          >
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 14, fontFamily: "'Cinzel',serif" }}>
              {modalDate}
            </div>

            {sel?.snap && (
              <div style={{ marginBottom: 12 }}>
                <Row label="Item Level" value={sel.snap.ilvl ?? "—"} delta={sel.ilvlUp} />
                <Row label="Mythic+" value={sel.snap.mythicRating ?? "—"} delta={sel.ratingUp} />
                {sel.newKills > 0 && (
                  <div style={{ color: "var(--gold)", fontSize: 14, marginTop: 6 }}>
                    +{sel.newKills} boss {sel.newKills === 1 ? "kill" : "kills"}
                  </div>
                )}
              </div>
            )}

            {selEvents.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                {["mplusRun", "raidKill", "achievement"].map((kind) => {
                  const list = selEvents.filter((e) => e.kind === kind);
                  if (list.length === 0) return null;
                  const meta = EVENT_META[kind];
                  return (
                    <div key={kind} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 4, background: meta.color }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.6 }}>
                          {meta.label}
                        </span>
                      </div>
                      {list.map((e, i) => (
                        <div key={i} style={{ color: "var(--text)", fontSize: 13, padding: "3px 0 3px 14px" }}>
                          {e.label}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {selReset && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>
                  Weekly reset
                </div>
                {affixes.length > 0 && (
                  <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{affixes.join(" · ")}</div>
                )}
              </div>
            )}

            <button
              onClick={() => setModalDate(null)}
              style={{ width: "100%", marginTop: 16, padding: "12px", borderRadius: 12, border: "none", cursor: "pointer",
                background: "linear-gradient(180deg, var(--ember-bright), var(--ember))", color: "#1a1206", fontWeight: 700, fontFamily: "'Cinzel',serif" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Dot({ color }) {
  return <span style={{ width: 9, height: 9, borderRadius: 5, background: color, display: "inline-block" }} />;
}

function LegendItem({ swatch, dot, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      {swatch ? <span style={{ width: 11, height: 11, borderRadius: 3, background: swatch }} />
              : <span style={{ width: 7, height: 7, borderRadius: 4, background: dot }} />}
      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}

function Row({ label, value, delta }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ color: "var(--text-muted)", fontSize: 13 }}>{label}</span>
      <span style={{ color: "var(--text)", fontSize: 14, fontWeight: 700 }}>
        {value}{delta > 0 ? <span style={{ color: "var(--gold)" }}> (+{delta})</span> : null}
      </span>
    </div>
  );
}