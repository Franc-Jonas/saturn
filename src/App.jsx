import { useState, useEffect, useRef } from "react";
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
    files: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3a1 1 0 011-1h4l2 2h4a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
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

const ProjectList = ({ accent, projects, onOpen, onCreate, onUpdateProject, onDelete }) => {
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
      <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", padding: "4px 8px", borderRadius: "4px", fontSize: "16px", lineHeight: 1 }}>···</button>
      {menuOpen === p.id && (
        <div style={{ position: "absolute", right: 0, top: "28px", zIndex: 10, background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px", minWidth: "130px", display: "flex", flexDirection: "column", gap: "2px" }}>
        <button onClick={e => { e.stopPropagation(); setRenaming(p); setMenuOpen(null); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontFamily: mono, fontSize: "10px", padding: "8px 10px", cursor: "pointer", textAlign: "left" }}>rename</button>
        <button onClick={e => { e.stopPropagation(); onDelete(p.id); setMenuOpen(null); }} style={{ background: "none", border: "none", color: "rgba(255,80,80,0.6)", fontFamily: mono, fontSize: "10px", padding: "8px 10px", cursor: "pointer", textAlign: "left" }}>delete</button>
        </div>
      )}
      </div>
      </div>
    ))}
    </div>
    </div>
    {renaming && <RenameModal accent={accent} project={renaming} onClose={() => setRenaming(null)} onSave={name => { onUpdateProject(renaming.id, { name }); setRenaming(null); }} />}
    </>
  );
};

const MapTab = ({ accent, activeProject, session, onUpdateProject }) => {
  const [uploading, setUploading] = useState(false);
  const containerRef = useRef(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const onDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    const filePath = `${session.user.id}/${activeProject.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('campaign_files').upload(filePath, file);
    if (!error) {
      const { data } = supabase.storage.from('campaign_files').getPublicUrl(filePath);
      onUpdateProject(activeProject.id, { map_url: data.publicUrl });
    }
    setUploading(false);
  };

  return (
    <div ref={containerRef}
    onDragOver={e => e.preventDefault()}
    onDrop={onDrop}
    onMouseDown={e => { setIsDragging(true); setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y }); }}
    onMouseMove={e => isDragging && setTransform(t => ({ ...t, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }))}
    onMouseUp={() => setIsDragging(false)}
    onMouseLeave={() => setIsDragging(false)}
    style={{ height: "100%", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", cursor: isDragging ? "grabbing" : (activeProject.map_url ? "grab" : "default") }}>
    {activeProject.map_url ? (
      <img src={activeProject.map_url} alt="Map" draggable={false} style={{ position: "absolute", transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, transition: isDragging ? "none" : "transform 0.1s ease-out" }} />
    ) : (
      <p style={{ fontFamily: mono, fontSize: "12px", color: accent, opacity: 0.4 }}>{uploading ? "uploading..." : "drag map here"}</p>
    )}
    </div>
  );
};

const NotesTab = ({ accent, session, activeProject }) => {
  const rgb = hexToRgb(accent);
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [activeNote, setActiveNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const saveTimeout = useRef(null);

  const fetchNotes = async () => {
    const { data } = await supabase.from("notes").select("*").eq("project_id", activeProject.id).order("is_folder", { ascending: false }).order("name", { ascending: true });
    if (data) setNotes(data);
    setLoading(false);
  };

  useEffect(() => { fetchNotes(); }, [activeProject.id]);

  useEffect(() => {
    if (activeNoteId) {
      const n = notes.find(n => n.id === activeNoteId);
      setActiveNote(n);
    } else {
      setActiveNote(null);
    }
  }, [activeNoteId, notes]);

  const createNote = async (name = "Untitled", isFolder = false, parentId = null) => {
    const { data } = await supabase.from("notes").insert({ project_id: activeProject.id, user_id: session.user.id, name, is_folder: isFolder, parent_id: parentId, content: isFolder ? "" : `# ${name}\n\n` }).select().single();
    if (data) {
      setNotes(prev => [...prev, data]);
      if (!isFolder) setActiveNoteId(data.id);
    }
    return data;
  };

  const handleUpdateContent = (content) => {
    setActiveNote(prev => ({ ...prev, content }));
    // Extract first line for title
    const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim() || "Untitled";

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      await supabase.from("notes").update({ content, name: firstLine, updated_at: new Date().toISOString() }).eq("id", activeNote.id);
      fetchNotes();
    }, 1000);
  };

  const handleLinkClick = async (targetName) => {
    const existing = notes.find(n => !n.is_folder && n.name.toLowerCase() === targetName.toLowerCase());
    if (existing) {
      setActiveNoteId(existing.id);
    } else {
      const newNote = await createNote(targetName);
      if (newNote) setActiveNoteId(newNote.id);
    }
  };

  const renderContent = (content) => {
    if (!content) return null;
    const parts = content.split(/(\[\[.*?\]\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const name = part.slice(2, -2);
        return <span key={i} onClick={() => handleLinkClick(name)} style={{ color: accent, textDecoration: "underline", cursor: "pointer" }}>{name}</span>;
      }
      return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{part}</span>;
    });
  };

  const deleteItem = async (e, id) => {
    e.stopPropagation();
    await supabase.from("notes").delete().eq("id", id);
    if (activeNoteId === id) setActiveNoteId(null);
    fetchNotes();
  };

  const NoteTree = ({ parentId = null, depth = 0 }) => {
    const items = notes.filter(n => n.parent_id === parentId);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {items.map(item => (
        <div key={item.id}>
        <div onClick={() => !item.is_folder && setActiveNoteId(item.id)}
        style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", paddingLeft: `${depth * 16 + 12}px`, cursor: "pointer", borderRadius: "6px", background: activeNoteId === item.id ? `rgba(${rgb},0.15)` : "transparent", color: activeNoteId === item.id ? accent : "rgba(255,255,255,0.6)", transition: "all 0.15s", fontSize: "12px", fontFamily: mono }}>
        {item.is_folder ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
        )}
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
        <button onClick={(e) => deleteItem(e, item.id)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.1)", cursor: "pointer", fontSize: "10px" }}>×</button>
        </div>
        {item.is_folder && <NoteTree parentId={item.id} depth={depth + 1} />}
        </div>
      ))}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
    {/* Explorer */}
    <div style={{ width: "240px", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.2)" }}>
    <div style={{ padding: "16px", display: "flex", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
    <button onClick={() => createNote()} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#ddd", fontSize: "10px", padding: "6px", fontFamily: mono, cursor: "pointer" }}>+ note</button>
    <button onClick={() => createNote("New Folder", true)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#ddd", fontSize: "10px", padding: "6px", fontFamily: mono, cursor: "pointer" }}>+ folder</button>
    </div>
    <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
    {loading ? <p style={{ textAlign: "center", fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>loading...</p> : <NoteTree />}
    </div>
    </div>

    {/* Editor */}
    <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
    {activeNote ? (
      <>
      <div style={{ padding: "8px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "flex-end" }}>
      <button onClick={() => setIsPreview(!isPreview)} style={{ background: isPreview ? `rgba(${rgb},0.1)` : "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: isPreview ? accent : "rgba(255,255,255,0.4)", fontSize: "10px", padding: "4px 10px", fontFamily: mono, cursor: "pointer" }}>
      {isPreview ? "editing" : "preview"}
      </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "40px" }}>
      {isPreview ? (
        <div style={{ color: "#ddd", fontFamily: mono, fontSize: "14px", lineHeight: "1.6", maxWidth: "800px", margin: "0 auto" }}>
        {renderContent(activeNote.content)}
        </div>
      ) : (
        <textarea value={activeNote.content} onChange={e => handleUpdateContent(e.target.value)}
        style={{ width: "100%", height: "100%", background: "none", border: "none", outline: "none", color: "#ddd", fontFamily: mono, fontSize: "14px", lineHeight: "1.6", resize: "none", maxWidth: "800px", margin: "0 auto", display: "block" }}
        placeholder="Start writing..." />
      )}
      </div>
      </>
    ) : (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.2 }}>
      <p style={{ fontFamily: mono, fontSize: "12px" }}>select or create a note</p>
      </div>
    )}
    </div>
    </div>
  );
};

const FilesTab = ({ accent, session, activeProject }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const loadFiles = async () => {
    const { data } = await supabase.storage.from('campaign_files').list(`${session.user.id}/${activeProject.id}`);
    if (data) setFiles(data.filter(f => f.name !== '.emptyFolderPlaceholder'));
  };
    useEffect(() => { loadFiles(); }, [activeProject.id]);

    const handleUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      const filePath = `${session.user.id}/${activeProject.id}/${Date.now()}_${file.name}`;
      await supabase.storage.from('campaign_files').upload(filePath, file);
      setUploading(false); loadFiles();
    };

    return (
      <div style={{ padding: "32px 28px" }}>
      <label style={{ cursor: "pointer", color: accent, fontFamily: mono, fontSize: "12px" }}>
      {uploading ? "uploading..." : "+ upload file"}
      <input type="file" onChange={handleUpload} style={{ display: "none" }} />
      </label>
      <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
      {files.map(f => (
        <div key={f.id} style={{ padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "6px", fontFamily: mono, fontSize: "12px", color: "#aaa" }}>{f.name.replace(/^\d+_/, '')}</div>
      ))}
      </div>
      </div>
    );
};

const SettingsTab = ({ accent, setAccentAndSave, user, onSignOut }) => {
  const presets = ["#fb4f2b", "#e63946", "#f4a261", "#2ec4b6", "#8338ec", "#06d6a0", "#118ab2"];
  return (
    <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: "32px" }}>
    <div>
    <p style={{ fontFamily: mono, fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, margin: "0 0 16px" }}>primary color</p>
    <div style={{ display: "flex", gap: "10px" }}>
    {presets.map(c => <button key={c} onClick={() => setAccentAndSave(c)} style={{ width: "32px", height: "32px", borderRadius: "50%", background: c, border: accent === c ? "2px solid #fff" : "none", cursor: "pointer" }} />)}
    </div>
    </div>
    <button onClick={onSignOut} style={{ alignSelf: "flex-start", background: "none", border: "1px solid rgba(255,80,80,0.2)", borderRadius: "6px", color: "rgba(255,100,100,0.6)", fontFamily: mono, fontSize: "10px", padding: "7px 14px", cursor: "pointer" }}>sign out</button>
    </div>
  );
};

export default function Saturn() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("notes");
  const [accent, setAccent] = useState(defaultColor);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) { loadSettings(session.user.id); loadProjects(session.user.id); }
    });
  }, []);

  const loadSettings = async (uid) => {
    const { data } = await supabase.from("user_settings").select("accent_color").eq("id", uid).single();
    if (data?.accent_color) setAccent(data.accent_color);
  };

    const loadProjects = async (uid) => {
      const { data } = await supabase.from("projects").select("*").eq("user_id", uid).order("created_at", { ascending: false });
      if (data) setProjects(data);
    };

      const handleCreateProject = async ({ name, icon }) => {
        const { data } = await supabase.from("projects").insert({ user_id: session.user.id, name, icon }).select().single();
        if (data) { setProjects(prev => [data, ...prev]); setActiveProject(data); }
        setShowCreateModal(false);
      };

      if (!session) return <LoginScreen accent={accent} />;
      const rgb = hexToRgb(accent);

      return (
        <div style={{ position: "fixed", inset: 0, background: "#0e0e0e", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
        <span style={{ fontFamily: mono, fontSize: "22px", fontWeight: "700", color: accent }}>◉ SATURN</span>
        {activeProject && <span style={{ fontFamily: mono, fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>/ {activeProject.name}</span>}
        </div>
        {activeProject && <button onClick={() => setActiveProject(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "10px", fontFamily: mono }}>EXIT CAMPAIGN</button>}
        </div>

        {activeProject ? (
          <>
          <div style={{ display: "flex", padding: "0 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.3)" }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "12px 16px", background: "none", border: "none", borderBottom: activeTab === tab ? `2px solid ${accent}` : "2px solid transparent", color: activeTab === tab ? accent : "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: mono, fontSize: "11px", textTransform: "uppercase" }}>{tab}</button>
          ))}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
          {activeTab === "notes" && <NotesTab accent={accent} session={session} activeProject={activeProject} />}
          {activeTab === "map" && <MapTab accent={accent} session={session} activeProject={activeProject} onUpdateProject={(id, u) => setActiveProject({...activeProject, ...u})} />}
          {activeTab === "files" && <FilesTab accent={accent} session={session} activeProject={activeProject} />}
          {activeTab === "settings" && <SettingsTab accent={accent} setAccentAndSave={setAccent} user={session.user} onSignOut={() => setSession(null)} />}
          {(activeTab === "music") && <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', opacity:0.3, fontFamily:mono, fontSize:'12px'}}>{activeTab} coming soon</div>}
          </div>
          </>
        ) : (
          <ProjectList accent={accent} projects={projects} onOpen={setActiveProject} onCreate={() => setShowCreateModal(true)} />
        )}
        {showCreateModal && <CreateProjectModal accent={accent} onClose={() => setShowCreateModal(false)} onSave={handleCreateProject} />}
        </div>
      );
}
