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

// --- COMPONENTS ---

const LoginScreen = ({ accent }) => {
  const rgb = hexToRgb(accent);
  const handleGoogleLogin = () => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.href } });
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0e0e0e", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "40px" }}>
    <div style={{ textAlign: "center" }}>
    <h1 style={{ fontFamily: mono, fontSize: "42px", fontWeight: "700", color: accent, textShadow: `0 0 32px rgba(${rgb},0.5)`, letterSpacing: "0.1em" }}>◉ SATURN</h1>
    <p style={{ fontFamily: mono, fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "0.3em", textTransform: "uppercase" }}>dm toolkit</p>
    </div>
    <button onClick={handleGoogleLogin} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", padding: "14px 28px", fontFamily: mono, fontSize: "12px", cursor: "pointer", transition: "all 0.2s" }}>Sign in with Google</button>
    </div>
  );
};

const ProjectList = ({ accent, projects, onOpen, onCreate, onRename, onDelete }) => {
  const rgb = hexToRgb(accent);
  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", width: "100%" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
    <h2 style={{ fontFamily: mono, fontSize: "12px", color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Your Campaigns</h2>
    <button onClick={onCreate} style={{ background: `rgba(${rgb},0.1)`, border: `1px solid ${accent}`, borderRadius: "6px", color: accent, padding: "8px 16px", fontFamily: mono, fontSize: "11px", cursor: "pointer" }}>+ NEW CAMPAIGN</button>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
    {projects.map(p => (
      <div key={p.id} onClick={() => onOpen(p)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "20px", transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = `rgba(${rgb},0.4)`} onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}>
      <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: `rgba(${rgb},0.1)`, display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
      {PROJECT_ICONS.find(i => i.id === p.icon)?.svg}
      </div>
      <span style={{ flex: 1, fontFamily: mono, fontSize: "16px", color: "#ddd" }}>{p.name}</span>
      <button onClick={(e) => { e.stopPropagation(); onDelete(p.id); }} style={{ background: "none", border: "none", color: "rgba(255,80,80,0.4)", cursor: "pointer", fontSize: "10px" }}>DELETE</button>
      </div>
    ))}
    </div>
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

      const createItem = async (name = "Untitled", isFolder = false, parentId = null) => {
        const { data } = await supabase.from("notes").insert({ project_id: activeProject.id, user_id: session.user.id, name, is_folder: isFolder, parent_id: parentId, content: isFolder ? "" : `# ${name}\n\n` }).select().single();
        if (data) { setNotes([...notes, data]); if (!isFolder) setActiveNoteId(data.id); }
      };

      const updateItemName = async (id, newName) => {
        await supabase.from("notes").update({ name: newName }).eq("id", id);
        setRenamingId(null);
        fetchNotes();
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

      // --- REWORKED LINK SYSTEM ---
      const handleLinkClick = async (targetName) => {
        const target = notes.find(n => !n.is_folder && n.name.toLowerCase() === targetName.toLowerCase());
        if (target) {
          setActiveNoteId(target.id);
        } else {
          // Create it
          const { data } = await supabase.from("notes").insert({ project_id: activeProject.id, user_id: session.user.id, name: targetName, content: `# ${targetName}\n\n` }).select().single();
          if (data) {
            setNotes(prev => [...prev, data]);
            setActiveNoteId(data.id);
          }
        }
      };

      const renderLinkedContent = (content) => {
        if (!content) return null;
        const parts = content.split(/(\[\[.*?\]\])/g);
        return parts.map((part, i) => {
          if (part.startsWith('[[') && part.endsWith(']]')) {
            const name = part.slice(2, -2);
            return <span key={i} onClick={() => handleLinkClick(name)} style={{ color: accent, textDecoration: "underline", cursor: "pointer", fontWeight: "bold" }}>{name}</span>;
          }
          return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{part}</span>;
        });
      };

      const NoteTree = ({ parentId = null, depth = 0 }) => {
        const items = notes.filter(n => n.parent_id === parentId);
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {items.map(item => (
            <div key={item.id}>
            <div onClick={() => !item.is_folder && setActiveNoteId(item.id)} className="note-item"
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", paddingLeft: `${depth * 16 + 12}px`, cursor: "pointer", borderRadius: "6px", background: activeNoteId === item.id ? `rgba(${rgb},0.12)` : "transparent", color: activeNoteId === item.id ? accent : "rgba(255,255,255,0.6)", fontSize: "12px", fontFamily: mono, transition: "all 0.1s" }}>
            {item.is_folder ? "📁" : "📄"}
            {renamingId === item.id ? (
              <input autoFocus value={tempName} onChange={e => setTempName(e.target.value)} onBlur={() => updateItemName(item.id, tempName)} onKeyDown={e => e.key === "Enter" && updateItemName(item.id, tempName)}
              style={{ background: "#222", border: `1px solid ${accent}`, color: "#fff", fontSize: "11px", padding: "2px 4px", borderRadius: "4px", width: "100%" }} />
            ) : (
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
            )}
            <button onClick={(e) => { e.stopPropagation(); setRenamingId(item.id); setTempName(item.name); }} className="rename-btn" style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: "10px" }}>✎</button>
            </div>
            {item.is_folder && <NoteTree parentId={item.id} depth={depth + 1} />}
            </div>
          ))}
          </div>
        );
      };

      return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: "240px", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.2)" }}>
        <div style={{ padding: "16px", display: "flex", gap: "8px" }}>
        <button onClick={() => createItem("New Note")} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#ddd", fontSize: "10px", padding: "6px", cursor: "pointer" }}>+ NOTE</button>
        <button onClick={() => createItem("New Folder", true)} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "#ddd", fontSize: "10px", padding: "6px", cursor: "pointer" }}>+ FOLDER</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}><NoteTree /></div>
        </div>
        {/* Editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeNote ? (
          <>
          <div style={{ padding: "8px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => setIsPreview(!isPreview)} style={{ background: isPreview ? `rgba(${rgb},0.1)` : "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: isPreview ? accent : "rgba(255,255,255,0.4)", fontSize: "10px", padding: "4px 12px", cursor: "pointer" }}>{isPreview ? "EDITING" : "PREVIEW"}</button>
          </div>
          <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
          {isPreview ? (
            <div style={{ maxWidth: "800px", margin: "0 auto", color: "#ddd", fontFamily: mono, lineHeight: "1.6" }}>{renderLinkedContent(activeNote.content)}</div>
          ) : (
            <textarea value={activeNote.content} onChange={e => handleUpdateContent(e.target.value)}
            style={{ width: "100%", height: "100%", background: "none", border: "none", outline: "none", color: "#ddd", fontFamily: mono, fontSize: "15px", lineHeight: "1.6", resize: "none", maxWidth: "800px", margin: "0 auto", display: "block" }} />
          )}
          </div>
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.2, fontFamily: mono }}>select or create a note</div>
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
        if (data) { setProjects([data, ...projects]); setActiveProject(data); }
        setShowCreateModal(false);
      };

      if (!session) return <LoginScreen accent={accent} />;
      const rgb = hexToRgb(accent);

      return (
        <div style={{ position: "fixed", inset: 0, background: "#0e0e0e", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
        <span style={{ fontFamily: mono, fontSize: "22px", fontWeight: "700", color: accent, textShadow: `0 0 20px rgba(${rgb},0.4)` }}>◉ SATURN</span>
        {activeProject && <span style={{ fontFamily: mono, fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>/ {activeProject.name}</span>}
        </div>
        {activeProject && <button onClick={() => setActiveProject(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: "10px", fontFamily: mono }}>EXIT</button>}
        </div>

        {activeProject ? (
          <>
          <div style={{ display: "flex", padding: "0 24px", background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "14px 18px", background: "none", border: "none", borderBottom: activeTab === tab ? `2px solid ${accent}` : "2px solid transparent", color: activeTab === tab ? accent : "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: mono, fontSize: "11px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "8px" }}>
            <TabIcon tab={tab} /> {tab}
            </button>
          ))}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
          {activeTab === "notes" && <NotesTab accent={accent} activeProject={activeProject} session={session} />}
          {activeTab !== "notes" && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.2, fontFamily: mono }}>{activeTab} module active</div>}
          </div>
          </>
        ) : (
          <ProjectList accent={accent} projects={projects} onOpen={setActiveProject} onCreate={() => setShowCreateModal(true)} onDelete={id => setProjects(projects.filter(p => p.id !== id))} />
        )}
        </div>
      );
}
