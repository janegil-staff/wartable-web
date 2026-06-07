"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Reads the active theme from the DOM so it tracks your existing toggle.
function useIsDark() {
  var [isDark, setIsDark] = useState(true); // dark is the default theme
  useEffect(function () {
    var read = function () {
      var el = document.documentElement;
      var body = document.body;
      var attr = el.getAttribute("data-theme") || body.getAttribute("data-theme");
      if (attr) { setIsDark(attr !== "light"); return; }
      var lightByClass = el.classList.contains("light") || body.classList.contains("light");
      setIsDark(!lightByClass);
    };
    read();
    var obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    obs.observe(document.body, { attributes: true, attributeFilter: ["data-theme", "class"] });
    return function () { obs.disconnect(); };
  }, []);
  return isDark;
}

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const isDark = useIsDark();

  const go = () => {
    const clean = code.replace(/\D/g, "").slice(0, 6);
    if (clean.length !== 6) return;
    try { sessionStorage.setItem("wt_code", clean); } catch {}
    router.push("/dashboard");
  };

  var darkScreens = ["/assets/images/phone-dark-1.png", "/assets/images/phone-dark-2.png", "/assets/images/phone-dark-3.png"];
  var lightScreens = ["/assets/images/phone-light-1.png", "/assets/images/phone-light-2.png", "/assets/images/phone-light-3.png"];
  var screens = isDark ? darkScreens : lightScreens;

  return (
    <main style={{ position: "relative", zIndex: 2, minHeight: "100vh", padding: "clamp(24px,5vw,64px)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "clamp(24px,4vw,56px)", alignItems: "start" }}>
        {/* LEFT — pitch + mockups */}
        <div className="rise">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
            {/* IMAGE 1: LOGO */}
            <div className="ph" style={{ width: 64, height: 64, borderRadius: 16, flexShrink: 0 }}>LOGO</div>
            <div>
              <h1 className="display" style={{ fontSize: "clamp(30px,4vw,46px)", fontWeight: 900, lineHeight: 1.05 }}>
                Your <span style={{ color: "var(--gold)" }}>Character</span>
              </h1>
              <p className="display muted" style={{ fontSize: 12, letterSpacing: "0.25em", textTransform: "uppercase", marginTop: 4 }}>
                Gear · Mythic+ · Raids · Achievements
              </p>
            </div>
          </div>

          <p className="muted" style={{ fontSize: 17, lineHeight: 1.6, maxWidth: 520 }}>
            Every adventurer tells a story. Wartable turns your World of Warcraft character into a
            shareable showcase - full gear, Mythic+ score, raid progress and achievements, straight
            from the game.
          </p>

          {/* 3 phone mockups — real app screenshots, swap with theme */}
          <div style={{ display: "flex", gap: 16, marginTop: 40, alignItems: "flex-end" }}>
            <Phone src={screens[0]} h={300} />
            <Phone src={screens[1]} h={360} featured />
            <Phone src={screens[2]} h={300} />
          </div>

          <div style={{ textAlign: "center", maxWidth: 420, marginTop: 32 }}>
            <p className="muted">Available on App Store and Google Play.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 14 }}>
              <Store label="App Store" />
              <Store label="Google Play" />
            </div>
          </div>
        </div>

        {/* RIGHT — code card */}
        <div className="rise rise-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 70px rgba(0,0,0,0.5)" }}>
          <HeroMedia isDark={isDark} />
          <div style={{ padding: 28 }}>
            <h2 className="display" style={{ textAlign: "center", fontSize: 18, fontWeight: 700, letterSpacing: "0.2em", color: "var(--ember)" }}>
              VIEW A CHARACTER
            </h2>
            <p className="display muted" style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 22, marginBottom: 8 }}>
              Code (from mobile app):
            </p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && go()}
              inputMode="numeric" placeholder="Enter 6-digit code"
              style={{ width: "100%", fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 700, letterSpacing: "0.25em",
                textAlign: "center", padding: "14px", color: "var(--text)", background: "var(--bg-2)",
                border: "1px solid var(--border)", borderRadius: 12, outline: "none" }}
            />
            <button onClick={go}
              style={{ width: "100%", marginTop: 16, padding: "15px", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 15,
                letterSpacing: "0.15em", cursor: "pointer", color: "#1a1206",
                background: "linear-gradient(180deg, var(--ember-bright), var(--ember))", border: "none", borderRadius: 12,
                boxShadow: "0 8px 24px rgba(217,138,61,0.35)" }}>
              START
            </button>
          </div>
        </div>
      </div>

      <footer style={{ textAlign: "center", marginTop: 56, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
        <p className="muted" style={{ fontSize: 13 }}>
          © {new Date().getFullYear()} Qup DA · <a href="mailto:jan.egil.staff@codelab.no" style={{ color: "var(--ember)" }}>jan.egil.staff@codelab.no</a>
        </p>
      </footer>
    </main>
  );
}

function HeroMedia({ isDark }) {
  var src = isDark ? "/assets/images/hero-dark.png" : "/assets/images/hero-light.png";
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt="Wartable"
      style={{ height: 240, width: "100%", objectFit: "cover", objectPosition: "center", display: "block", borderBottom: "1px solid var(--border)" }}
    />
  );
}

function Phone({ src, h, featured }) {
  return (
    <div style={{
      width: h * 0.46, height: h, borderRadius: 26, flexShrink: 0, overflow: "hidden",
      border: `2px solid ${featured ? "var(--ember)" : "var(--border)"}`,
      boxShadow: featured ? "0 18px 40px rgba(217,138,61,0.25)" : "0 12px 30px rgba(0,0,0,0.4)",
      background: "var(--surface)",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Wartable screen" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
    </div>
  );
}

function Store({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "var(--surface-2)",
      border: "1px solid var(--border)", borderRadius: 12, fontWeight: 600, fontSize: 14 }}>
      {label}
    </div>
  );
}