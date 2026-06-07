// src/components/GearGrid.jsx — clickable gear icons + an item-detail modal.
// Icons only (no list); tapping an item shows full info: stats, sockets,
// enchants, equip/use effects. Steel-and-ember card style. Reads c.equipment
// from the share payload (rich per-item fields captured by the backend).
"use client";
import { useState } from "react";
import { QUALITY_COLOR } from "@/lib/wow";

export default function GearGrid({ c }) {
  const [selected, setSelected] = useState(null);
  const items = c?.equipment ?? [];
  if (!items.length) return null;

  return (
    <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20 }}>
      <h2 className="display" style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ember)", marginBottom: 14 }}>
        Gear · {items.length}
      </h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((it, i) => (
          <button
            key={i}
            onClick={() => setSelected(it)}
            title={it.name}
            style={{
              position: "relative", width: 52, height: 52, borderRadius: 8, overflow: "hidden",
              border: `2px solid ${QUALITY_COLOR[it.quality] || "var(--border)"}`,
              cursor: "pointer", padding: 0, background: "var(--bg-2)",
            }}
          >
            {it.icon
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={it.icon} alt="" style={{ width: "100%", height: "100%", display: "block" }} />
              : <div style={{ width: "100%", height: "100%", background: "var(--surface-2)" }} />}
            {it.ilvl ? (
              <span style={{ position: "absolute", right: 0, bottom: 0, fontSize: 10, fontWeight: 800, color: "#fff", background: "rgba(0,0,0,0.7)", padding: "0 2px" }}>
                {it.ilvl}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {selected ? <ItemModal item={selected} onClose={() => setSelected(null)} /> : null}
    </section>
  );
}

function ItemModal({ item, onClose }) {
  const qc = QUALITY_COLOR[item.quality] || "var(--text)";
  const primaries = (item.stats ?? []).filter((s) => s.isPrimary);
  const secondaries = (item.stats ?? []).filter((s) => !s.isPrimary);

  const StatLine = ({ s }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
      <span className="muted" style={{ fontSize: 13 }}>{s.name}</span>
      <span style={{ color: "var(--text)", fontSize: 13, fontWeight: 700 }}>
        {s.display || (s.value != null ? `+${s.value}` : "")}
      </span>
    </div>
  );

  const block = { borderTop: "1px solid var(--border)", paddingTop: 8, marginTop: 8 };
  const blockLabel = { fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "var(--surface)", border: `2px solid ${qc}`, borderRadius: 16, padding: 20, width: "100%", maxWidth: 400, maxHeight: "82vh", overflowY: "auto" }}
      >
        {/* header */}
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          {item.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.icon} alt="" style={{ width: 54, height: 54, borderRadius: 10, border: `2px solid ${qc}` }} />
          ) : (
            <div style={{ width: 54, height: 54, borderRadius: 10, border: `2px solid ${qc}`, background: "var(--bg-2)" }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ color: qc, fontWeight: 900, fontSize: 17, fontFamily: "'Cinzel',serif" }}>{item.name}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              {[item.slotName, item.itemType].filter(Boolean).join(" · ")}
            </div>
            {item.ilvl ? (
              <div style={{ color: "var(--ember)", fontSize: 13, fontWeight: 800, marginTop: 2 }}>
                Item Level {item.ilvl}
              </div>
            ) : null}
          </div>
        </div>

        {item.binding ? <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>{item.binding}</div> : null}

        {primaries.length ? <div style={block}>{primaries.map((s, i) => <StatLine key={i} s={s} />)}</div> : null}
        {secondaries.length ? <div style={block}>{secondaries.map((s, i) => <StatLine key={i} s={s} />)}</div> : null}

        {item.sockets?.length ? (
          <div style={block}>
            <div style={blockLabel}>Sockets</div>
            {item.sockets.map((sk, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: sk.item ? "var(--ember)" : "var(--text-muted)" }} />
                <span style={{ color: sk.item ? "var(--text)" : "var(--text-muted)", fontSize: 13 }}>
                  {sk.item || sk.display || sk.type || "Empty socket"}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {item.enchant?.length ? (
          <div style={block}>
            <div style={blockLabel}>Enchantments</div>
            {item.enchant.map((e, i) => (
              <div key={i} style={{ color: "#4ade80", fontSize: 13, padding: "2px 0" }}>{e}</div>
            ))}
          </div>
        ) : null}

        {item.effects?.length ? (
          <div style={block}>
            {item.effects.map((ef, i) => (
              <div key={i} style={{ color: "#4ade80", fontSize: 13, padding: "3px 0" }}>{ef.description || ef.name}</div>
            ))}
          </div>
        ) : null}

        {(item.requirement || item.durability || item.sellPrice) ? (
          <div style={{ marginTop: 8 }}>
            {item.requirement ? <div className="muted" style={{ fontSize: 12 }}>{item.requirement}</div> : null}
            {item.durability ? <div className="muted" style={{ fontSize: 12 }}>{item.durability}</div> : null}
            {item.sellPrice ? <div className="muted" style={{ fontSize: 12 }}>{item.sellPrice}</div> : null}
          </div>
        ) : null}

        <button
          onClick={onClose}
          style={{ width: "100%", marginTop: 16, padding: 12, borderRadius: 12, border: "none", cursor: "pointer",
            background: "linear-gradient(180deg, var(--ember-bright), var(--ember))", color: "#1a1206", fontWeight: 700, fontFamily: "'Cinzel',serif" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}