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

// --- ICONS ---
const ICONS = {
  folder: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>,
  folderOpen: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 19L2 9h16l4 10H6z"></path><path d="M6 19l-4-10V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v2"></path></svg>,
  note: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>,
  mapPlaceholder: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>,
  chevronDown: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  chevronRight: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
};

const PROJECT_ICONS = [
  { id: "sword", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M14 2l4 4-9 9-2 1 1-2 9-9zM2 18l3-3M11 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
{ id: "skull", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C6.686 2 4 4.686 4 8c0 2.21 1.19 4.14 2.97 5.22L7 15h6l.03-1.78C14.81 12.14 16 10.21 16 8c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="1.5"/><path d="M7 15v2h6v-2M8 18h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg> },
{ id: "castle", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 18V8h3V6h2V4h1V2h2v2h1v2h2v2h3v10H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 18v-4h4v4" stroke="currentColor" strokeWidth="1.5"/><path d="M3 8h14" stroke="currentColor" strokeWidth="1.5"/></svg> },
{ id: "dragon", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3c-1 0-2 .5-2.5 1.5L6 7l-3 1 2 2-1 3 3-1 2 2 2-2 3 1-1-3 2-2-3-1-1.5-2.5C13 4 12 3 10 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 9v5M8 16l2 2 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
{ id: "potion", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 3h4M7 7l-3 7a3 3 0 006 0V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M13 7l3 7a3 3 0 01-3 3H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M7 7h6" stroke="currentColor" strokeWidth="1.5"/></svg> },
];

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

// --- CORE COMPONENTS ---

const MapTab = ({ accent, activeProject, session, onUpdateProject }) => {
  const [uploading, setUploading] = useState(false);
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    const path = `${session.user.id}/${activeProject.id}/map_${Date.now()}`;
    const { error } = await supabase.storage.from("campaign_files").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("campaign_files").getPublicUrl(path);
      await onUpdateProject(activeProject.id, { map_url: data.publicUrl });
    }
    setUploading(false);
  };

  return (
    <div onDragOver={e => e.preventDefault()} onDrop={handleDrop}
    onMouseDown={e => { setIsDragging(true); setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y }); }}
    onMouseMove={e => isDragging && setTransform({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })}
    onMouseUp={() => setIsDragging(false)}
    style={{ height: "100%", background: "#050505", overflow: "hidden", position: "relative", cursor: activeProject.map_url ? (isDragging ? "grabbing" : "grab") : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>
    {activeProject.map_url ? (
      <img src={activeProject.map_url} draggable={false} style={{ transform: `translate(${transform.x}px, ${transform.y}px)`, transition: isDragging ? "none" : "transform 0.1s" }} alt="Campaign Map" />
    ) : (
      <div style={{ textAlign: "center", opacity: 0.3, color: accent }}>
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>{ICONS.mapPlaceholder}</div>
      <p style={{ fontFamily: mono, fontSize: "11px", color: "#fff" }}>{uploading ? "UPLOADING..." : "DRAG AND DROP MAP IMAGE"}</p>
      </div>
    )}
    </div>
  );
};

const NotesTab = ({ accent, activeProject, session }) => {
  const rgb = hexToRgb(accent);
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [activeNote, setActiveNote] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [tempName, setTempName] = useState("");
  const [expanded, setExpanded] = useState(new Set());
  const saveTimeout = useRef(null);

  const fetchNotes = async () => {
    const { data } = await supabase.from("notes").select("*").eq("project_id", activeProject.id).order("is_folder", { ascending: false }).order("name", { ascending: true });
    if (data) setNotes(data);
  };

    useEffect(() => { fetchNotes(); }, [activeProject.id]);
    useEffect(() => {
      const found = notes.find(n => n.id === activeNoteId);
      if (found) setActiveNote(found);
    }, [activeNoteId, notes]);

      const toggleFolder = (id) => {
        const next = new Set(expanded);
        if (next.has(id)) next.delete(id); else next.add(id);
        setExpanded(next);
      };

      const createItem = async (name = "Untitled", isFolder = false, parentId = null) => {
        const { data } = await supabase.from("notes").insert({ project_id: activeProject.id, user_id: session.user.id, name, is_folder: isFolder, parent_id: parentId, content: isFolder ? "" : `# ${name}\n\n` }).select().single();
        if (data) {
          setNotes([...notes, data]);
          if (!isFolder) setActiveNoteId(data.id);
          if (parentId) { const next = new Set(expanded); next.add(parentId); setExpanded(next); }
        }
      };

      const handleUpdateContent = (content) => {
        setActiveNote(prev => ({ ...prev, content }));
        const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim() || "Untitled";
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(async () => {
          await supabase.from("notes").update({ content, name: firstLine, updated_at: new Date().toISOString() }).eq("id", activeNote.id);
          fetchNotes();
        }, 800);
      };

      const moveItem = async (itemId, targetFolderId) => {
        if (itemId === targetFolderId) return;
        await supabase.from("notes").update({ parent_id: targetFolderId }).eq("id", itemId);
        fetchNotes();
      };

      const NoteTree = ({ parentId = null, depth = 0 }) => {
        const items = notes.filter(n => n.parent_id === parentId);
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          {items.map(item => (
            <div key={item.id}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.background = `rgba(${rgb}, 0.1)`; }}
            onDragLeave={e => { e.currentTarget.style.background = "transparent"; }}
            onDrop={async (e) => {
              e.preventDefault();
              e.currentTarget.style.background = "transparent";
              const droppedId = e.dataTransfer.getData("text/plain");
              if (item.is_folder) moveItem(droppedId, item.id);
            }}
            >
            <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", item.id)}
            onClick={() => item.is_folder ? toggleFolder(item.id) : setActiveNoteId(item.id)}
            className="note-item"
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", paddingLeft: `${depth * 14 + 12}px`, cursor: "pointer", borderRadius: "4px", background: activeNoteId === item.id ? `rgba(${rgb},0.12)` : "transparent", color: activeNoteId === item.id ? accent : "rgba(255,255,255,0.6)", fontSize: "12px", fontFamily: mono }}>

            <span style={{ display: "flex", alignItems: "center", width: "14px", color: "rgba(255,255,255,0.2)" }}>
            {item.is_folder && (expanded.has(item.id) ? ICONS.chevronDown : ICONS.chevronRight)}
            </span>

            <span style={{ color: activeNoteId === item.id ? accent : "inherit" }}>
            {item.is_folder ? (expanded.has(item.id) ? ICONS.folderOpen : ICONS.folder) : ICONS.note}
            </span>

            {renamingId === item.id ? (
              <input autoFocus value={tempName} onChange={e => setTempName(e.target.value)} onBlur={() => { supabase.from("notes").update({ name: tempName }).eq("id", item.id).then(fetchNotes); setRenamingId(null); }}
              style={{ background: "#222", border: `1px solid ${accent}`, color: "#fff", fontSize: "11px", padding: "2px 4px", borderRadius: "4px", width: "100%" }} />
            ) : (
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
            )}

            <button onClick={(e) => { e.stopPropagation(); setRenamingId(item.id); setTempName(item.name); }} className="rename-btn" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: "10px" }}>✎</button>
            </div>
            {item.is_folder && expanded.has(item.id) && <NoteTree parentId={item.id} depth={depth + 1} />}
            </div>
          ))}
          </div>
        );
      };

      return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
        <div style={{ width: "260px", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "16px", display: "flex", gap: "8px" }}>
        <button onClick={() => createItem("New Note")} style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", color: "#888", fontSize: "9px", padding: "8px", cursor: "pointer", fontFamily: mono }}>+ NOTE</button>
        <button onClick={() => createItem("New Folder", true)} style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "4px", color: "#888", fontSize: "9px", padding: "8px", cursor: "pointer", fontFamily: mono }}>+ FOLDER</button>
        </div>
        <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); moveItem(e.dataTransfer.getData("text/plain"), null); }}
        style={{ flex: 1, overflowY: "auto", paddingBottom: "40px" }}
        >
        <NoteTree />
        </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0c0c0c" }}>
        {activeNote ? (
          <>
          <div style={{ padding: "8px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => setIsPreview(!isPreview)} style={{ background: isPreview ? `rgba(${rgb},0.1)` : "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: isPreview ? accent : "rgba(255,255,255,0.4)", fontSize: "10px", padding: "4px 12px", cursor: "pointer", fontFamily: mono }}>{isPreview ? "LOCKED" : "EDITING"}</button>
          </div>
          <div style={{ flex: 1, padding: "60px", overflowY: "auto" }}>
          {isPreview ? (
            <div style={{ maxWidth: "800px", margin: "0 auto", color: "#ddd", fontFamily: mono, lineHeight: "1.8", whiteSpace: "pre-wrap" }}>{activeNote.content}</div>
          ) : (
            <textarea value={activeNote.content} onChange={e => handleUpdateContent(e.target.value)}
            style={{ width: "100%", height: "100%", background: "none", border: "none", outline: "none", color: "#ddd", fontFamily: mono, fontSize: "15px", lineHeight: "1.8", resize: "none", maxWidth: "800px", margin: "0 auto", display: "block" }} />
          )}
          </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.1, fontFamily: mono, letterSpacing: "0.2em" }}>VOID_SELECTION</div>
        )}
        </div>
        <style>{`.note-item .rename-btn { opacity: 0; } .note-item:hover .rename-btn { opacity: 1; }`}</style>
        </div>
      );
};

// --- MAIN APP ---

export default function Saturn() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("notes");
  const [accent, setAccent] = useState(defaultColor);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        supabase.from("projects").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).then(({ data }) => data && setProjects(data));
      }
    });
  }, []);

  if (!session) return <div style={{ background: "#0e0e0e", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><button onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })} style={{ padding: "12px 24px", background: "#fff", borderRadius: "6px", border: "none", cursor: "pointer", fontFamily: mono }}>Connect with Google</button></div>;
  const rgb = hexToRgb(accent);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0e0e0e", display: "flex", flexDirection: "column", color: "#fff" }}>
    {/* Dynamic Header */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
    <span style={{ fontFamily: mono, fontSize: "20px", fontWeight: "700", color: accent, textShadow: `0 0 20px rgba(${rgb},0.4)`, letterSpacing: "0.1em" }}>◉ SATURN</span>
    {activeProject && <span style={{ fontFamily: mono, fontSize: "9px", color: "rgba(255,255,255,0.2)", textTransform: "uppercase" }}>// {activeProject.name}</span>}
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
    {/* Status Dot */}
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: accent, boxShadow: `0 0 8px ${accent}`, animation: "pulse 2s infinite" }} />
    <span style={{ fontFamily: mono, fontSize: "9px", color: `rgba(${rgb},0.5)`, letterSpacing: "0.1em" }}>SYS_SYNC</span>
    </div>
    {/* Profile Picture */}
    <img src={session.user.user_metadata.avatar_url} style={{ width: "32px", height: "32px", borderRadius: "50%", border: `1px solid rgba(${rgb}, 0.3)`, padding: "2px" }} alt="Avatar" />
    </div>
    </div>

    {activeProject ? (
      <>
      <div style={{ display: "flex", padding: "0 24px", background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      {tabs.map(tab => (
        <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "14px 18px", background: "none", border: "none", borderBottom: activeTab === tab ? `2px solid ${accent}` : "2px solid transparent", color: activeTab === tab ? accent : "rgba(255,255,255,0.2)", cursor: "pointer", fontFamily: mono, fontSize: "10px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "8px" }}>
        <TabIcon tab={tab} /> {tab}
        </button>
      ))}
      <button onClick={() => setActiveProject(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.15)", cursor: "pointer", fontFamily: mono, fontSize: "9px" }}>[ DISCONNECT ]</button>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
      {activeTab === "notes" && <NotesTab accent={accent} activeProject={activeProject} session={session} />}
      {activeTab === "map" && <MapTab accent={accent} activeProject={activeProject} session={session} onUpdateProject={(id, up) => supabase.from("projects").update(up).eq("id", id).then(() => window.location.reload())} />}
      {activeTab === "settings" && <div style={{ padding: "40px" }}><button onClick={() => setAccent("#fb4f2b")} style={{ background: "#fb4f2b", width: 20, height: 20, borderRadius: "50%" }} /></div>}
      </div>
      </>
    ) : (
      <div style={{ padding: "60px", maxWidth: "900px", margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px" }}>
      <h2 style={{ fontFamily: mono, fontSize: "11px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.3em", textTransform: "uppercase" }}>Campaign Archives</h2>
      <button style={{ background: "none", border: `1px solid ${accent}`, color: accent, padding: "8px 20px", fontFamily: mono, fontSize: "10px", borderRadius: "4px" }}>+ INITIATE NEW</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
      {projects.map(p => (
        <div key={p.id} onClick={() => setActiveProject(p)} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "24px", cursor: "pointer", display: "flex", alignItems: "center", gap: "20px", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = accent}>
        <div style={{ color: accent, background: `rgba(${rgb}, 0.1)`, padding: "12px", borderRadius: "8px" }}>{PROJECT_ICONS.find(i => i.id === p.icon)?.svg || PROJECT_ICONS[0].svg}</div>
        <span style={{ fontFamily: mono, fontSize: "18px", letterSpacing: "0.05em" }}>{p.name}</span>
        </div>
      ))}
      </div>
      </div>
    )}

    <style>{`
      @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
      </div>
  );
}
