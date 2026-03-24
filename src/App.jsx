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

// --- SVGS ---
const ICONS = {
  folder: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>,
  folderOpen: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 19L2 9h16l4 10H6z"></path><path d="M6 19l-4-10V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v2"></path></svg>,
  note: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>,
  chevronDown: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  chevronRight: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
  upload: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
};

const PROJECT_ICONS = [
  { id: "sword", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M14 2l4 4-9 9-2 1 1-2 9-9zM2 18l3-3M11 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
{ id: "castle", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 18V8h3V6h2V4h1V2h2v2h1v2h2v2h3v10H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 18v-4h4v4" stroke="currentColor" strokeWidth="1.5"/><path d="M3 8h14" stroke="currentColor" strokeWidth="1.5"/></svg> },
{ id: "dragon", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3c-1 0-2 .5-2.5 1.5L6 7l-3 1 2 2-1 3 3-1 2 2 2-2 3 1-1-3 2-2-3-1-1.5-2.5C13 4 12 3 10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 9v5M8 16l2 2 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
{ id: "skull", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C6.686 2 4 4.686 4 8c0 2.21 1.19 4.14 2.97 5.22L7 15h6l.03-1.78C14.81 12.14 16 10.21 16 8c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.5"/><path d="M7 15v2h6v-2M8 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg> },
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

// --- COMPONENTS ---

const MapTab = ({ accent, activeProject, session, onUpdateMap }) => {
  const [uploading, setUploading] = useState(false);
  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    const path = `${session.user.id}/${activeProject.id}/map_${Date.now()}`;
    const { error } = await supabase.storage.from("campaign_files").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("campaign_files").getPublicUrl(path);
      onUpdateMap(data.publicUrl);
    }
    setUploading(false);
  };
  return (
    <div onDragOver={e => e.preventDefault()} onDrop={handleDrop} style={{ height: "100%", background: "#050505", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
    {activeProject.map_url ? (
      <img src={activeProject.map_url} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} alt="Map" />
    ) : (
      <div style={{ textAlign: "center", opacity: 0.2, color: accent }}>
      <div style={{ marginBottom: "12px" }}>{ICONS.upload}</div>
      <p style={{ fontFamily: mono, fontSize: "10px" }}>{uploading ? "UPLOADING..." : "DRAG MAP IMAGE HERE"}</p>
      </div>
    )}
    </div>
  );
};

const FilesTab = ({ activeProject, session, accent }) => {
  const [files, setFiles] = useState([]);
  const fetchFiles = async () => {
    const { data } = await supabase.storage.from("campaign_files").list(`${session.user.id}/${activeProject.id}`);
    if (data) setFiles(data);
  };
    useEffect(() => { fetchFiles(); }, []);
    return (
      <div style={{ padding: "40px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "20px" }}>
      {files.map(f => (
        <div key={f.name} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
        <div style={{ color: accent, marginBottom: "8px" }}>{ICONS.note}</div>
        <div style={{ fontFamily: mono, fontSize: "10px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
        </div>
      ))}
      </div>
    );
};

const NotesTab = ({ accent, activeProject, session }) => {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [activeNote, setActiveNote] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [expanded, setExpanded] = useState(new Set());
  const rgb = hexToRgb(accent);

  const fetchNotes = async () => {
    const { data } = await supabase.from("notes").select("*").eq("project_id", activeProject.id).order("is_folder", { ascending: false });
    if (data) setNotes(data);
  };

    useEffect(() => { fetchNotes(); }, [activeProject.id]);
    useEffect(() => {
      const n = notes.find(n => n.id === activeNoteId);
      if (n) setActiveNote(n);
    }, [activeNoteId, notes]);

      const createItem = async (isFolder = false, parentId = null) => {
        const name = isFolder ? "New Folder" : "Untitled Note";
        const { data } = await supabase.from("notes").insert({
          project_id: activeProject.id, user_id: session.user.id, name, is_folder: isFolder, parent_id: parentId, content: isFolder ? "" : "# " + name
        }).select().single();
        if (data) {
          setNotes([...notes, data]);
          if (!isFolder) setActiveNoteId(data.id);
          if (parentId) { const next = new Set(expanded); next.add(parentId); setExpanded(next); }
        }
      };

      const handleUpdate = async (content) => {
        setActiveNote(prev => ({ ...prev, content }));
        const name = content.split('\n')[0].replace(/^#+\s*/, '').trim() || "Untitled";
        await supabase.from("notes").update({ content, name }).eq("id", activeNote.id);
        fetchNotes();
      };

      // --- HYPERLINK SYSTEM ---
      const renderContent = (text) => {
        const parts = text.split(/(\[\[.*?\]\])/g);
        return parts.map((part, i) => {
          if (part.startsWith('[[') && part.endsWith(']]')) {
            const noteName = part.slice(2, -2);
            const target = notes.find(n => n.name.toLowerCase() === noteName.toLowerCase());
            return (
              <span key={i} onClick={() => target && setActiveNoteId(target.id)}
              style={{ color: accent, cursor: target ? "pointer" : "help", textDecoration: "underline", opacity: target ? 1 : 0.4 }}>
              {noteName}
              </span>
            );
          }
          return part;
        });
      };

      const NoteTree = ({ parentId = null, depth = 0 }) => {
        const items = notes.filter(n => n.parent_id === parentId);
        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
          {items.map(item => (
            <div key={item.id}>
            <div onClick={() => item.is_folder ? setExpanded(prev => { const n = new Set(prev); n.has(item.id) ? n.delete(item.id) : n.add(item.id); return n; }) : setActiveNoteId(item.id)}
            style={{ padding: "6px 16px", paddingLeft: `${depth * 12 + 16}px`, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", fontFamily: mono, color: activeNoteId === item.id ? accent : "rgba(255,255,255,0.6)", background: activeNoteId === item.id ? `rgba(${rgb},0.1)` : "none" }}>
            <span style={{ opacity: 0.3 }}>{item.is_folder ? (expanded.has(item.id) ? ICONS.chevronDown : ICONS.chevronRight) : null}</span>
            <span>{item.is_folder ? (expanded.has(item.id) ? ICONS.folderOpen : ICONS.folder) : ICONS.note}</span>
            {item.name}
            </div>
            {item.is_folder && expanded.has(item.id) && <NoteTree parentId={item.id} depth={depth + 1} />}
            </div>
          ))}
          </div>
        );
      };

      return (
        <div style={{ display: "flex", height: "100%" }}>
        <div style={{ width: "240px", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px", display: "flex", gap: "6px" }}>
        <button onClick={() => createItem(false)} style={{ flex: 1, background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#888", fontSize: "9px", padding: "6px", cursor: "pointer", fontFamily: mono }}>+ NOTE</button>
        <button onClick={() => createItem(true)} style={{ flex: 1, background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#888", fontSize: "9px", padding: "6px", cursor: "pointer", fontFamily: mono }}>+ FOLDER</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}><NoteTree /></div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0c0c0c" }}>
        {activeNote ? (
          <>
          <div style={{ padding: "8px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => setIsPreview(!isPreview)} style={{ background: "none", border: `1px solid ${accent}`, color: accent, fontSize: "10px", padding: "4px 12px", cursor: "pointer", fontFamily: mono, borderRadius: "4px" }}>{isPreview ? "EDIT" : "PREVIEW"}</button>
          </div>
          <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
          {isPreview ? (
            <div style={{ whiteSpace: "pre-wrap", fontFamily: mono, color: "#ddd", lineHeight: 1.6 }}>{renderContent(activeNote.content)}</div>
          ) : (
            <textarea value={activeNote.content} onChange={e => handleUpdate(e.target.value)} style={{ width: "100%", height: "100%", background: "none", border: "none", outline: "none", color: "#ddd", fontFamily: mono, fontSize: "14px", resize: "none" }} />
          )}
          </div>
          </>
        ) : <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.1, fontFamily: mono }}>VOID</div>}
        </div>
        </div>
      );
};

export default function Saturn() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("notes");
  const [accent, setAccent] = useState(defaultColor);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        supabase.from("projects").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).then(({ data }) => setProjects(data || []));
        supabase.from("user_settings").select("accent_color").eq("id", session.user.id).single().then(({ data }) => data && setAccent(data.accent_color));
      }
    });
  }, []);

  if (!session) return <div style={{ height: "100vh", background: "#0e0e0e", display: "flex", alignItems: "center", justifyContent: "center" }}><button onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })} style={{ padding: "12px 24px", fontFamily: mono }}>Connect with Google</button></div>;
  const rgb = hexToRgb(accent);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0e0e0e", color: "#fff", display: "flex", flexDirection: "column" }}>
    {/* Header */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontFamily: mono, fontSize: "20px", fontWeight: "700", color: accent, textShadow: `0 0 20px rgba(${rgb},0.4)` }}>◉ SATURN</span>
    {activeProject && <span style={{ fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>// {activeProject.name}</span>}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: accent, boxShadow: `0 0 10px ${accent}`, animation: "pulse 2s infinite" }} />
    <img src={session.user.user_metadata.avatar_url} style={{ width: "32px", height: "32px", borderRadius: "50%", border: `1px solid ${accent}` }} alt="PFP" />
    </div>
    </div>

    {activeProject ? (
      <>
      <div style={{ display: "flex", padding: "0 24px", background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      {tabs.map(tab => (
        <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "12px 16px", background: "none", border: "none", borderBottom: activeTab === tab ? `2px solid ${accent}` : "2px solid transparent", color: activeTab === tab ? accent : "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: mono, fontSize: "10px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "8px" }}>
        <TabIcon tab={tab} /> {tab}
        </button>
      ))}
      <button onClick={() => setActiveProject(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontFamily: mono, fontSize: "9px" }}>[ DISCONNECT ]</button>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
      {activeTab === "notes" && <NotesTab accent={accent} activeProject={activeProject} session={session} />}
      {activeTab === "map" && <MapTab accent={accent} activeProject={activeProject} session={session} onUpdateMap={(url) => { setActiveProject({...activeProject, map_url: url}); supabase.from("projects").update({ map_url: url }).eq("id", activeProject.id); }} />}
      {activeTab === "files" && <FilesTab accent={accent} activeProject={activeProject} session={session} />}
      {activeTab === "settings" && (
        <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
        <p style={{ fontFamily: mono, fontSize: "10px", color: accent, marginBottom: "12px" }}>COLOR ACCENT</p>
        <input type="color" value={accent} onChange={e => { setAccent(e.target.value); supabase.from("user_settings").upsert({ id: session.user.id, accent_color: e.target.value }); }} />
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} style={{ width: "fit-content", background: "none", border: "1px solid #ff4444", color: "#ff4444", padding: "8px 16px", fontFamily: mono, cursor: "pointer" }}>SIGN OUT</button>
        </div>
      )}
      </div>
      </>
    ) : (
      <div style={{ padding: "60px", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px" }}>
      <h2 style={{ fontFamily: mono, fontSize: "12px", opacity: 0.3 }}>ARCHIVES</h2>
      <button onClick={() => setShowCreate(true)} style={{ background: "none", border: `1px solid ${accent}`, color: accent, padding: "8px 20px", fontFamily: mono, fontSize: "10px", cursor: "pointer" }}>+ INITIATE NEW</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
      {projects.map(p => (
        <div key={p.id} onClick={() => setActiveProject(p)} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "24px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ color: accent }}>{PROJECT_ICONS.find(i => i.id === p.icon)?.svg || PROJECT_ICONS[0].svg}</div>
        <span style={{ fontFamily: mono }}>{p.name}</span>
        </div>
      ))}
      </div>
      </div>
    )}

    {showCreate && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "#111", padding: "32px", borderRadius: "12px", border: "1px solid #333", width: "320px" }}>
      <input id="new-p-name" placeholder="Campaign Name" style={{ width: "100%", padding: "10px", background: "#222", border: "1px solid #444", color: "#fff", marginBottom: "20px", fontFamily: mono }} />
      <button onClick={() => {
        const name = document.getElementById("new-p-name").value;
        supabase.from("projects").insert({ user_id: session.user.id, name, icon: "sword" }).select().single().then(({ data }) => { if (data) setProjects([data, ...projects]); setShowCreate(false); });
      }} style={{ width: "100%", padding: "10px", background: accent, border: "none", fontFamily: mono, cursor: "pointer" }}>CREATE</button>
      </div>
      </div>
    )}

    <style>{`
      @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `}</style>
      </div>
  );
}
