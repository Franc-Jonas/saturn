import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";

const defaultColor = "#fb4f2b";
const tabs = ["music", "map", "notes", "files", "settings"];
const mono = "'Courier Prime', 'Courier New', monospace";

const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

const listAllStorageFiles = async (bucket, path) => {
  let allData = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const { data, error } = await supabase.storage.from(bucket).list(path, { limit, offset, sortBy: { column: "name", order: "asc" } });
    if (error || !data || data.length === 0) break;
    allData.push(...data);
    if (data.length < limit) break;
    offset += limit;
  }
  return allData;
};

const ICONS = {
  upload: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  note: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>,
  folder: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
  chevronRight: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
  chevronDown: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>,
  audio: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>,
  pdf: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="M9 13h1.5a1.5 1.5 0 0 1 0 3H9v-3zM9 13V10" /><path d="M14 13v6m0-6h2a1.5 1.5 0 0 1 0 3h-2" /><path d="M18 13v6" /></svg>,
};

const PROJECT_ICONS = [
  { id: "sword", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M14 2l4 4-9 9-2 1 1-2 9-9zM2 18l3-3M11 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { id: "skull", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C6.686 2 4 4.686 4 8c0 2.21 1.19 4.14 2.97 5.22L7 15h6l.03-1.78C14.81 12.14 16 10.21 16 8c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.5" /><path d="M7 15v2h6v-2M8 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="8" cy="8" r="1" fill="currentColor" /><circle cx="12" cy="8" r="1" fill="currentColor" /></svg> },
  { id: "castle", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 18V8h3V6h2V4h1V2h2v2h1v2h2v2h3v10H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M8 18v-4h4v4" stroke="currentColor" strokeWidth="1.5" /><path d="M3 8h14" stroke="currentColor" strokeWidth="1.5" /></svg> },
  { id: "dragon", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3c-1 0-2 .5-2.5 1.5L6 7l-3 1 2 2-1 3 3-1 2 2 2-2 3 1-1-3 2-2-3-1-1.5-2.5C13 4 12 3 10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M10 9v5M8 16l2 2 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> },
  { id: "map", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 4.5l5.5-2 5 2 5.5-2v13l-5.5 2-5-2-5.5 2V4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M7.5 2.5v13M12.5 4.5v13" stroke="currentColor" strokeWidth="1.5" /></svg> },
  { id: "potion", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 3h4M7 7l-3 7a3 3 0 006 0V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M13 7l3 7a3 3 0 01-3 3H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M7 7h6" stroke="currentColor" strokeWidth="1.5" /></svg> },
  { id: "scroll", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="5" y="3" width="11" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2" stroke="currentColor" strokeWidth="1.5" /><path d="M9 8h5M9 11h5M9 14h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> },
  { id: "shield", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L4 5v5c0 4 2.67 7.33 6 8 3.33-.67 6-4 6-8V5l-6-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { id: "flame", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2c0 4-4 5-4 9a4 4 0 008 0c0-4-4-5-4-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg> },
  { id: "eye", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5" /><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" /></svg> },
  { id: "crown", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 15h14M3 15l2-8 4 4 3-6 3 6 4-4 2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { id: "dice", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" /><circle cx="7" cy="7" r="1" fill="currentColor" /><circle cx="13" cy="7" r="1" fill="currentColor" /><circle cx="10" cy="10" r="1" fill="currentColor" /><circle cx="7" cy="13" r="1" fill="currentColor" /><circle cx="13" cy="13" r="1" fill="currentColor" /></svg> },
];

const TabIcon = ({ tab }) => {
  const icons = {
    music: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 12V4l7-1.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="4.5" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.5" /><circle cx="11.5" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.5" /></svg>,
    map: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 3.5l4.5-1.5 5 1.5 4.5-1.5v10L10.5 13.5 5.5 12 1 13.5V3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M5.5 2v10M10.5 3.5V13.5" stroke="currentColor" strokeWidth="1.5" /></svg>,
    notes: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M5 6h6M5 8.5h6M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
    files: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h4l2 2h6v8H2V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>,
    settings: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.2 3.2l.85.85M11.95 11.95l.85.85M3.2 12.8l.85-.85M11.95 4.05l.85-.85" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>,
  };
  return icons[tab] || null;
};

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
    // FIX: strip hash from window.location.href to prevent access_token duplication on subsequent logins
    const redirectTo = window.location.href.split("#")[0];
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
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

// ─── NOTE PICKER MODAL ────────────────────────────────────────────────────────

const NotePickerModal = ({ accent, notes, onClose, onSelect }) => {
  const rgb = hexToRgb(accent);
  const [expanded, setExpanded] = useState(new Set());

  const toggleFolder = (id) => {
    setExpanded(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const renderTree = (parentId = null, depth = 0) =>
    notes.filter(n => n.parent_id === parentId).map(n => (
      <div key={n.id}>
        <div onClick={() => n.is_folder ? toggleFolder(n.id) : onSelect(n)}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: `8px 12px 8px ${12 + depth * 16}px`, cursor: n.is_folder ? "default" : "pointer", borderRadius: "6px", color: n.is_folder ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.75)", transition: "all 0.15s", userSelect: "none" }}
          onMouseEnter={e => { if (!n.is_folder) { e.currentTarget.style.background = `rgba(${rgb},0.1)`; e.currentTarget.style.color = accent; } }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = n.is_folder ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.75)"; }}>
          <span style={{ opacity: 0.5, flexShrink: 0, width: 12 }}>
            {n.is_folder ? (expanded.has(n.id) ? ICONS.chevronDown : ICONS.chevronRight) : null}
          </span>
          <span style={{ opacity: 0.6, flexShrink: 0 }}>{n.is_folder ? ICONS.folder : ICONS.note}</span>
          <span style={{ fontFamily: mono, fontSize: "12px" }}>{n.name}</span>
        </div>
        {n.is_folder && expanded.has(n.id) && renderTree(n.id, depth + 1)}
      </div>
    ));

  const onlyNotes = notes.filter(n => !n.is_folder);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#141414", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", maxHeight: "70vh" }}>
        <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontFamily: mono, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, margin: 0 }}>select note</p>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "18px", lineHeight: 1, padding: "2px" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          {onlyNotes.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", opacity: 0.3 }}>
              <p style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: accent, margin: 0 }}>no notes yet</p>
              <p style={{ fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.3)", margin: "8px 0 0" }}>create notes in the notes tab first</p>
            </div>
          ) : renderTree()}
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
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><rect x="8" y="8" width="32" height="32" rx="4" stroke={accent} strokeWidth="1.5" /><path d="M24 18v12M18 24h12" stroke={accent} strokeWidth="1.5" strokeLinecap="round" /></svg>
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

// ─── MAP CANVAS ───────────────────────────────────────────────────────────────

const MapCanvas = ({ mapUrl, points, notes, viewMode, onUploadMap, onClearMap, onAddPoint, onDeletePoint, onDrillDown, session, activeProject, accent, rgb }) => {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [hoverBtn, setHoverBtn] = useState(null);
  const [placingPoint, setPlacingPoint] = useState(false);
  const [showNotePicker, setShowNotePicker] = useState(false);
  const [pendingClick, setPendingClick] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [clickedPoint, setClickedPoint] = useState(null);
  const isPanning = useRef(false);
  const didPan = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => { setTransform({ x: 0, y: 0, scale: 1 }); }, [mapUrl]);

  const handleFileDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${session.user.id}/${activeProject.id}/map.${ext}`;
    const { error } = await supabase.storage.from("campaign_files").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("campaign_files").createSignedUrl(path);
      onUploadMap(data.publicUrl);
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
      return { scale: newScale, x: cx - (cx - t.x) * (newScale / t.scale), y: cy - (cy - t.y) * (newScale / t.scale) };
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
    didPan.current = false;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didPan.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }));
  };

  const handleMouseUp = () => { isPanning.current = false; };

  const handleCanvasClick = (e) => {
    if (didPan.current) { didPan.current = false; return; }
    if (!placingPoint || !mapUrl) return;
    setClickedPoint(null);
    const rect = containerRef.current.getBoundingClientRect();
    const img = imgRef.current;
    if (!img) return;
    const cW = rect.width;
    const cH = rect.height;
    const imgNatW = img.naturalWidth;
    const imgNatH = img.naturalHeight;
    const imgLeft = transform.x + (cW - imgNatW) / 2 * transform.scale;
    const imgTop = transform.y + (cH - imgNatH) / 2 * transform.scale;
    const imgW = imgNatW * transform.scale;
    const imgH = imgNatH * transform.scale;
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const xPct = (cx - imgLeft) / imgW;
    const yPct = (cy - imgTop) / imgH;
    if (xPct < 0 || xPct > 1 || yPct < 0 || yPct > 1) return;
    setPendingClick({ xPct, yPct });
    setShowNotePicker(true);
  };

  const handleNoteSelected = (note) => {
    setShowNotePicker(false);
    setPlacingPoint(false);
    if (pendingClick) {
      onAddPoint(pendingClick.xPct, pendingClick.yPct, note.id);
      setPendingClick(null);
    }
  };

  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  const getPointPixels = (xPct, yPct) => {
    if (!containerRef.current || !imgRef.current) return { left: 0, top: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const cW = rect.width;
    const cH = rect.height;
    const imgNatW = imgRef.current.naturalWidth;
    const imgNatH = imgRef.current.naturalHeight;
    const imgLeft = transform.x + (cW - imgNatW) / 2 * transform.scale;
    const imgTop = transform.y + (cH - imgNatH) / 2 * transform.scale;
    const imgW = imgNatW * transform.scale;
    const imgH = imgNatH * transform.scale;
    return { left: imgLeft + xPct * imgW, top: imgTop + yPct * imgH };
  };

  const noteMap = {};
  notes.forEach(n => { noteMap[n.id] = n; });

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      <div
        ref={containerRef}
        onDragOver={viewMode === "edit" ? e => { e.preventDefault(); setDragging(true); } : undefined}
        onDragLeave={viewMode === "edit" ? () => setDragging(false) : undefined}
        onDrop={viewMode === "edit" ? handleFileDrop : undefined}
        onMouseDown={mapUrl ? handleMouseDown : undefined}
        onMouseMove={mapUrl ? handleMouseMove : undefined}
        onMouseUp={mapUrl ? handleMouseUp : undefined}
        onMouseLeave={mapUrl ? handleMouseUp : undefined}
        onClick={placingPoint && mapUrl ? handleCanvasClick : () => { setClickedPoint(null); }}
        style={{ flex: 1, background: "#050505", overflow: "hidden", position: "relative", cursor: placingPoint ? "crosshair" : (mapUrl ? "grab" : "default"), outline: dragging ? `2px dashed rgba(${rgb},0.5)` : "2px dashed transparent", transition: "outline-color 0.2s" }}>

        {mapUrl ? (
          <div style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
            <img ref={imgRef} src={mapUrl} alt="map" draggable={false} style={{ maxWidth: "none", maxHeight: "none", display: "block", userSelect: "none" }} />
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", opacity: dragging ? 0.6 : 0.2, color: accent, transition: "opacity 0.2s" }}>
            {ICONS.upload}
            <p style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>
              {viewMode === "read" ? "switch to edit mode to upload map" : uploading ? "uploading..." : "drag map image here"}
            </p>
          </div>
        )}

        {mapUrl && points.map(pt => {
          const pos = getPointPixels(pt.x_pct, pt.y_pct);
          const linkedNote = noteMap[pt.note_id];
          const isHovered = hoveredPoint === pt.id;
          const isClicked = clickedPoint === pt.id;
          return (
            <div key={pt.id}
              style={{ position: "absolute", left: pos.left, top: pos.top, transform: "translate(-50%, -50%)", zIndex: 15, pointerEvents: "all" }}
              onMouseEnter={() => { if (viewMode === "read") setHoveredPoint(pt.id); }}
              onMouseLeave={() => { setHoveredPoint(null); }}
              onClick={e => {
                e.stopPropagation();
                if (viewMode === "edit") { setClickedPoint(isClicked ? null : pt.id); }
                else { onDrillDown(pt); }
              }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: accent, boxShadow: `0 0 0 2px rgba(${rgb},0.3), 0 0 10px rgba(${rgb},0.6)`, cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s", transform: isHovered || isClicked ? "scale(1.4)" : "scale(1)" }} />
              {viewMode === "read" && isHovered && linkedNote && (
                <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", border: `1px solid rgba(${rgb},0.3)`, borderRadius: "8px", padding: "12px 14px", minWidth: "200px", maxWidth: "280px", zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.6)", pointerEvents: "none" }}>
                  <p style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: accent, margin: "0 0 8px" }}>{linkedNote.name}</p>
                  <p style={{ fontFamily: mono, fontSize: "11px", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap", maxHeight: "100px", overflow: "hidden" }}>
                    {linkedNote.content ? linkedNote.content.slice(0, 200) + (linkedNote.content.length > 200 ? "..." : "") : "no content"}
                  </p>
                  <p style={{ fontFamily: mono, fontSize: "9px", color: `rgba(${rgb},0.5)`, margin: "8px 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>click to open</p>
                </div>
              )}
              {viewMode === "edit" && isClicked && (
                <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px", zIndex: 50, boxShadow: "0 8px 24px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column", gap: "4px", minWidth: "130px" }}>
                  {linkedNote && <p style={{ fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 4px", padding: "0 6px" }}>{linkedNote.name}</p>}
                  <button onClick={e => { e.stopPropagation(); setClickedPoint(null); onDeletePoint(pt.id); }}
                    style={{ background: "none", border: "none", color: "rgba(255,80,80,0.7)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", padding: "7px 10px", cursor: "pointer", borderRadius: "4px", textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,80,80,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>delete point</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {viewMode === "edit" && mapUrl && (
        <div style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "8px", background: "rgba(18,18,18,0.85)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "8px", backdropFilter: "blur(12px)", zIndex: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          <div style={{ position: "relative", display: "flex" }}>
            {hoverBtn === "reset" && <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translate(-50%, -12px)", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "6px 10px", fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", letterSpacing: "0.1em", textTransform: "uppercase", pointerEvents: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>reset view</div>}
            <button onClick={resetView} onMouseEnter={() => setHoverBtn("reset")} onMouseLeave={() => setHoverBtn(null)}
              style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "8px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
              onMouseOver={e => { e.currentTarget.style.color = accent; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseOut={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "none"; }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
            </button>
          </div>
          <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ position: "relative", display: "flex" }}>
            {hoverBtn === "point" && <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translate(-50%, -12px)", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "6px 10px", fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", letterSpacing: "0.1em", textTransform: "uppercase", pointerEvents: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>add point</div>}
            <button onClick={() => { setPlacingPoint(p => !p); setClickedPoint(null); }} onMouseEnter={() => setHoverBtn("point")} onMouseLeave={() => setHoverBtn(null)}
              style={{ background: placingPoint ? `rgba(${rgb},0.2)` : "none", border: placingPoint ? `1px solid rgba(${rgb},0.5)` : "none", color: placingPoint ? accent : "rgba(255,255,255,0.4)", cursor: "pointer", padding: "8px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
              onMouseOver={e => { if (!placingPoint) { e.currentTarget.style.color = accent; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; } }}
              onMouseOut={e => { if (!placingPoint) { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; e.currentTarget.style.background = "none"; } }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="4" /><path d="M12 13v8" /><path d="M8.5 21h7" /></svg>
            </button>
          </div>
          <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ position: "relative", display: "flex" }}>
            {hoverBtn === "clear" && <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translate(-50%, -12px)", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "6px 10px", fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", letterSpacing: "0.1em", textTransform: "uppercase", pointerEvents: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>clear map</div>}
            <button onClick={() => { if (window.confirm("Clear this map?")) onClearMap(); }} onMouseEnter={() => setHoverBtn("clear")} onMouseLeave={() => setHoverBtn(null)}
              style={{ background: "none", border: "none", color: "rgba(255,100,100,0.5)", cursor: "pointer", padding: "8px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
              onMouseOver={e => { e.currentTarget.style.color = "rgba(255,100,100,0.9)"; e.currentTarget.style.background = "rgba(255,80,80,0.15)"; }}
              onMouseOut={e => { e.currentTarget.style.color = "rgba(255,100,100,0.5)"; e.currentTarget.style.background = "none"; }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
            </button>
          </div>
        </div>
      )}

      {showNotePicker && (
        <NotePickerModal accent={accent} notes={notes}
          onClose={() => { setShowNotePicker(false); setPlacingPoint(false); setPendingClick(null); }}
          onSelect={handleNoteSelected} />
      )}

      {placingPoint && !showNotePicker && (
        <div style={{ position: "absolute", top: "16px", left: "50%", transform: "translateX(-50%)", background: `rgba(${rgb},0.15)`, border: `1px solid rgba(${rgb},0.35)`, borderRadius: "8px", padding: "8px 16px", fontFamily: mono, fontSize: "10px", color: accent, letterSpacing: "0.12em", textTransform: "uppercase", zIndex: 20, pointerEvents: "none" }}>
          click on the map to place a point
        </div>
      )}
    </div>
  );
};

// ─── MAP WINDOW ───────────────────────────────────────────────────────────────

const MapWindow = ({ accent, pointId, projectId, notes, session, activeProject, onBack }) => {
  const rgb = hexToRgb(accent);
  const [viewMode, setViewMode] = useState("read");
  const [drillStack, setDrillStack] = useState([]);
  const [currentPointId, setCurrentPointId] = useState(pointId);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [currentSubPoints, setCurrentSubPoints] = useState([]);
  const noteMap = {};
  notes.forEach(n => { noteMap[n.id] = n; });

  const loadPoint = async (pid) => {
    const { data } = await supabase.from("map_points").select("*").eq("id", pid).single();
    if (data) setCurrentPoint(data);
  };

  const loadSubPoints = async (pid) => {
    const { data } = await supabase.from("map_points").select("*").eq("parent_point_id", pid);
    if (data) setCurrentSubPoints(data);
  };

  useEffect(() => { loadPoint(currentPointId); loadSubPoints(currentPointId); }, [currentPointId]);

  const handleUploadSubMap = async (url) => {
    await supabase.from("map_points").update({ sub_map_url: url }).eq("id", currentPointId);
    setCurrentPoint(p => ({ ...p, sub_map_url: url }));
  };

  const handleClearSubMap = async () => {
    await supabase.from("map_points").update({ sub_map_url: null }).eq("id", currentPointId);
    setCurrentPoint(p => ({ ...p, sub_map_url: null }));
  };

  const handleAddSubPoint = async (xPct, yPct, noteId) => {
    const { data } = await supabase.from("map_points").insert({ project_id: projectId, parent_point_id: currentPointId, note_id: noteId, x_pct: xPct, y_pct: yPct }).select().single();
    if (data) setCurrentSubPoints(prev => [...prev, data]);
  };

  const handleDeleteSubPoint = async (pid) => {
    await supabase.from("map_points").delete().eq("id", pid);
    setCurrentSubPoints(prev => prev.filter(p => p.id !== pid));
  };

  const handleDrillDown = (pt) => {
    setDrillStack(prev => [...prev, { pointId: currentPointId, label: noteMap[currentPoint?.note_id]?.name || "map" }]);
    setCurrentPointId(pt.id);
  };

  const handleBack = () => {
    if (drillStack.length > 0) {
      const prev = drillStack[drillStack.length - 1];
      setDrillStack(s => s.slice(0, -1));
      setCurrentPointId(prev.pointId);
    } else {
      onBack();
    }
  };

  const linkedNote = currentPoint ? noteMap[currentPoint.note_id] : null;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={handleBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", padding: "4px 2px", display: "flex", alignItems: "center", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          {drillStack.length > 0 && (
            <span style={{ fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>
              {drillStack.map(s => s.label).join(" › ")} ›{" "}
            </span>
          )}
          <span style={{ fontFamily: mono, fontSize: "10px", color: accent, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            {linkedNote?.name || "unnamed point"}
          </span>
        </div>
        <button onClick={() => setViewMode(v => v === "edit" ? "read" : "edit")}
          style={{ background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.3)`, borderRadius: "4px", color: accent, fontFamily: mono, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "4px 8px", cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = `rgba(${rgb},0.2)`}
          onMouseLeave={e => e.currentTarget.style.background = `rgba(${rgb},0.1)`}>
          {viewMode === "edit" ? "read" : "edit"} mode
        </button>
      </div>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div style={{ width: "280px", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.15)", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            <p style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: `rgba(${rgb},0.6)`, margin: 0 }}>{linkedNote?.name || "no note"}</p>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", fontFamily: mono, fontSize: "12px", color: "rgba(255,255,255,0.65)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            {linkedNote?.content || <span style={{ opacity: 0.3, fontStyle: "italic" }}>no content</span>}
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          {currentPoint ? (
            <MapCanvas mapUrl={currentPoint.sub_map_url} points={currentSubPoints} notes={notes} viewMode={viewMode}
              onUploadMap={handleUploadSubMap} onClearMap={handleClearSubMap} onAddPoint={handleAddSubPoint}
              onDeletePoint={handleDeleteSubPoint} onDrillDown={handleDrillDown}
              session={session} activeProject={activeProject} accent={accent} rgb={rgb} />
          ) : (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.2 }}>
              <span style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: accent }}>loading...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAP TAB ──────────────────────────────────────────────────────────────────

const MapTab = ({ accent, activeProject, session, onUpdateMap, onClearMap }) => {
  const rgb = hexToRgb(accent);
  const [viewMode, setViewMode] = useState("read");
  const [points, setPoints] = useState([]);
  const [notes, setNotes] = useState([]);
  const [drillPoint, setDrillPoint] = useState(null);

  useEffect(() => {
    const loadPoints = async () => {
      const { data } = await supabase.from("map_points").select("*").eq("project_id", activeProject.id).is("parent_point_id", null);
      if (data) setPoints(data);
    };
    const loadNotes = async () => {
      const { data } = await supabase.from("notes").select("*").eq("project_id", activeProject.id).order("created_at", { ascending: true });
      if (data) setNotes(data);
    };
    loadPoints();
    loadNotes();
  }, [activeProject.id]);

  const handleAddPoint = async (xPct, yPct, noteId) => {
    const { data } = await supabase.from("map_points").insert({ project_id: activeProject.id, parent_point_id: null, note_id: noteId, x_pct: xPct, y_pct: yPct }).select().single();
    if (data) setPoints(prev => [...prev, data]);
  };

  const handleDeletePoint = async (pid) => {
    await supabase.from("map_points").delete().eq("id", pid);
    setPoints(prev => prev.filter(p => p.id !== pid));
  };

  if (drillPoint) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <MapWindow accent={accent} pointId={drillPoint.id} projectId={activeProject.id} notes={notes}
          session={session} activeProject={activeProject} onBack={() => setDrillPoint(null)} />
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)", flexShrink: 0, justifyContent: "space-between", zIndex: 10 }}>
        <span style={{ fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}></span>
        <button onClick={() => setViewMode(v => v === "edit" ? "read" : "edit")}
          style={{ background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.3)`, borderRadius: "4px", color: accent, fontFamily: mono, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "4px 8px", cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = `rgba(${rgb},0.2)`}
          onMouseLeave={e => e.currentTarget.style.background = `rgba(${rgb},0.1)`}>
          {viewMode === "edit" ? "read" : "edit"} mode
        </button>
      </div>
      <MapCanvas mapUrl={activeProject.map_url} points={points} notes={notes} viewMode={viewMode}
        onUploadMap={onUpdateMap} onClearMap={onClearMap} onAddPoint={handleAddPoint}
        onDeletePoint={handleDeletePoint} onDrillDown={pt => setDrillPoint(pt)}
        session={session} activeProject={activeProject} accent={accent} rgb={rgb} />
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
  // FIX: use a ref for activeNoteId so the debounce closure always reads the latest value
  const activeNoteIdRef = useRef(null);
  const rgb = hexToRgb(accent);

  useEffect(() => { activeNoteIdRef.current = activeNoteId; }, [activeNoteId]);

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
          <div style={{ position: "relative", flexShrink: 0 }} onClick={e => { e.stopPropagation(); setItemMenuOpen(itemMenuOpen === n.id ? null : n.id); }}>
            <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", padding: "2px 4px", fontSize: "13px", lineHeight: 1, borderRadius: "3px", transition: "color 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.6)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}>···</button>
            {itemMenuOpen === n.id && (
              <>
                <div onClick={e => { e.stopPropagation(); setItemMenuOpen(null); }} style={{ position: "fixed", inset: 0, zIndex: 9 }} />
                <div style={{ position: "absolute", right: 0, top: "22px", zIndex: 20, background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "7px", padding: "5px", minWidth: "120px", display: "flex", flexDirection: "column", gap: "2px", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
                  <button onClick={e => { e.stopPropagation(); setItemMenuOpen(null); const newName = window.prompt("Rename:", n.name); renameNote(n.id, newName); }}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 10px", cursor: "pointer", borderRadius: "4px", textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>rename</button>
                  <button onClick={e => { e.stopPropagation(); setItemMenuOpen(null); deleteNote(n.id); }}
                    style={{ background: "none", border: "none", color: "rgba(255,80,80,0.6)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "7px 10px", cursor: "pointer", borderRadius: "4px", textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,80,80,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>delete</button>
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
              {/* FIX: use a local id variable so the supabase call in the timeout always has the correct note id */}
              <input value={activeNote.name} onChange={e => {
                const val = e.target.value;
                const noteId = activeNote.id;
                setNotes(prev => prev.map(n => n.id === noteId ? { ...n, name: val } : n));
                clearTimeout(nameDebounceRef.current);
                nameDebounceRef.current = setTimeout(async () => {
                  await supabase.from("notes").update({ name: val }).eq("id", noteId);
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
  const [currentPath, setCurrentPath] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [itemMenuOpen, setItemMenuOpen] = useState(null);
  const rgb = hexToRgb(accent);
  // FIX: use a ref for draggedItem so handleDrop always reads the latest value, not a stale closure
  const draggedItemRef = useRef(null);

  const fetchFiles = async () => {
    const pathPrefix = currentPath ? `${session.user.id}/${activeProject.id}/${currentPath}` : `${session.user.id}/${activeProject.id}`;
    const data = await listAllStorageFiles("campaign_files", pathPrefix);
    setFiles(data.filter(f => f.name !== ".emptyFolderPlaceholder"));
  };

  useEffect(() => { fetchFiles(); }, [activeProject.id, currentPath]);

  const handleDrop = async (e, targetFolder = null) => {
    e.preventDefault(); e.stopPropagation();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploading(true);
      const droppedFiles = Array.from(e.dataTransfer.files);
      const destinationPath = targetFolder ? (currentPath ? `${currentPath}/${targetFolder}` : targetFolder) : currentPath;
      const prefix = destinationPath ? `${session.user.id}/${activeProject.id}/${destinationPath}` : `${session.user.id}/${activeProject.id}`;
      await Promise.all(droppedFiles.map(async (file) => {
        const path = `${prefix}/${file.name}`;
        const { error } = await supabase.storage.from("campaign_files").upload(path, file, { upsert: true });
        if (error) console.error(`Upload failed for ${file.name}:`, error.message);
      }));
      await fetchFiles();
      setUploading(false);
    } else if (draggedItemRef.current && targetFolder && targetFolder !== draggedItemRef.current.name) {
      // FIX: read from ref instead of state so we always have the current dragged item
      const item = draggedItemRef.current;
      if (!item.id) return;
      setUploading(true);
      const oldPrefix = currentPath ? `${session.user.id}/${activeProject.id}/${currentPath}` : `${session.user.id}/${activeProject.id}`;
      const newPrefix = currentPath ? `${session.user.id}/${activeProject.id}/${currentPath}/${targetFolder}` : `${session.user.id}/${activeProject.id}/${targetFolder}`;
      const { error } = await supabase.storage.from("campaign_files").move(`${oldPrefix}/${item.name}`, `${newPrefix}/${item.name}`);
      if (error) { console.error("Move failed:", error.message); alert("Move failed: " + error.message); }
      draggedItemRef.current = null;
      await fetchFiles();
      setUploading(false);
    }
  };

  const createFolder = async () => {
    const name = window.prompt("Folder name:");
    if (!name || !name.trim()) return;
    setUploading(true);
    const folderPath = currentPath ? `${currentPath}/${name.trim()}` : name.trim();
    const path = `${session.user.id}/${activeProject.id}/${folderPath}/.emptyFolderPlaceholder`;
    await supabase.storage.from("campaign_files").upload(path, new Blob([""]), { upsert: true });
    await fetchFiles();
    setUploading(false);
  };

  const getUrl = (name) => {
    const p = currentPath ? `${session.user.id}/${activeProject.id}/${currentPath}/${name}` : `${session.user.id}/${activeProject.id}/${name}`;
    return supabase.storage.from("campaign_files").createSignedUrl(p).data?.publicUrl;
  };

  const deleteItem = async (item) => {
    if (item.id) {
      const p = currentPath ? `${session.user.id}/${activeProject.id}/${currentPath}/${item.name}` : `${session.user.id}/${activeProject.id}/${item.name}`;
      const { error } = await supabase.storage.from("campaign_files").remove([p]);
      if (!error) setFiles(prev => prev.filter(f => f.name !== item.name));
      else alert("Delete failed: " + error.message);
    } else {
      const confirm = window.confirm(`Delete folder "${item.name}" and all its contents?`);
      if (!confirm) return;
      setUploading(true);
      const folderPrefix = currentPath ? `${session.user.id}/${activeProject.id}/${currentPath}/${item.name}` : `${session.user.id}/${activeProject.id}/${item.name}`;
      const deleteRecursively = async (prefix) => {
        const data = await listAllStorageFiles("campaign_files", prefix);
        if (data.length > 0) {
          for (const d of data) {
            if (d.id) { await supabase.storage.from("campaign_files").remove([`${prefix}/${d.name}`]); }
            else { await deleteRecursively(`${prefix}/${d.name}`); }
          }
        }
        await supabase.storage.from("campaign_files").remove([`${prefix}/.emptyFolderPlaceholder`]);
      };
      await deleteRecursively(folderPrefix);
      await fetchFiles();
      setUploading(false);
    }
  };

  const renameItem = async (item) => {
    const newName = window.prompt("Rename to:", item.name);
    if (!newName || !newName.trim() || newName === item.name) return;
    setUploading(true);
    const oldPrefix = currentPath ? `${session.user.id}/${activeProject.id}/${currentPath}` : `${session.user.id}/${activeProject.id}`;
    if (item.id) {
      const { error } = await supabase.storage.from("campaign_files").move(`${oldPrefix}/${item.name}`, `${oldPrefix}/${newName.trim()}`);
      if (error) alert("Rename failed: " + error.message);
    } else {
      const oldFolderPrefix = `${oldPrefix}/${item.name}`;
      const newFolderPrefix = `${oldPrefix}/${newName.trim()}`;
      const moveRecursively = async (oldP, newP) => {
        const data = await listAllStorageFiles("campaign_files", oldP);
        if (data.length > 0) {
          for (const d of data) {
            if (d.id) { await supabase.storage.from("campaign_files").move(`${oldP}/${d.name}`, `${newP}/${d.name}`); }
            else { await moveRecursively(`${oldP}/${d.name}`, `${newP}/${d.name}`); }
          }
        }
      };
      await moveRecursively(oldFolderPrefix, newFolderPrefix);
    }
    await fetchFiles();
    setUploading(false);
  };

  const getFileIcon = (name) => {
    if (/\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(name)) return ICONS.audio;
    if (/\.(pdf)$/i.test(name)) return ICONS.pdf;
    return ICONS.note;
  };

  return (
    <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => handleDrop(e, null)}
      style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {currentPath ? (
            <>
              <button onClick={() => { const parts = currentPath.split("/"); parts.pop(); setCurrentPath(parts.join("/")); }}
                style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: "4px 8px", fontFamily: mono, fontSize: "10px", display: "flex", alignItems: "center", gap: "4px", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(${rgb},0.4)`; e.currentTarget.style.color = accent; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>⬅ back</button>
              <span style={{ fontFamily: mono, fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>/ {currentPath}</span>
            </>
          ) : (
            <span style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>{files.length} item{files.length !== 1 ? "s" : ""}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", color: `rgba(${rgb},0.4)` }}>
            {uploading ? "uploading/moving..." : dragging ? "drop to upload" : "drag files here"}
          </span>
          <button onClick={createFolder} style={{ background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.3)`, borderRadius: "6px", color: accent, fontFamily: mono, fontSize: "9px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "6px 12px", cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = `rgba(${rgb},0.2)`}
            onMouseLeave={e => e.currentTarget.style.background = `rgba(${rgb},0.1)`}>+ folder</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {files.length === 0 ? (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", opacity: 0.2, color: accent }}>
            {ICONS.upload}
            <p style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>no items yet</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
            {files.map(f => {
              const isFolder = !f.id;
              const url = isFolder ? null : getUrl(f.name);
              const isImg = isFolder ? false : /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name);
              return (
                <div key={f.name}
                  draggable={!isFolder}
                  onDragStart={e => {
                    // FIX: set ref immediately (synchronously) so handleDrop can read it
                    if (!isFolder) { draggedItemRef.current = f; e.dataTransfer.effectAllowed = "move"; }
                  }}
                  onDragEnd={() => { draggedItemRef.current = null; }}
                  onDragOver={e => { if (isFolder) { e.preventDefault(); e.stopPropagation(); } }}
                  onDrop={e => { if (isFolder) handleDrop(e, f.name); }}
                  onClick={() => { if (isFolder) setCurrentPath(currentPath ? `${currentPath}/${f.name}` : f.name); }}
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", padding: "14px", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "8px", position: "relative", alignItems: "center", cursor: isFolder ? "pointer" : "default", transition: "border-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `rgba(${rgb},0.4)`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
                  {isFolder ? (
                    <div style={{ height: "80px", color: accent, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.8 }}>{ICONS.folder}</div>
                  ) : isImg ? (
                    <div style={{ width: "100%", height: "80px", borderRadius: "4px", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.2)" }}>
                      <img src={url} alt={f.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} draggable={false} />
                    </div>
                  ) : (
                    <div style={{ height: "80px", color: accent, display: "flex", alignItems: "center", justifyContent: "center" }}>{getFileIcon(f.name)}</div>
                  )}
                  {isFolder ? (
                    <span style={{ width: "100%", fontFamily: mono, fontSize: "11px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "rgba(255,255,255,0.8)", textAlign: "center" }}>{f.name}</span>
                  ) : (
                    <a href={url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ width: "100%", fontFamily: mono, fontSize: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "rgba(255,255,255,0.6)", textDecoration: "none", textAlign: "center" }}>{f.name}</a>
                  )}
                  <div style={{ position: "absolute", top: "6px", right: "6px" }} onClick={e => e.stopPropagation()}>
                    <button onClick={e => { e.stopPropagation(); setItemMenuOpen(itemMenuOpen === f.name ? null : f.name); }}
                      style={{ background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "4px", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "2px 6px", fontSize: "14px", lineHeight: 1, opacity: 0, transition: "opacity 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                      className="item-menu-btn">···</button>
                    {itemMenuOpen === f.name && (
                      <>
                        <div onClick={e => { e.stopPropagation(); setItemMenuOpen(null); }} style={{ position: "fixed", inset: 0, zIndex: 9 }} />
                        <div style={{ position: "absolute", right: 0, top: "24px", zIndex: 10, background: "#1c1c1c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "4px", minWidth: "100px", display: "flex", flexDirection: "column", gap: "2px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                          <button onClick={e => { e.stopPropagation(); setItemMenuOpen(null); renameItem(f); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 8px", cursor: "pointer", borderRadius: "4px", textAlign: "left" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}>rename</button>
                          <button onClick={e => { e.stopPropagation(); setItemMenuOpen(null); deleteItem(f); }} style={{ background: "none", border: "none", color: "rgba(255,80,80,0.7)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 8px", cursor: "pointer", borderRadius: "4px", textAlign: "left" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,80,80,0.1)"}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}>delete</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`.item-menu-btn { opacity: 0; } div:hover > div > .item-menu-btn { opacity: 1; }`}</style>
    </div>
  );
};

// ─── SETTINGS TAB ──────────────────────────────────────────────────────────────

const SettingsTab = ({ accent, setAccentAndSave, user, onSignOut }) => {
  const presets = ["#fb4f2b", "#e63946", "#f4a261", "#2ec4b6", "#8338ec", "#06d6a0", "#118ab2"];
  const rgb = hexToRgb(accent);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState(null);

  const handleSendFeedback = async () => {
    if (!feedbackMsg.trim()) return;
    setFeedbackStatus("sending");
    const { error } = await supabase.from("feedback").insert({ user_id: user.id, email: user.email, message: feedbackMsg.trim() });
    if (error) { setFeedbackStatus("error"); console.error("Feedback error:", error); }
    else { setFeedbackStatus("sent"); setFeedbackMsg(""); }
    setTimeout(() => setFeedbackStatus(null), 2500);
  };

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
      <div style={{ paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, margin: "0 0 12px" }}>send bugs or ideas for features</p>
        <textarea value={feedbackMsg} onChange={e => setFeedbackMsg(e.target.value)} placeholder="describe a bug or suggest a feature..."
          style={{ width: "100%", minHeight: "80px", background: "rgba(255,255,255,0.04)", border: `1px solid rgba(${rgb},0.2)`, borderRadius: "6px", color: "rgba(255,255,255,0.75)", fontFamily: mono, fontSize: "12px", padding: "12px 14px", outline: "none", resize: "vertical", lineHeight: 1.6, transition: "border-color 0.2s" }}
          onFocus={e => e.currentTarget.style.borderColor = `rgba(${rgb},0.5)`}
          onBlur={e => e.currentTarget.style.borderColor = `rgba(${rgb},0.2)`} />
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" }}>
          <button onClick={handleSendFeedback} disabled={!feedbackMsg.trim() || feedbackStatus === "sending"}
            style={{ background: feedbackMsg.trim() ? `rgba(${rgb},0.12)` : "transparent", border: `1px solid ${feedbackMsg.trim() ? `rgba(${rgb},0.35)` : "rgba(255,255,255,0.08)"}`, borderRadius: "6px", color: feedbackMsg.trim() ? accent : "rgba(255,255,255,0.2)", fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", padding: "7px 14px", cursor: feedbackMsg.trim() ? "pointer" : "not-allowed", transition: "all 0.15s" }}
            onMouseEnter={e => { if (feedbackMsg.trim()) e.currentTarget.style.background = `rgba(${rgb},0.2)`; }}
            onMouseLeave={e => { if (feedbackMsg.trim()) e.currentTarget.style.background = `rgba(${rgb},0.12)`; }}>
            {feedbackStatus === "sending" ? "sending..." : "send"}
          </button>
          {feedbackStatus === "sent" && <span style={{ fontFamily: mono, fontSize: "10px", color: "#06d6a0", letterSpacing: "0.1em" }}>sent — thank you!</span>}
          {feedbackStatus === "error" && <span style={{ fontFamily: mono, fontSize: "10px", color: "rgba(255,80,80,0.8)", letterSpacing: "0.1em" }}>failed to send</span>}
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

// ─── MUSIC TAB ────────────────────────────────────────────────────────────────

const MusicTab = ({ accent, activeProject, session }) => {
  const [items, setItems] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [currentSong, setCurrentSong] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  // FIX: crossfade slider was missing from the UI — state is retained and slider re-added
  const [crossfade, setCrossfade] = useState(3);
  const [queue, setQueue] = useState([]);
  const [endMessage, setEndMessage] = useState(false);
  const audioA = useRef(new Audio());
  const audioB = useRef(new Audio());
  const active = useRef("a");
  const rgb = hexToRgb(accent);

  const getAudio = () => active.current === "a" ? audioA.current : audioB.current;
  const getNext = () => active.current === "a" ? audioB.current : audioA.current;

  const fetchItems = async () => {
    const prefix = currentPath ? `${session.user.id}/${activeProject.id}/${currentPath}` : `${session.user.id}/${activeProject.id}`;
    const data = await listAllStorageFiles("campaign_files", prefix);
    const audioExts = /\.(mp3|wav|ogg|flac|m4a|aac)$/i;
    const filtered = data.filter(f => f.name !== ".emptyFolderPlaceholder" && (!f.id || audioExts.test(f.name)));
    setItems(filtered);
  };

  useEffect(() => { fetchItems(); }, [activeProject.id, currentPath]);

  // FIX: getUrl now correctly builds the full path including subfolder when currentPath is set
  const getUrl = (fullRelativePath) => {
    const p = `${session.user.id}/${activeProject.id}/${fullRelativePath}`;
    return supabase.storage.from("campaign_files").createSignedUrl(p).data?.publicUrl;
  };

  // FIX: playSong now passes the full relative path to getUrl instead of just the basename
  const playSong = (fullPath) => {
    setEndMessage(false);
    const url = getUrl(fullPath);
    const cur = getAudio();
    cur.src = url;
    cur.volume = volume;
    // FIX: handle the play() promise to avoid unhandled rejection on browsers that block autoplay
    const playPromise = cur.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => { console.warn("Playback blocked:", err); });
    }
    setCurrentSong(fullPath);
    setPlaying(true);
  };

  useEffect(() => {
    const cur = getAudio();
    const onTime = () => setProgress(cur.currentTime);
    const onMeta = () => setDuration(cur.duration);
    const onEnd = () => {
      if (queue.length > 0) {
        const [next, ...rest] = queue;
        setQueue(rest);
        playSong(next);
      } else {
        setPlaying(false);
        setEndMessage(true);
      }
    };
    cur.addEventListener("timeupdate", onTime);
    cur.addEventListener("loadedmetadata", onMeta);
    cur.addEventListener("ended", onEnd);
    return () => {
      cur.removeEventListener("timeupdate", onTime);
      cur.removeEventListener("loadedmetadata", onMeta);
      cur.removeEventListener("ended", onEnd);
    };
  }, [queue, crossfade, volume]);

  useEffect(() => {
    const cur = getAudio();
    if (playing && cur) cur.volume = volume;
  }, [volume]);

  const seekTo = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const a = getAudio();
    if (a.duration) { a.currentTime = pct * a.duration; setProgress(a.currentTime); }
  };

  const addToQueue = (songName) => { setEndMessage(false); setQueue(prev => [...prev, songName]); };
  const removeFromQueue = (index) => { setQueue(prev => prev.filter((_, i) => i !== index)); };
  const fmt = (s) => { if (!s || isNaN(s)) return "0:00"; const m = Math.floor(s / 60); const sec = Math.floor(s % 60); return `${m}:${sec < 10 ? "0" : ""}${sec}`; };
  const getBasename = (path) => path ? path.split("/").pop() : "";
  const stripExt = (name) => name.replace(/\.[^.]+$/, "");

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <div style={{ width: "260px", flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {currentPath ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button onClick={() => { const parts = currentPath.split("/"); parts.pop(); setCurrentPath(parts.join("/")); }}
                style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: "2px 6px", fontFamily: mono, fontSize: "9px", display: "flex", alignItems: "center", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(${rgb},0.4)`; e.currentTarget.style.color = accent; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>⬅</button>
              <span style={{ fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>/ {currentPath}</span>
            </div>
          ) : (
            <p style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: 0 }}>catalog</p>
          )}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
          {items.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "12px", opacity: 0.2, color: accent }}>
              {ICONS.audio}
              <p style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>no items</p>
              <p style={{ fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.3)", margin: 0, textAlign: "center" }}>upload audio in files tab</p>
            </div>
          ) : items.map(s => {
            const isFolder = !s.id;
            const fullPath = currentPath ? `${currentPath}/${s.name}` : s.name;
            if (isFolder) return (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "6px", cursor: "pointer", color: "rgba(255,255,255,0.8)", transition: "all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                onClick={() => setCurrentPath(fullPath)}>
                <span style={{ opacity: 0.8, flexShrink: 0, color: accent }}>{ICONS.folder}</span>
                <span style={{ fontFamily: mono, fontSize: "11px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</span>
              </div>
            );
            return (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "6px", cursor: "pointer", background: currentSong === fullPath ? `rgba(${rgb},0.12)` : "transparent", color: currentSong === fullPath ? accent : "rgba(255,255,255,0.55)", transition: "all 0.15s" }}
                onMouseEnter={e => { if (currentSong !== fullPath) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { if (currentSong !== fullPath) e.currentTarget.style.background = "transparent"; }}
                onClick={() => playSong(fullPath)}>
                <span style={{ opacity: 0.5, flexShrink: 0 }}>{ICONS.audio}</span>
                <span style={{ fontFamily: mono, fontSize: "11px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stripExt(s.name)}</span>
                <button onClick={e => { e.stopPropagation(); addToQueue(fullPath); }}
                  style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "2px 6px", fontFamily: mono, fontSize: "9px", flexShrink: 0, transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `rgba(${rgb},0.4)`; e.currentTarget.style.color = accent; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}>+</button>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px", padding: "32px 24px" }}>
          <div style={{ width: "120px", height: "120px", borderRadius: "12px", background: `rgba(${rgb},0.08)`, border: `1px solid rgba(${rgb},0.15)`, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: mono, fontSize: "13px", color: currentSong ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)", margin: "0 0 4px", letterSpacing: "0.05em" }}>
              {currentSong ? stripExt(getBasename(currentSong)) : "nothing playing"}
            </p>
            {endMessage && <p style={{ fontFamily: mono, fontSize: "9px", color: `rgba(${rgb},0.5)`, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>queue ended</p>}
          </div>
          <div style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div onClick={currentSong ? seekTo : undefined} style={{ width: "100%", height: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", cursor: currentSong ? "pointer" : "default", position: "relative" }}>
              <div style={{ height: "100%", background: accent, borderRadius: "2px", width: `${duration ? (progress / duration) * 100 : 0}%`, transition: "width 0.5s linear" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>{fmt(progress)}</span>
              <span style={{ fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>{fmt(duration)}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
              <button onClick={() => { const a = getAudio(); if (a.currentTime > 3) a.currentTime = 0; else if (currentSong) playSong(currentSong); }}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: "8px", borderRadius: "6px", display: "flex", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = accent} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" /></svg>
              </button>
              <button onClick={() => { const a = getAudio(); if (playing) { a.pause(); setPlaying(false); } else if (currentSong) { const p = a.play(); if (p !== undefined) p.catch(e => console.warn(e)); setPlaying(true); } }}
                style={{ background: `rgba(${rgb},0.12)`, border: `1px solid rgba(${rgb},0.3)`, color: accent, cursor: "pointer", padding: "12px", borderRadius: "50%", display: "flex", transition: "all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = `rgba(${rgb},0.22)`} onMouseLeave={e => e.currentTarget.style.background = `rgba(${rgb},0.12)`}>
                {playing
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                }
              </button>
              <button onClick={() => { if (queue.length > 0) { const [next, ...rest] = queue; setQueue(rest); playSong(next); } }}
                style={{ background: "none", border: "none", color: queue.length > 0 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)", cursor: queue.length > 0 ? "pointer" : "default", padding: "8px", borderRadius: "6px", display: "flex", transition: "color 0.15s" }}
                onMouseEnter={e => { if (queue.length > 0) e.currentTarget.style.color = accent; }} onMouseLeave={e => { e.currentTarget.style.color = queue.length > 0 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)"; }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" /></svg>
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>vol</span>
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setVolume(parseFloat(e.target.value))} style={{ flex: 1, accentColor: accent }} />
            </div>
            {/* FIX: crossfade slider restored */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase", flexShrink: 0 }}>fade</span>
              <input type="range" min="0" max="10" step="0.5" value={crossfade} onChange={e => setCrossfade(parseFloat(e.target.value))} style={{ flex: 1, accentColor: accent }} />
              <span style={{ fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.2)", minWidth: "24px" }}>{crossfade}s</span>
            </div>
          </div>
        </div>
        {queue.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "10px 20px", maxHeight: "160px", overflowY: "auto" }}>
            <p style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 8px" }}>queue</p>
            {queue.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0" }}>
                <span style={{ fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.2)", width: "16px", textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontFamily: mono, fontSize: "10px", color: "rgba(255,255,255,0.45)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stripExt(getBasename(s))}</span>
                <button onClick={() => removeFromQueue(i)} style={{ background: "none", border: "none", color: "rgba(255,80,80,0.3)", cursor: "pointer", fontSize: "12px", lineHeight: 1, padding: "0 2px" }}
                  onMouseEnter={e => e.currentTarget.style.color = "rgba(255,80,80,0.8)"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(255,80,80,0.3)"}>×</button>
              </div>
            ))}
          </div>
        )}
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {activeProject && (
              <button onClick={() => setActiveProject(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "4px 2px", display: "flex", alignItems: "center", transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11 4L6 9l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
              <div style={{ display: activeTab === "music" ? "block" : "none", height: "100%" }}>
                <MusicTab accent={accent} activeProject={activeProject} session={session} />
              </div>
              {activeTab === "map" && <MapTab accent={accent} activeProject={activeProject} session={session} onUpdateMap={handleUpdateMap} onClearMap={handleClearMap} />}
              {activeTab === "notes" && <NotesTab accent={accent} activeProject={activeProject} session={session} />}
              {activeTab === "files" && <FilesTab accent={accent} activeProject={activeProject} session={session} />}
              {activeTab === "settings" && <SettingsTab accent={accent} setAccentAndSave={setAccentAndSave} user={session.user} onSignOut={handleSignOut} />}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <ProjectList accent={accent} projects={projects} onOpen={p => { setActiveProject(p); setActiveTab("music"); }} onCreate={() => setShowCreateModal(true)} onRename={handleRenameProject} onDelete={handleDeleteProject} />
          </div>
        )}

        <div style={{ padding: "10px 24px", borderTop: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontFamily: mono, fontSize: "9px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.12)", textTransform: "uppercase" }}>v0.13.9</span>
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
