import { useState } from "react";

const defaultColor = "#fb4f2b";

const tabs = ["music", "map", "notes", "settings"];

const TabIcon = ({ tab }) => {
  const icons = {
    music: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 12V4l7-1.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="4.5" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="11.5" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    map: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 3.5l4.5-1.5 5 1.5 4.5-1.5v10L10.5 13.5 5.5 12 1 13.5V3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M5.5 2v10M10.5 3.5V13.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    notes: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 6h6M5 8.5h6M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    settings: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.2 3.2l.85.85M11.95 11.95l.85.85M3.2 12.8l.85-.85M11.95 4.05l.85-.85" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  };
  return icons[tab] || null;
};

const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

const PlaceholderTab = ({ name, accent }) => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: "16px",
    opacity: 0.35,
    userSelect: "none",
  }}>
  <div style={{
    width: "64px",
    height: "64px",
    border: `2px solid ${accent}`,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: accent,
    transform: "scale(1)",
  }}>
  <TabIcon tab={name} />
  </div>
  <p style={{ fontFamily: "'Courier New', monospace", fontSize: "12px", color: accent, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>
  {name} — coming soon
  </p>
  </div>
);

const SettingsTab = ({ accent, setAccent }) => {
  const presets = ["#fb4f2b", "#e63946", "#f4a261", "#2ec4b6", "#8338ec", "#06d6a0", "#118ab2"];

  return (
    <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: "32px" }}>
    <div>
    <p style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: "16px", margin: "0 0 16px" }}>
    primary color
    </p>
    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
    <div style={{ position: "relative" }}>
    <input
    type="color"
    value={accent}
    onChange={(e) => setAccent(e.target.value)}
    style={{
      width: "48px",
      height: "48px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      padding: 0,
      background: "none",
    }}
    />
    </div>
    <input
    type="text"
    value={accent}
    onChange={(e) => {
      const v = e.target.value;
      if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setAccent(v);
    }}
    style={{
      background: "rgba(255,255,255,0.04)",
          border: `1px solid rgba(${hexToRgb(accent)}, 0.3)`,
          borderRadius: "6px",
          color: "#ccc",
          fontFamily: "'Courier New', monospace",
          fontSize: "14px",
          padding: "10px 14px",
          width: "120px",
          outline: "none",
    }}
    />
    </div>
    </div>

    <div>
    <p style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, margin: "0 0 16px" }}>
    presets
    </p>
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
    {presets.map((c) => (
      <button
      key={c}
      onClick={() => setAccent(c)}
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: c,
        border: accent === c ? `3px solid #fff` : "3px solid transparent",
        cursor: "pointer",
        outline: "none",
        transition: "transform 0.15s",
        transform: accent === c ? "scale(1.15)" : "scale(1)",
      }}
      />
    ))}
    </div>
    </div>

    <div>
    <p style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, margin: "0 0 16px" }}>
    preview
    </p>
    <div style={{
      padding: "16px 20px",
      borderRadius: "8px",
      border: `1px solid rgba(${hexToRgb(accent)}, 0.25)`,
          background: `rgba(${hexToRgb(accent)}, 0.06)`,
          display: "flex",
          alignItems: "center",
          gap: "12px",
    }}>
    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: accent }} />
    <span style={{ fontFamily: "'Courier New', monospace", fontSize: "13px", color: accent }}>
    saturn — dm toolkit
    </span>
    </div>
    </div>
    </div>
  );
};

export default function Saturn() {
  const [activeTab, setActiveTab] = useState("music");
  const [accent, setAccent] = useState(defaultColor);

  const rgb = hexToRgb(accent);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#0e0e0e",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      fontFamily: "sans-serif",
    }}>

    {/* Header */}
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "18px 24px 14px",
      borderBottom: `1px solid rgba(255,255,255,0.06)`,
    }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
    <span style={{
      fontFamily: "'Courier New', monospace",
      fontSize: "22px",
      fontWeight: "700",
      letterSpacing: "0.12em",
      color: accent,
      textShadow: `0 0 24px rgba(${rgb}, 0.5)`,
    }}>
    ◉ SATURN
    </span>
    <span style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>
    dm toolkit
    </span>
    </div>
    <div style={{
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: accent,
      boxShadow: `0 0 8px ${accent}`,
      animation: "pulse 2s infinite",
    }} />
    </div>

    {/* Tabs */}
    <div style={{
      display: "flex",
      gap: "2px",
      padding: "0 24px",
      borderBottom: `1px solid rgba(255,255,255,0.06)`,
          background: "rgba(0,0,0,0.3)",
          overflowX: "auto",
    }}>
    {tabs.map((tab) => {
      const isActive = activeTab === tab;
      return (
        <button
        key={tab}
        onClick={() => setActiveTab(tab)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          padding: "12px 16px",
          background: "none",
          border: "none",
          borderBottom: isActive ? `2px solid ${accent}` : "2px solid transparent",
          color: isActive ? accent : "rgba(255,255,255,0.3)",
              cursor: "pointer",
              fontFamily: "'Courier New', monospace",
              fontSize: "11px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              transition: "color 0.2s, border-color 0.2s",
              marginBottom: "-1px",
              whiteSpace: "nowrap",
              flexShrink: 0,
        }}
        >
        <TabIcon tab={tab} />
        <span className="tab-label">{tab}</span>
        </button>
      );
    })}
    </div>

    {/* Content */}
    <div style={{ flex: 1, overflow: "auto" }}>
    {activeTab === "settings" ? (
      <SettingsTab accent={accent} setAccent={setAccent} />
    ) : (
      <PlaceholderTab name={activeTab} accent={accent} />
    )}
    </div>

    {/* Footer */}
    <div style={{
      padding: "10px 24px",
      borderTop: `1px solid rgba(255,255,255,0.04)`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
    }}>
    <span style={{ fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.12)", textTransform: "uppercase" }}>
    v0.1.0
    </span>
    <span style={{ fontFamily: "'Courier New', monospace", fontSize: "9px", letterSpacing: "0.2em", color: `rgba(${rgb}, 0.3)`, textTransform: "uppercase" }}>
    session active
    </span>
    </div>

    <style>{`
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
      * { box-sizing: border-box; }
      @media (max-width: 400px) {
        .tab-label { display: none; }
      }
      `}</style>
      </div>
  );
}
