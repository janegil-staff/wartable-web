// src/components/PhoneMockups.js
"use client";

// `isDark` comes from the same state your theme toggle already controls.
// Pass it down from page.js: <PhoneMockups isDark={isDark} />
export default function PhoneMockups({ isDark }) {
  var screens = isDark
    ? ["/screens/dark-1.png", "/screens/dark-2.png", "/screens/dark-3.png"]
    : ["/screens/light-1.png", "/screens/light-2.png", "/screens/light-3.png"];

  // center phone (index 1) is raised + ember-bordered, matching your current layout
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
      {screens.map(function (src, i) {
        var isCenter = i === 1;
        return (
          <div
            key={i}
            style={{
              width: 150,
              aspectRatio: "9 / 19.5",
              borderRadius: 26,
              overflow: "hidden",
              transform: isCenter ? "translateY(-22px) scale(1.06)" : "none",
              border: isCenter ? "2px solid var(--ember)" : "1px solid var(--border)",
              boxShadow: isCenter
                ? "0 18px 40px rgba(0,0,0,0.45), 0 0 30px rgba(199,123,51,0.25)"
                : "0 10px 24px rgba(0,0,0,0.30)",
              background: "var(--surface)",
            }}
          >
            <img
              src={src}
              alt={"Wartable screen " + (i + 1)}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        );
      })}
    </div>
  );
}