"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fetchCharacter } from "@/lib/api";
import Showcase from "@/components/Showcase";
import GearGrid from "@/components/GearGrid";
import ProfessionsCard from "@/components/ProfessionsCard";
import ProgressCalendar from "@/components/ProgressCalendar";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

function pad(n) { return String(n).padStart(2, "0"); }
function monthRange() {
  const n = new Date();
  const from = `${n.getFullYear()}-${pad(n.getMonth() + 1)}-01`;
  const last = new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate();
  const to = `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(last)}`;
  return { from, to };
}

export default function CharacterPage() {
  const { region, realm, name } = useParams();
  const [state, setState] = useState({ loading: true, data: null, error: null });
  const [cal, setCal] = useState(null); // { progress, charEvents, schedule } | null

  useEffect(() => {
    const r = decodeURIComponent(realm);
    const nm = decodeURIComponent(name);

    fetchCharacter({ region, realm: r, name: nm }).then((res) => {
      if (res?.error || !res?.name) setState({ loading: false, data: null, error: res?.error || "server" });
      else setState({ loading: false, data: res, error: null });
    });

    // fetch calendar separately; only show it if the member has data
    const { from, to } = monthRange();
    fetch(`${BASE}/calendar?region=${region}&realm=${encodeURIComponent(r)}&name=${encodeURIComponent(nm)}&from=${from}&to=${to}`, { cache: "no-store" })
      .then((x) => x.json())
      .then((d) => {
        const hasData = (d?.progress?.snapshots?.length > 0) || (d?.charEvents?.length > 0);
        setCal(hasData ? d : null);
      })
      .catch(() => setCal(null));
  }, [region, realm, name]);

  if (state.loading) {
    return (
      <main style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <p className="muted display" style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}>Loading…</p>
      </main>
    );
  }

  if (state.error || !state.data) {
    return (
      <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <h1 className="display" style={{ fontSize: 28, color: "var(--text)" }}>Not found</h1>
          <p className="muted" style={{ marginTop: 10 }}>Couldn’t load this character right now.</p>
        </div>
      </main>
    );
  }

  const character = state.data;
  const hasLeftCol = (character?.equipment?.length > 0) || !!cal;

  return (
    <main style={{ position: "relative", zIndex: 2, minHeight: "100vh", padding: "32px 16px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div className="wt-dashboard-grid" style={{ display: "grid", gridTemplateColumns: hasLeftCol ? "1fr 1fr" : "1fr", gap: 24, alignItems: "start" }}>
          {hasLeftCol && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {cal && (
                <ProgressCalendar
                  progress={cal.progress}
                  charEvents={cal.charEvents ?? []}
                  resets={cal.schedule?.resets ?? []}
                  affixes={cal.schedule?.affixes ?? []}
                />
              )}
              <GearGrid c={character} />
              <ProfessionsCard professions={character?.professions} />
            </div>
          )}
          <div>
            <Showcase c={character} />
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 900px) { .wt-dashboard-grid { grid-template-columns: 1fr !important; } }`}</style>
    </main>
  );
}