// src/components/CharacterStatToggles.jsx — collapsible toggle bars for the
// character page. Each bar shows "Label · count" and expands DOWN with the full
// list (no inner scrollbar — the page grows). Closed by default.
//
// Props:
//   achievements : array — e.g. profile.achievementsList []  ({ name, completedAt })
//   achievementPoints : number — the total shown in the bar (e.g. 700)
//   reputations  : array — e.g. profile.reputations []  ({ name, standing, value })
//
// Wire it as: <CharacterStatToggles
//                achievements={profile.achievementsList}
//                achievementPoints={profile.achievementPoints}
//                reputations={profile.reputations} />
"use client";
import { useState } from "react";

const bar = (open) => ({
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "13px 16px",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: open ? "12px 12px 0 0" : 12,
  cursor: "pointer",
  fontFamily: "inherit",
  color: "var(--text)",
});

const panel = {
  border: "1px solid var(--border)",
  borderTop: "none",
  borderRadius: "0 0 12px 12px",
  background: "var(--bg-2)",
  overflow: "hidden",
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  color: "var(--gold)",
  fontFamily: "'Cinzel',serif",
};

const countStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text-muted)",
};

function Chevron({ open }) {
  return (
    <span
      style={{
        display: "inline-block",
        transition: "transform 160ms ease",
        transform: open ? "rotate(90deg)" : "rotate(0deg)",
        color: "var(--text-muted)",
        fontSize: 14,
        marginLeft: 10,
        lineHeight: 1,
      }}
    >
      ›
    </span>
  );
}

function ToggleBar({ label, count, open, onToggle, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={bar(open)}
      >
        <span style={labelStyle}>{label}</span>
        <span style={{ display: "flex", alignItems: "center" }}>
          <span style={countStyle}>{count}</span>
          <Chevron open={open} />
        </span>
      </button>
      {open && <div style={panel}>{children}</div>}
    </div>
  );
}

function ListRow({ left, right }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        padding: "9px 16px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span style={{ color: "var(--text)", fontSize: 13 }}>{left}</span>
      {right != null && (
        <span style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
          {right}
        </span>
      )}
    </div>
  );
}

function EmptyRow({ text }) {
  return (
    <div style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: 13 }}>
      {text}
    </div>
  );
}

export default function CharacterStatToggles({
  achievements = [],
  achievementPoints,
  reputations = [],
}) {
  const [openAch, setOpenAch] = useState(false);
  const [openRep, setOpenRep] = useState(false);

  const achCount = achievementPoints ?? achievements.length;

  return (
    <div>
      <ToggleBar
        label="Achievements"
        count={achCount}
        open={openAch}
        onToggle={() => setOpenAch((v) => !v)}
      >
        {achievements.length === 0 ? (
          <EmptyRow text="No achievements to show." />
        ) : (
          achievements.map((a, i) => (
            <ListRow
              key={i}
              left={a.name ?? "Achievement"}
              right={a.completedAt ? new Date(a.completedAt).toLocaleDateString() : null}
            />
          ))
        )}
      </ToggleBar>

      <ToggleBar
        label="Reputation"
        count={reputations.length}
        open={openRep}
        onToggle={() => setOpenRep((v) => !v)}
      >
        {reputations.length === 0 ? (
          <EmptyRow text="No reputations to show." />
        ) : (
          reputations.map((r, i) => (
            <ListRow
              key={i}
              left={r.name ?? "Faction"}
              right={r.standing ?? (r.value != null ? String(r.value) : null)}
            />
          ))
        )}
      </ToggleBar>
    </div>
  );
}