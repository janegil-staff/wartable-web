// src/lib/wow.js — WoW class colors + faction theming (web copy).
export const CLASS_COLORS = {
  "Death Knight": "#C41E3A", "Demon Hunter": "#A330C9", Druid: "#FF7C0A",
  Evoker: "#33937F", Hunter: "#AAD372", Mage: "#3FC7EB", Monk: "#00FF98",
  Paladin: "#F48CBA", Priest: "#FFFFFF", Rogue: "#FFF468", Shaman: "#0070DD",
  Warlock: "#8788EE", Warrior: "#C69B6D",
};
export const classColor = (c) => CLASS_COLORS[c] || "#C69B6D";

export const QUALITY_COLOR = {
  POOR: "#9d9d9d", COMMON: "#ffffff", UNCOMMON: "#1eff00",
  RARE: "#0070dd", EPIC: "#a335ee", LEGENDARY: "#ff8000", ARTIFACT: "#e6cc80",
};

export function factionTheme(f) {
  if (f === "horde") return { glow: "#8C1616", soft: "rgba(140,22,22,0.18)", label: "Horde" };
  if (f === "alliance") return { glow: "#1C3F87", soft: "rgba(28,63,135,0.18)", label: "Alliance" };
  return { glow: "#3a3a3a", soft: "rgba(80,80,80,0.15)", label: "" };
}
