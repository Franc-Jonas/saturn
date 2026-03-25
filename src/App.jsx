import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";

const defaultColor = "#fb4f2b";
const tabs = ["music", "map", "notes", "files", "settings"];
const mono = "'Courier New', monospace";

const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

const ICONS = {
  upload: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  note: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
  folder: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  chevronRight: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  chevronDown: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  // music waveform icon for audio files
  audio: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  // pdf icon
  pdf: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13h1.5a1.5 1.5 0 0 1 0 3H9v-3zM9 13V10"/><path d="M14 13v6m0-6h2a1.5 1.5 0 0 1 0 3h-2"/><path d="M18 13v6"/></svg>,
};

const PROJECT_ICONS = [
  { id: "sword", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M14 2l4 4-9 9-2 1 1-2 9-9zM2 18l3-3M11 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: "skull", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C6.686 2 4 4.686 4 8c0 2.21 1.19 4.14 2.97 5.22L7 15h6l.03-1.78C14.81 12.14 16 10.21 16 8c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.5"/><path d="M7 15v2h6v-2M8 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg> },
  { id: "castle", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 18V8h3V6h2V4h1V2h2v2h1v2h2v2h3v10H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 18v-4h4v4" stroke="currentColor" strokeWidth="1.5"/><path d="M3 8h14" stroke="currentColor" strokeWidth="1.5"/></svg> },
  { id: "dragon", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3c-1 0-2 .5-2.5 1.5L6 7l-3 1 2 2-1 3 3-1 2 2 2-2 3 1-1-3 2-2-3-1-1.5-2.5C13 4 12 3 10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 9v5M8 16l2 2 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: "map", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 4.5l5.5-2 5 2 5.5-2v13l-5.5 2-5-2-5.5 2V4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M7.5 2.5v13M12.5 4.5v13" stroke="currentColor" strokeWidth="1.5"/></svg> },
  { id: "potion", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 3h4M7 7l-3 7a3 3 0 006 0V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M13 7l3 7a3 3 0 01-3 3H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M7 7h6" stroke="currentColor" strokeWidth="1.5"/></svg> },
  { id: "scroll", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="5" y="3" width="11" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2" stroke="currentColor" strokeWidth="1.5"/><path d="M9 8h5M9 11h5M9 14h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { id: "shield", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L4 5v5c0 4 2.67 7.33 6 8 3.33-.67 6-4 6-8V5l-6-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: "flame", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2c0 4-4 5-4 9a4 4 0 008 0c0-4-4-5-4-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg> },
  { id: "eye", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg> },
  { id: "crown", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 15h14M3 15l2-8 4 4 3-6 3 6 4-4 2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: "dice", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="7" cy="7" r="1" fill="currentColor"/><circle cx="13" cy="7" r="1" fill="currentColor"/><circle cx="10" cy="10" r="1" fill="currentColor"/><circle cx="7" cy="13" r="1" fill="currentColor"/><circle cx="13" cy="13" r="1" fill="currentColor"/></svg> },
];

const TabIcon = ({ tab }) => {
  const icons = {
    music: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12V4l7-1.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="4.5" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="11.5" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>,
    map: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 3.5l4.5-1.5 5 1.5 4.5-1.5v10L10.5 13.5 5.5 12 1 13.5V3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M5.5 2v10M10.5 3.5V13.5" stroke="currentColor" strokeWidth="1.5"/></svg>,
    notes: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 6h6M5 8.5h6M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    files: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h4l2 2h6v8H2V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
    settings: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.2 3.2l.85.85M11.95 11.95l.85.85M3.2 12.8l.85-.85M11.95 4.05l.85-.85" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  };
  return icons[tab] || null;
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const ProjectIcon = ({ iconId, size = 20, color = "currentColor" }) => {
  const icon = PROJECT_ICONS.find(i => i.id === iconId);
  if (!icon) return null;
  return <span style={{ color, display: "flex", alignItems: "center", justifyContent: "center", width: size, height: size }}>{icon.svg}</span>;
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────

const LoginScreen = ({ accent }) => {
  const rgb = hexToRgb(accent);
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } });
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0e0e0e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "40px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <span style={{ fontFamily: mono, fontSize: "36px", fontWeight: "700", letterSpacing: "0.12em", color: accent, textShadow: `0 0 32px rgba(${rgb},0.5)` }}>◉ SATURN</span>
        <span style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>dm toolkit</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%", maxWidth: "320px", padding: "0 24px" }}>
        <button onClick={handleLogin} disabled={loading}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", width: "100%", padding: "14px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "rgba(255,255,255,0.85)", fontFamily: mono, fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1, transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor = `rgba(${rgb},0.4)`; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}>
          <GoogleIcon />
          {loading ? "redirecting..." : "sign in with google"}
        </button>
        <p style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.15)", textTransform: "uppercase", margin: 0, textAlign: "center" }}>your sessions sync across devices</p>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
};

// ─── MODALS ───────────────────────────────────────────────────────────────────

const CreateProjectModal = ({ accent, onClose, onSave }) => {
  const rgb = hexToRgb(accent);
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("sword");
  const handleSave = () => { if (!name.trim()) return; onSave({ name: name.trim(), icon: selectedIcon }); };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "28px", width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <p style={{ fontFamily: mono, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, margin: 0 }}>new campaign</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>name</label>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSave()} placeholder="e.g. curse of strahd"
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(${rgb},0.25)`, borderRadius: "6px", color: "#ddd", fontFamily: mono, fontSize: "13px", padding: "10px 14px", outline: "none", width: "100%" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>icon</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px" }}>
            {PROJECT_ICONS.map(icon => (
              <button key={icon.id} onClick={() => setSelectedIcon(icon.id)} style={{ padding: "10px", background: selectedIcon === icon.id ? `rgba(${rgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${selectedIcon === icon.id ? `rgba(${rgb},0.5)` : "rgba(255,255,255,0.08)"}`, borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: selectedIcon === icon.id ? accent : "rgba(255,255,255,0.4)", transition: "all 0.15s" }}>
                {icon.svg}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "rgba(255,255,255,0.5)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "7px 14px", cursor: "pointer" }}>cancel</button>
          <button onClick={handleSave} disabled={!name.trim()} style={{ background: name.trim() ? `rgba(${rgb},0.15)` : "transparent", border: `1px solid ${name.trim() ? `rgba(${rgb},0.4)` : "rgba(255,255,255,0.08)"}`, borderRadius: "6px", color: name.trim() ? accent : "rgba(255,255,255,0.2)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "7px 14px", cursor: name.trim() ? "pointer" : "not-allowed", transition: "all 0.15s" }}>create</button>
        </div>
      </div>
    </div>
  );
};

const RenameModal = ({ accent, project, onClose, onSave }) => {
  const rgb = hexToRgb(accent);
  const [name, setName] = useState(project.name);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "28px", width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <p style={{ fontFamily: mono, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, margin: 0 }}>rename campaign</p>
        <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && name.trim() && onSave(name.trim())}
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(${rgb},0.25)`, borderRadius: "6px", color: "#ddd", fontFamily: mono, fontSize: "13px", padding: "10px 14px", outline: "none", width: "100%" }} />
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "rgba(255,255,255,0.5)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "7px 14px", cursor: "pointer" }}>cancel</button>
          <button onClick={() => name.trim() && onSave(name.trim())} style={{ background: `rgba(${rgb},0.15)`, border: `1px solid rgba(${rgb},0.4)`, borderRadius: "6px", color: accent, fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "7px 14px", cursor: "pointer" }}>save</button>
        </div>
      </div>
    </div>
  );
};

// ─── PROJECT LIST ──────────────────────────────────────────────────────────────

const ProjectList = ({ accent, projects, onOpen, onCreate, onRename, onDelete }) => {
  const rgb = hexToRgb(accent);
  const [menuOpen, setMenuOpen] = useState(null);
  const [renaming, setRenaming] = useState(null);
  return (
    <>
      <div style={{ padding: "32px 28px", display: "flex", flexDirection: "column", gap: "24px", height: "100%", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: 0 }}>your campaigns</p>
          <button onClick={onCreate}
            style={{ background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.3)`, borderRadius: "6px", color: accent, fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "7px 14px", cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = `rgba(${rgb},0.18)`}
            onMouseLeave={e => e.currentTarget.style.background = `rgba(${rgb},0.1)`}>
            + new
          </button>
        </div>
        {projects.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", opacity: 0.3 }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="8" y="8" width="32" height="32" rx="4" stroke={accent} strokeWidth="1.5"/><path d="M24 18v12M18 24h12" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/></svg>
            <p style={{ fontFamily: mono, fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: accent, margin: 0 }}>no campaigns yet</p>
            <p style={{ fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.3)", margin: 0 }}>click + new to create one</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {projects.map(p => (
              <div key={p.id} style={{ position: "relative", display: "flex", alignItems: "center", gap: "14px", padding: "14px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = `rgba(${rgb},0.2)`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
                onClick={() => onOpen(p)}>
                <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.2)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ProjectIcon iconId={p.icon} size={20} color={accent} />
                </div>
                <span style={{ fontFamily: mono, fontSize: "13px", color: "rgba(255,255,255,0.8)", flex: 1, letterSpacing: "0.05em" }}>{p.name}</span>
                <div style={{ position: "relative" }} onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === p.id ? null : p.id); }}>
                  <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", padding: "4px 8px", borderRadius: "4px", fontSize: "16px", lineHeight: 1 }}
                    onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}>···</button>
                  {menuOpen === p.id && (
                    <>
                      <div onClick={e => { e.stopPropagation(); setMenuOpen(null); }} style={{ position: "fixed", inset: 0, zIndex: 9 }} />
                      <div style={{ position: "absolute", right: 0, top: "28px", zIndex: 10, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px", minWidth: "130px", display: "flex", flexDirection: "column", gap: "2px" }}>
                        <button onClick={e => { e.stopPropagation(); setMenuOpen(null); setRenaming(p); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 10px", cursor: "pointer", borderRadius: "4px", textAlign: "left" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                          onMouseLeave={e => e.currentTarget.style.background = "none"}>rename</button>
                        <button onClick={e => { e.stopPropagation(); setMenuOpen(null); onDelete(p.id); }} style={{ background: "none", border: "none", color: "rgba(255,80,80,0.6)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 10px", cursor: "pointer", borderRadius: "4px", textAlign: "left" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,80,80,0.08)"}
                          onMouseLeave={e => e.currentTarget.style.background = "none"}>delete</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {renaming && <RenameModal accent={accent} project={renaming} onClose={() => setRenaming(null)} onSave={name => { onRename(renaming.id, name); setRenaming(null); }} />}
    </>
  );
};

// ─── TABS ──────────────────────────────────────────────────────────────────────

const PlaceholderTab = ({ name, accent }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px", opacity: 0.35, userSelect: "none" }}>
    <div style={{ width: "64px", height: "64px", border: `2px solid ${accent}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
      <TabIcon tab={name} />
    </div>
    <p style={{ fontFamily: mono, fontSize: "12px", color: accent, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>{name} — coming soon</p>
  </div>
);

// ─── MAP TAB ───────────────────────────────────────────────────────────────────

const MapTab = ({ accent, activeProject, session, onUpdateMap, onClearMap }) => {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const rgb = hexToRgb(accent);

  // reset pan/zoom when map changes
  useEffect(() => { setTransform({ x: 0, y: 0, scale: 1 }); }, [activeProject.map_url]);

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${session.user.id}/${activeProject.id}/map.${ext}`;
    const { error } = await supabase.storage.from("campaign_files").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("campaign_files").getPublicUrl(path);
      onUpdateMap(data.publicUrl);
    } else {
      alert("Map upload failed: " + error.message);
    }
    setUploading(false);
  };

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => {
      const newScale = Math.min(Math.max(t.scale * delta, 0.1), 10);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { ...t, scale: newScale };
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      return {
        scale: newScale,
        x: cx - (cx - t.x) * (newScale / t.scale),
        y: cy - (cy - t.y) * (newScale / t.scale),
      };
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.style.cursor = "grabbing";
  };

  const handleMouseMove = (e) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }));
  };

  const handleMouseUp = (e) => {
    isPanning.current = false;
    e.currentTarget.style.cursor = "grab";
  };

  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  const handleClear = async () => {
    onClearMap();
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)", flexShrink: 0 }}>
        <button onClick={resetView} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "5px", color: "rgba(255,255,255,0.4)", fontFamily: mono, fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 10px", cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(${rgb},0.3)`; e.currentTarget.style.color = accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
          reset view
        </button>
        <span style={{ fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>
          {Math.round(transform.scale * 100)}%
        </span>
        <div style={{ flex: 1 }} />
        {activeProject.map_url && (
          <button onClick={handleClear} style={{ background: "none", border: "1px solid rgba(255,80,80,0.2)", borderRadius: "5px", color: "rgba(255,100,100,0.5)", fontFamily: mono, fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 10px", cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,80,80,0.5)"; e.currentTarget.style.color = "rgba(255,100,100,0.9)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,80,80,0.2)"; e.currentTarget.style.color = "rgba(255,100,100,0.5)"; }}>
            clear map
          </button>
        )}
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onMouseDown={activeProject.map_url ? handleMouseDown : undefined}
        onMouseMove={activeProject.map_url ? handleMouseMove : undefined}
        onMouseUp={activeProject.map_url ? handleMouseUp : undefined}
        onMouseLeave={activeProject.map_url ? handleMouseUp : undefined}
        style={{ flex: 1, background: "#050505", overflow: "hidden", position: "relative", cursor: activeProject.map_url ? "grab" : "default", outline: dragging ? `2px dashed rgba(${rgb},0.5)` : "2px dashed transparent", transition: "outline-color 0.2s" }}>
        {activeProject.map_url ? (
          <div style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
            <img
              src={activeProject.map_url}
              alt="map"
              draggable={false}
              style={{ maxWidth: "none", maxHeight: "none", display: "block", userSelect: "none" }}
            />
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", opacity: dragging ? 0.6 : 0.2, color: accent, transition: "opacity 0.2s" }}>
            {ICONS.upload}
            <p style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>
              {uploading ? "uploading..." : "drag map image here"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── NOTES TAB ──────────────────────────────────────────────────────────────────

const NotesTab = ({ accent, activeProject, session }) => {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [viewMode, setViewMode] = useState("edit");
  const [draggedId, setDraggedId] = useState(null);
  const [itemMenuOpen, setItemMenuOpen] = useState(null);
  const nameDebounceRef = useRef(null);
  const rgb = hexToRgb(accent);

  const fetchNotes = async () => {
    const { data } = await supabase.from("notes").select("*").eq("project_id", activeProject.id).order("created_at", { ascending: true });
    if (data) setNotes(data);
  };

  useEffect(() => { fetchNotes(); }, [activeProject.id]);

  const activeNote = notes.find(n => n.id === activeNoteId) || null;

  const createItem = async (isFolder = false, parentId = null, customName = null) => {
    const name = customName || (isFolder ? "New Folder" : "Untitled Note");
    const { data, error } = await supabase.from("notes").insert({ project_id: activeProject.id, name, content: "", is_folder: isFolder, parent_id: parentId }).select().single();
    if (error) { console.error("Failed to create note:", error); alert(`Failed to create: ${error.message}`); return null; }
    if (data) { setNotes(prev => [...prev, data]); if (!isFolder) { setActiveNoteId(data.id); setViewMode("edit"); } }
    return data;
  };

  const updateNote = async (id, content) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content } : n));
    await supabase.from("notes").update({ content }).eq("id", id);
  };

  const deleteNote = async (id) => {
    await supabase.from("notes").delete().eq("id", id);
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) setActiveNoteId(null);
  };

  const renameNote = async (id, newName) => {
    if (!newName || !newName.trim()) return;
    const trimmed = newName.trim();
    setNotes(prev => prev.map(n => n.id === id ? { ...n, name: trimmed } : n));
    await supabase.from("notes").update({ name: trimmed }).eq("id", id);
  };

  const toggleFolder = (id) => {
    setExpanded(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const handleDragStart = (e, id) => { setDraggedId(id); e.dataTransfer.effectAllowed = "move"; };

  const handleDrop = async (e, targetId) => {
    e.preventDefault(); e.stopPropagation();
    if (!draggedId || draggedId === targetId) return;
    let isDescendant = false;
    let curr = targetId ? notes.find(n => n.id === targetId) : null;
    while (curr && curr.parent_id) {
      if (curr.parent_id === draggedId) { isDescendant = true; break; }
      curr = notes.find(n => n.id === curr.parent_id);
    }
    if (isDescendant) return;
    setNotes(prev => prev.map(n => n.id === draggedId ? { ...n, parent_id: targetId } : n));
    await supabase.from("notes").update({ parent_id: targetId }).eq("id", draggedId);
    setDraggedId(null);
  };

  const handleLinkClick = async (linkName) => {
    let note = notes.find(n => n.name.toLowerCase() === linkName.toLowerCase() && !n.is_folder);
    if (note) { setActiveNoteId(note.id); setViewMode("read"); }
    else { await createItem(false, null, linkName); setViewMode("edit"); }
  };

  const renderContent = (content) => {
    const parts = [];
    let lastIndex = 0;
    const bracketRegex = /\[\[(.*?)\]\]/g;
    let match;
    while ((match = bracketRegex.exec(content)) !== null) {
      if (match.index > lastIndex) parts.push(content.substring(lastIndex, match.index));
      const linkName = match[1];
      parts.push(<span key={match.index} onClick={() => handleLinkClick(linkName)} style={{ color: accent, textDecoration: "underline", cursor: "pointer" }}>{linkName}</span>);
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) parts.push(content.substring(lastIndex));
    return <div style={{ flex: 1, padding: "24px", color: "rgba(255,255,255,0.75)", fontFamily: mono, fontSize: "13px", lineHeight: 1.8, overflowY: "auto", whiteSpace: "pre-wrap" }}>{parts}</div>;
  };

  const renderTree = (parentId = null, depth = 0) =>
    notes.filter(n => n.parent_id === parentId).map(n => (
      <div key={n.id} style={{ position: "relative" }}>
        <div draggable onDragStart={e => handleDragStart(e, n.id)}
          onDragOver={e => { if (n.is_folder && draggedId !== n.id) e.preventDefault(); }}
          onDrop={e => { if (n.is_folder) handleDrop(e, n.id); }}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: `5px 6px 5px ${12 + depth * 14}px`, cursor: "pointer", background: activeNoteId === n.id ? `rgba(${rgb},0.12)` : "transparent", color: activeNoteId === n.id ? accent : "rgba(255,255,255,0.55)", borderRadius: "4px", transition: "all 0.15s", userSelect: "none" }}
          onMouseEnter={e => { if (activeNoteId !== n.id) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
          onMouseLeave={e => { if (activeNoteId !== n.id) e.currentTarget.style.background = "transparent"; }}
          onClick={() => { if (n.is_folder) toggleFolder(n.id); else { setActiveNoteId(n.id); setViewMode("read"); } }}>
          <span style={{ opacity: 0.5, flexShrink: 0 }}>{n.is_folder ? (expanded.has(n.id) ? ICONS.chevronDown : ICONS.chevronRight) : <span style={{ width: 10, display: "inline-block" }} />}</span>
          <span style={{ opacity: 0.6, flexShrink: 0 }}>{n.is_folder ? ICONS.folder : ICONS.note}</span>
          <span style={{ fontFamily: mono, fontSize: "11px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.name}</span>
          {/* three-dots menu trigger */}
          <div style={{ position: "relative", flexShrink: 0 }} onClick={e => { e.stopPropagation(); setItemMenuOpen(itemMenuOpen === n.id ? null : n.id); }}>
            <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", padding: "2px 4px", fontSize: "13px", lineHeight: 1, borderRadius: "3px", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}>
              ···
            </button>
            {itemMenuOpen === n.id && (
              <>
                <div onClick={e => { e.stopPropagation(); setItemMenuOpen(null); }} style={{ position: "fixed", inset: 0, zIndex: 9 }} />
                <div style={{ position: "absolute", right: 0, top: "22px", zIndex: 20, background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", padding: "5px", minWidth: "120px", display: "flex", flexDirection: "column", gap: "2px", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
                  <button onClick={e => { e.stopPropagation(); setItemMenuOpen(null); const newName = window.prompt("Rename:", n.name); renameNote(n.id, newName); }}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 10px", cursor: "pointer", borderRadius: "4px", textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    rename
                  </button>
                  <button onClick={e => { e.stopPropagation(); setItemMenuOpen(null); deleteNote(n.id); }}
                    style={{ background: "none", border: "none", color: "rgba(255,80,80,0.6)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 10px", cursor: "pointer", borderRadius: "4px", textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,80,80,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        {n.is_folder && expanded.has(n.id) && renderTree(n.id, depth + 1)}
      </div>
    ));

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <div onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, null)}
        style={{ width: "220px", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", gap: "6px", padding: "10px 10px 8px" }}>
          <button onClick={() => createItem(false)} style={{ flex: 1, background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "5px", color: "rgba(255,255,255,0.4)", fontFamily: mono, fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 4px", cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(${rgb},0.3)`; e.currentTarget.style.color = accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>+ note</button>
          <button onClick={() => createItem(true)} style={{ flex: 1, background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "5px", color: "rgba(255,255,255,0.4)", fontFamily: mono, fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 4px", cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(${rgb},0.3)`; e.currentTarget.style.color = accent; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>+ folder</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 6px" }}>{renderTree()}</div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {activeNote ? (
          <>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: "12px" }}>
              <input value={activeNote.name} onChange={e => {
                const val = e.target.value;
                setNotes(prev => prev.map(n => n.id === activeNote.id ? { ...n, name: val } : n));
                clearTimeout(nameDebounceRef.current);
                nameDebounceRef.current = setTimeout(() => {
                  supabase.from("notes").update({ name: val }).eq("id", activeNote.id);
                }, 500);
              }}
                style={{ background: "none", border: "none", outline: "none", color: "#fff", fontFamily: mono, fontSize: "13px", fontWeight: "500", flex: 1, letterSpacing: "0.05em" }} />
              <button onClick={() => setViewMode(viewMode === "edit" ? "read" : "edit")}
                style={{ background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.3)`, borderRadius: "4px", color: accent, fontFamily: mono, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "4px 8px", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = `rgba(${rgb},0.2)`}
                onMouseLeave={e => e.currentTarget.style.background = `rgba(${rgb},0.1)`}>
                {viewMode === "edit" ? "read" : "edit"} mode
              </button>
            </div>
            {viewMode === "edit" ? (
              <textarea value={activeNote.content} onChange={e => updateNote(activeNote.id, e.target.value)}
                style={{ flex: 1, padding: "24px", background: "none", border: "none", outline: "none", color: "rgba(255,255,255,0.75)", fontFamily: mono, fontSize: "13px", resize: "none", lineHeight: 1.8 }}
                placeholder="start writing..." />
            ) : renderContent(activeNote.content)}
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.1, fontFamily: mono, fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase" }}>select a note</div>
        )}
      </div>
    </div>
  );
};

// ─── FILES TAB ─────────────────────────────────────────────────────────────────

const FilesTab = ({ accent, activeProject, session }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const rgb = hexToRgb(accent);

  const fetchFiles = async () => {
    const { data } = await supabase.storage.from("campaign_files").list(`${session.user.id}/${activeProject.id}`);
    if (data) setFiles(data.filter(f => f.name !== ".emptyFolderPlaceholder"));
  };

  useEffect(() => { fetchFiles(); }, [activeProject.id]);

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setUploading(true);
    const path = `${session.user.id}/${activeProject.id}/${file.name}`;
    const { error } = await supabase.storage.from("campaign_files").upload(path, file, { upsert: true });
    if (error) alert("Upload failed: " + error.message);
    await fetchFiles();
    setUploading(false);
  };

  const getUrl = (name) => supabase.storage.from("campaign_files").getPublicUrl(`${session.user.id}/${activeProject.id}/${name}`).data?.publicUrl;

  const deleteFile = async (name) => {
    const { error } = await supabase.storage.from("campaign_files").remove([`${session.user.id}/${activeProject.id}/${name}`]);
    if (!error) setFiles(prev => prev.filter(f => f.name !== name));
    else alert("Delete failed: " + error.message);
  };

  const getFileIcon = (name) => {
    if (/\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(name)) return ICONS.audio;
    if (/\.(pdf)$/i.test(name)) return ICONS.pdf;
    return ICONS.note;
  };

  return (
    <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}
      style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{files.length} file{files.length !== 1 ? "s" : ""}</span>
        <span style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: `rgba(${rgb},0.4)` }}>{uploading ? "uploading..." : dragging ? "drop to upload" : "drag files here"}</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {files.length === 0 ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", opacity: 0.2, color: accent }}>
            {ICONS.upload}
            <p style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>no files yet</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
            {files.map(f => {
              const url = getUrl(f.name);
              const isImg = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name);
              return (
                <div key={f.name} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", padding: "14px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "8px", position: "relative", alignItems: "center" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `rgba(${rgb},0.2)`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
                  {isImg ? (
                    <div style={{ width: "100%", height: "80px", borderRadius: "4px", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.2)" }}>
                      <img src={url} alt={f.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                    </div>
                  ) : (
                    <div style={{ height: "80px", color: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {getFileIcon(f.name)}
                    </div>
                  )}
                  <a href={url} target="_blank" rel="noreferrer" style={{ width: "100%", fontFamily: mono, fontSize: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "rgba(255,255,255,0.6)", textDecoration: "none", textAlign: "center" }}>{f.name}</a>
                  <button onClick={() => deleteFile(f.name)} style={{ position: "absolute", top: "6px", right: "6px", background: "none", border: "none", color: "rgba(255,80,80,0.3)", cursor: "pointer", fontSize: "14px", lineHeight: 1, opacity: 0, transition: "opacity 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = "rgba(255,80,80,0.8)"; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = 0; }}>×</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── SETTINGS TAB ──────────────────────────────────────────────────────────────

const SettingsTab = ({ accent, setAccentAndSave, user, onSignOut }) => {
  const presets = ["#fb4f2b", "#e63946", "#f4a261", "#2ec4b6", "#8338ec", "#06d6a0", "#118ab2"];
  const rgb = hexToRgb(accent);
  return (
    <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: "32px", overflowY: "auto", height: "100%" }}>
      <div>
        <p style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, margin: "0 0 16px" }}>primary color</p>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <input type="color" value={accent} onChange={e => setAccentAndSave(e.target.value)} style={{ width: "48px", height: "48px", border: "none", borderRadius: "8px", cursor: "pointer", padding: 0, background: "none" }} />
          <input type="text" value={accent} onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setAccentAndSave(v); }}
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(${rgb},0.3)`, borderRadius: "6px", color: "#ccc", fontFamily: mono, fontSize: "14px", padding: "10px 14px", width: "120px", outline: "none" }} />
        </div>
      </div>
      <div>
        <p style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, margin: "0 0 16px" }}>presets</p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {presets.map(c => <button key={c} onClick={() => setAccentAndSave(c)} style={{ width: "32px", height: "32px", borderRadius: "50%", background: c, border: accent === c ? "3px solid #fff" : "3px solid transparent", cursor: "pointer", outline: "none", transition: "transform 0.15s", transform: accent === c ? "scale(1.15)" : "scale(1)" }} />)}
        </div>
      </div>
      <div>
        <p style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, margin: "0 0 16px" }}>preview</p>
        <div style={{ padding: "16px 20px", borderRadius: "8px", border: `1px solid rgba(${rgb},0.25)`, background: `rgba(${rgb},0.06)`, display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: accent }} />
          <span style={{ fontFamily: mono, fontSize: "13px", color: accent }}>saturn — dm toolkit</span>
        </div>
      </div>
      <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", margin: "0 0 12px" }}>account</p>
        <p style={{ fontFamily: mono, fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 16px" }}>{user?.email}</p>
        <button onClick={onSignOut} style={{ background: "none", border: "1px solid rgba(255,80,80,0.2)", borderRadius: "6px", color: "rgba(255,100,100,0.6)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "7px 14px", cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,80,80,0.5)"; e.currentTarget.style.color = "rgba(255,100,100,0.9)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,80,80,0.2)"; e.currentTarget.style.color = "rgba(255,100,100,0.6)"; }}>sign out</button>
      </div>
    </div>
  );
};

// ─── ROOT ──────────────────────────────────────────────────────────────────────

export default function Saturn() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("music");
  const [accent, setAccent] = useState(defaultColor);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session) { loadSettings(session.user.id); loadProjects(session.user.id); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) { loadSettings(session.user.id); loadProjects(session.user.id); }
      else setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadSettings = async (userId) => {
    const { data } = await supabase.from("user_settings").select("accent_color").eq("id", userId).single();
    if (data?.accent_color) setAccent(data.accent_color);
  };

  const loadProjects = async (userId) => {
    const { data } = await supabase.from("projects").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (data) setProjects(data);
  };

  const setAccentAndSave = async (color) => {
    setAccent(color);
    if (!session) return;
    await supabase.from("user_settings").upsert({ id: session.user.id, accent_color: color });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null); setAccent(defaultColor); setProjects([]); setActiveProject(null);
  };

  const handleCreateProject = async ({ name, icon }) => {
    const { data } = await supabase.from("projects").insert({ user_id: session.user.id, name, icon }).select().single();
    if (data) { setProjects(prev => [data, ...prev]); setActiveProject(data); }
    setShowCreateModal(false);
  };

  const handleRenameProject = async (id, name) => {
    await supabase.from("projects").update({ name }).eq("id", id);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, name } : p));
    if (activeProject?.id === id) setActiveProject(prev => ({ ...prev, name }));
  };

  const handleDeleteProject = async (id) => {
    await supabase.from("projects").delete().eq("id", id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (activeProject?.id === id) setActiveProject(null);
  };

  const handleUpdateMap = async (url) => {
    setActiveProject(p => ({ ...p, map_url: url }));
    setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, map_url: url } : p));
    await supabase.from("projects").update({ map_url: url }).eq("id", activeProject.id);
  };

  const handleClearMap = async () => {
    setActiveProject(p => ({ ...p, map_url: null }));
    setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, map_url: null } : p));
    await supabase.from("projects").update({ map_url: null }).eq("id", activeProject.id);
  };

  const rgb = hexToRgb(accent);

  if (authLoading) return (
    <div style={{ position: "fixed", inset: 0, background: "#0e0e0e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.25em", color: `rgba(${rgb},0.4)`, textTransform: "uppercase", animation: "pulse 1.5s infinite" }}>loading...</span>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.2}}`}</style>
    </div>
  );

  if (!session) return <LoginScreen accent={accent} />;

  const AvatarButton = () => (
    <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setProfileMenuOpen(o => !o)}>
      {session.user?.user_metadata?.avatar_url ? (
        <img src={session.user.user_metadata.avatar_url} alt="profile" style={{ width: "30px", height: "30px", borderRadius: "50%", border: `1px solid rgba(${rgb},${profileMenuOpen ? "0.8" : "0.4"})`, objectFit: "cover", display: "block", transition: "border-color 0.2s" }} />
      ) : (
        <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: `rgba(${rgb},0.2)`, border: `1px solid rgba(${rgb},${profileMenuOpen ? "0.8" : "0.4"})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono, fontSize: "11px", color: accent }}>
          {session.user?.email?.[0]?.toUpperCase()}
        </div>
      )}
      {profileMenuOpen && (
        <>
          <div onClick={e => { e.stopPropagation(); setProfileMenuOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 9 }} />
          <div style={{ position: "absolute", top: "38px", right: 0, zIndex: 10, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px", minWidth: "180px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <p style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", margin: "0 0 6px", padding: "0 8px" }}>{session.user?.email}</p>
            <button onClick={e => { e.stopPropagation(); setProfileMenuOpen(false); handleSignOut(); }} style={{ background: "none", border: "none", borderRadius: "6px", color: "rgba(255,100,100,0.7)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "8px", cursor: "pointer", textAlign: "left" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,80,80,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>sign out</button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "#0e0e0e", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {activeProject && (
              <button onClick={() => setActiveProject(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "4px 2px", display: "flex", alignItems: "center", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span style={{ fontFamily: mono, fontSize: "22px", fontWeight: "700", letterSpacing: "0.12em", color: accent, textShadow: `0 0 24px rgba(${rgb},0.5)` }}>◉ SATURN</span>
              {activeProject ? (
                <span style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ProjectIcon iconId={activeProject.icon} size={12} color="rgba(255,255,255,0.4)" />
                  {activeProject.name}
                </span>
              ) : (
                <span style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>dm toolkit</span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accent, boxShadow: `0 0 8px ${accent}`, animation: "pulse 2s infinite" }} />
            <AvatarButton />
          </div>
        </div>

        {activeProject ? (
          <>
            <div style={{ display: "flex", gap: "2px", padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)", overflowX: "auto", flexShrink: 0 }}>
              {tabs.map(tab => {
                const isActive = activeTab === tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "12px 16px", background: "none", border: "none", borderBottom: isActive ? `2px solid ${accent}` : "2px solid transparent", color: isActive ? accent : "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: mono, fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", transition: "color 0.2s, border-color 0.2s", marginBottom: "-1px", whiteSpace: "nowrap", flexShrink: 0 }}>
                    <TabIcon tab={tab} />
                    <span className="tab-label">{tab}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              {activeTab === "music"    && <PlaceholderTab name="music" accent={accent} />}
              {activeTab === "map"      && <MapTab accent={accent} activeProject={activeProject} session={session} onUpdateMap={handleUpdateMap} onClearMap={handleClearMap} />}
              {activeTab === "notes"    && <NotesTab accent={accent} activeProject={activeProject} session={session} />}
              {activeTab === "files"    && <FilesTab accent={accent} activeProject={activeProject} session={session} />}
              {activeTab === "settings" && <SettingsTab accent={accent} setAccentAndSave={setAccentAndSave} user={session.user} onSignOut={handleSignOut} />}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <ProjectList accent={accent} projects={projects} onOpen={p => { setActiveProject(p); setActiveTab("music"); }} onCreate={() => setShowCreateModal(true)} onRename={handleRenameProject} onDelete={handleDeleteProject} />
          </div>
        )}

        <div style={{ padding: "10px 24px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.12)", textTransform: "uppercase" }}>v0.9.7</span>
          <span style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.2em", color: `rgba(${rgb},0.3)`, textTransform: "uppercase" }}>session active</span>
        </div>
      </div>

      {showCreateModal && <CreateProjectModal accent={accent} onClose={() => setShowCreateModal(false)} onSave={handleCreateProject} />}

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        *{box-sizing:border-box;}
        @media(max-width:400px){.tab-label{display:none}}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px;}
      `}</style>
    </>
  );
}
