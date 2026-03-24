import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const defaultColor = "#fb4f2b";
const tabs = ["music", "map", "notes", "settings"];
const mono = "'Courier New', monospace";

const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
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
{ id: "flame", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2c0 4-4 5-4 9a4 4 0 008 0c0-4-4-5-4-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 12c0 2-1.5 2.5-1.5 4a1.5 1.5 0 003 0c0-1.5-1.5-2-1.5-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg> },
{ id: "eye", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg> },
{ id: "crown", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 15h14M3 15l2-8 4 4 3-6 3 6 4-4 2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
{ id: "dice", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="7" cy="7" r="1" fill="currentColor"/><circle cx="13" cy="7" r="1" fill="currentColor"/><circle cx="10" cy="10" r="1" fill="currentColor"/><circle cx="7" cy="13" r="1" fill="currentColor"/><circle cx="13" cy="13" r="1" fill="currentColor"/></svg> },
];

const ProjectIcon = ({ iconId, size = 20, color = "currentColor" }) => {
  const icon = PROJECT_ICONS.find(i => i.id === iconId);
  if (!icon) return null;
  return <span style={{ color, display: "flex", alignItems: "center", justifyContent: "center", width: size, height: size }}>{icon.svg}</span>;
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
  <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const TabIcon = ({ tab }) => {
  const icons = {
    music: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12V4l7-1.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="4.5" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="11.5" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>,
    map: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 3.5l4.5-1.5 5 1.5 4.5-1.5v10L10.5 13.5 5.5 12 1 13.5V3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M5.5 2v10M10.5 3.5V13.5" stroke="currentColor" strokeWidth="1.5"/></svg>,
    notes: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M5 6h6M5 8.5h6M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    settings: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.2 3.2l.85.85M11.95 11.95l.85.85M3.2 12.8l.85-.85M11.95 4.05l.85-.85" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  };
  return icons[tab] || null;
};

const LoginScreen = ({ accent }) => {
  const rgb = hexToRgb(accent);
  const [loading, setLoading] = useState(false);
  const handleGoogleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } });
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0e0e0e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "40px" }}>
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
    <span style={{ fontFamily: mono, fontSize: "36px", fontWeight: "700", letterSpacing: "0.12em", color: accent, textShadow: `0 0 32px rgba(${rgb},0.5)` }}>◉ SATURN</span>
    <span style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>dm toolkit</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%", maxWidth: "320px", padding: "0 24px" }}>
    <button onClick={handleGoogleLogin} disabled={loading}
    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", width: "100%", padding: "14px 24px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", color: "rgba(255,255,255,0.85)", fontFamily: mono, fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1 }}
    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor = `rgba(${rgb},0.4)`; }}
    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}>
    <GoogleIcon />
    {loading ? "redirecting..." : "sign in with google"}
    </button>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
    <p style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.15)", textTransform: "uppercase", margin: 0, textAlign: "center" }}>your settings sync across devices</p>
    <p style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.15em", color: "rgba(255,255,255,0.15)", margin: 0, textAlign: "center" }}>by ko1ouh :]</p>
    </div>
    </div>
    </div>
  );
};

const CreateProjectModal = ({ accent, onClose, onSave }) => {
  const rgb = hexToRgb(accent);
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("sword");
  const handleSave = () => { if (!name.trim()) return; onSave({ name: name.trim(), icon: selectedIcon }); };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
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
    <button onClick={handleSave} disabled={!name.trim()} style={{ background: name.trim() ? `rgba(${rgb},0.15)` : "rgba(255,255,255,0.03)", border: `1px solid ${name.trim() ? `rgba(${rgb},0.4)` : "rgba(255,255,255,0.08)"}`, borderRadius: "6px", color: name.trim() ? accent : "rgba(255,255,255,0.2)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "7px 14px", cursor: name.trim() ? "pointer" : "not-allowed", transition: "all 0.15s" }}>create</button>
    </div>
    </div>
    </div>
  );
};

const RenameModal = ({ accent, project, onClose, onSave }) => {
  const rgb = hexToRgb(accent);
  const [name, setName] = useState(project.name);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
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
    style={{ display: "flex", alignItems: "center", gap: "6px", background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.3)`, borderRadius: "6px", color: accent, fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "7px 14px", cursor: "pointer", transition: "all 0.15s" }}
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
        <div style={{ width: "38px", height: "38px", borderRadius: "8px", background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.2)`, display: "flex", alignItems: "center", justifyContent: "center", color: accent, flexShrink: 0 }}>
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
          <button onClick={e => { e.stopPropagation(); setMenuOpen(null); setRenaming(p); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 10px", cursor: "pointer", borderRadius: "4px", textAlign: "left", transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}>rename</button>
          <button onClick={e => { e.stopPropagation(); setMenuOpen(null); onDelete(p.id); }} style={{ background: "none", border: "none", color: "rgba(255,80,80,0.6)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 10px", cursor: "pointer", borderRadius: "4px", textAlign: "left", transition: "background 0.15s" }}
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

const PlaceholderTab = ({ name, accent }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px", opacity: 0.35, userSelect: "none" }}>
  <div style={{ width: "64px", height: "64px", border: `2px solid ${accent}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
  <TabIcon tab={name} />
  </div>
  <p style={{ fontFamily: mono, fontSize: "12px", color: accent, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>{name} — coming soon</p>
  </div>
);

const SettingsTab = ({ accent, setAccentAndSave, user, onSignOut }) => {
  const presets = ["#fb4f2b", "#e63946", "#f4a261", "#2ec4b6", "#8338ec", "#06d6a0", "#118ab2"];
  const rgb = hexToRgb(accent);
  return (
    <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: "32px", overflowY: "hidden", height: "100%" }}>
    <div>
    <p style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, margin: "0 0 16px" }}>primary color</p>
    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
    <input type="color" value={accent} onChange={e => setAccentAndSave(e.target.value)} style={{ width: "48px", height: "48px", border: "none", borderRadius: "8px", cursor: "pointer", padding: 0, background: "none" }} />
    <input type="text" value={accent} onChange={e => { const v = e.target.value; if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setAccentAndSave(v); }} style={{ background: "rgba(255,255,255,0.04)", border: `1px solid rgba(${rgb},0.3)`, borderRadius: "6px", color: "#ccc", fontFamily: mono, fontSize: "14px", padding: "10px 14px", width: "120px", outline: "none" }} />
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
    <button onClick={onSignOut} style={{ background: "none", border: "1px solid rgba(255,80,80,0.2)", borderRadius: "6px", color: "rgba(255,100,100,0.6)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "7px 14px", cursor: "pointer" }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,80,80,0.5)"; e.currentTarget.style.color = "rgba(255,100,100,0.9)"; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,80,80,0.2)"; e.currentTarget.style.color = "rgba(255,100,100,0.6)"; }}>sign out</button>
    </div>
    </div>
  );
};

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
            <div style={{ display: "flex", gap: "2px", padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)", overflowX: "hidden", flexShrink: 0 }}>
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
            {activeTab === "settings" ? (
              <SettingsTab accent={accent} setAccentAndSave={setAccentAndSave} user={session.user} onSignOut={handleSignOut} />
            ) : (
              <PlaceholderTab name={activeTab} accent={accent} />
            )}
            </div>
            </>
          ) : (
            <div style={{ flex: 1, overflow: "hidden" }}>
            <ProjectList accent={accent} projects={projects} onOpen={setActiveProject} onCreate={() => setShowCreateModal(true)} onRename={handleRenameProject} onDelete={handleDeleteProject} />
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: "10px 24px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.12)", textTransform: "uppercase" }}>v0.3.3</span>
          <span style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.2em", color: `rgba(${rgb},0.3)`, textTransform: "uppercase" }}>session active</span>
          </div>
          </div>

          {showCreateModal && <CreateProjectModal accent={accent} onClose={() => setShowCreateModal(false)} onSave={handleCreateProject} />}

          <style>{`
            @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
            *{box-sizing:border-box;}
            @media(max-width:400px){.tab-label{display:none}}
            `}</style>
            </>
        );
}
