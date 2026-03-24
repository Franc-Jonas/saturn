import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const defaultColor = "#fb4f2b";
const tabs = ["music", "map", "notes", "settings"];

const hexToRgb = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
};

const TabIcon = ({ tab }) => {
  const icons = {
    music: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6 12V4l7-1.5V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="4.5" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="11.5" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    map: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 3.5l4.5-1.5 5 1.5 4.5-1.5v10L10.5 13.5 5.5 12 1 13.5V3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M5.5 2v10M10.5 3.5V13.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    notes: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 6h6M5 8.5h6M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    settings: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M8 1.5v1.2M8 13.3v1.2M1.5 8h1.2M13.3 8h1.2M3.2 3.2l.85.85M11.95 11.95l.85.85M3.2 12.8l.85-.85M11.95 4.05l.85-.85" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
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

const LoginScreen = ({ accent }) => {
  const rgb = hexToRgb(accent);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.href,
      },
    });
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "#0e0e0e",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "40px",
    }}>
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <span style={{
          fontFamily: "'Courier New', monospace",
          fontSize: "36px",
          fontWeight: "700",
          letterSpacing: "0.12em",
          color: accent,
          textShadow: `0 0 32px rgba(${rgb}, 0.5)`,
        }}>
          ◉ SATURN
        </span>
        <span style={{
          fontFamily: "'Courier New', monospace",
          fontSize: "10px",
          letterSpacing: "0.25em",
          color: "rgba(255,255,255,0.25)",
          textTransform: "uppercase",
        }}>
          dm toolkit
        </span>
      </div>

      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        width: "100%",
        maxWidth: "320px",
        padding: "0 24px",
      }}>
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            width: "100%",
            padding: "14px 24px",
            background: "rgba(255,255,255,0.05)",
            border: `1px solid rgba(255,255,255,0.12)`,
            borderRadius: "8px",
            color: "rgba(255,255,255,0.85)",
            fontFamily: "'Courier New', monospace",
            fontSize: "12px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.5 : 1,
            transition: "background 0.2s, border-color 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.09)";
            e.currentTarget.style.borderColor = `rgba(${rgb}, 0.4)`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
          }}
        >
          <GoogleIcon />
          {loading ? "redirecting..." : "sign in with google"}
        </button>

        <p style={{
          fontFamily: "'Courier New', monospace",
          fontSize: "9px",
          letterSpacing: "0.15em",
          color: "rgba(255,255,255,0.15)",
          textTransform: "uppercase",
          margin: 0,
          textAlign: "center",
        }}>
          your settings sync across devices
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
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
    }}>
      <TabIcon tab={name} />
    </div>
    <p style={{ fontFamily: "'Courier New', monospace", fontSize: "12px", color: accent, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0 }}>
      {name} — coming soon
    </p>
  </div>
);

const SettingsTab = ({ accent, setAccentAndSave, user, onSignOut }) => {
  const presets = ["#fb4f2b", "#e63946", "#f4a261", "#2ec4b6", "#8338ec", "#06d6a0", "#118ab2"];
  const rgb = hexToRgb(accent);

  return (
    <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: "32px", overflowY: "auto", height: "100%" }}>
      <div>
        <p style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: accent, margin: "0 0 16px" }}>
          primary color
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccentAndSave(e.target.value)}
            style={{ width: "48px", height: "48px", border: "none", borderRadius: "8px", cursor: "pointer", padding: 0, background: "none" }}
          />
          <input
            type="text"
            value={accent}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setAccentAndSave(v);
            }}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid rgba(${rgb}, 0.3)`,
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
              onClick={() => setAccentAndSave(c)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: c,
                border: accent === c ? "3px solid #fff" : "3px solid transparent",
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
          border: `1px solid rgba(${rgb}, 0.25)`,
          background: `rgba(${rgb}, 0.06)`,
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

      <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <p style={{ fontFamily: "'Courier New', monospace", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", margin: "0 0 12px" }}>
          account
        </p>
        <p style={{ fontFamily: "'Courier New', monospace", fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 16px" }}>
          {user?.email}
        </p>
        <button
          onClick={onSignOut}
          style={{
            background: "none",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "6px",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "'Courier New', monospace",
            fontSize: "10px",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            padding: "8px 16px",
            cursor: "pointer",
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "rgba(255,80,80,0.4)";
            e.currentTarget.style.color = "rgba(255,80,80,0.7)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "rgba(255,255,255,0.3)";
          }}
        >
          sign out
        </button>
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
      if (session) loadSettings(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadSettings(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadSettings = async (userId) => {
    const { data } = await supabase
      .from("user_settings")
      .select("accent_color")
      .eq("id", userId)
      .single();
    if (data?.accent_color) setAccent(data.accent_color);
  };

  const setAccentAndSave = async (color) => {
    setAccent(color);
    if (!session) return;
    await supabase.from("user_settings").upsert({
      id: session.user.id,
      accent_color: color,
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setAccent(defaultColor);
  };

  const rgb = hexToRgb(accent);

  if (authLoading) {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "#0e0e0e",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontFamily: "'Courier New', monospace", fontSize: "10px",
          letterSpacing: "0.25em", color: `rgba(${rgb}, 0.4)`, textTransform: "uppercase",
          animation: "pulse 1.5s infinite",
        }}>
          loading...
        </span>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>
      </div>
    );
  }

  if (!session) return <LoginScreen accent={accent} />;

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
        borderBottom: "1px solid rgba(255,255,255,0.06)",
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: accent, boxShadow: `0 0 8px ${accent}`,
            animation: "pulse 2s infinite",
          }} />
          <div
            onClick={() => setProfileMenuOpen(o => !o)}
            style={{ cursor: "pointer", position: "relative" }}
          >
            {session.user?.user_metadata?.avatar_url ? (
              <img
                src={session.user.user_metadata.avatar_url}
                alt="profile"
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  border: `1px solid rgba(${rgb}, ${profileMenuOpen ? "0.8" : "0.4"})`,
                  objectFit: "cover",
                  display: "block",
                  transition: "border-color 0.2s",
                }}
              />
            ) : (
              <div style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: `rgba(${rgb}, 0.2)`,
                border: `1px solid rgba(${rgb}, ${profileMenuOpen ? "0.8" : "0.4"})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Courier New', monospace",
                fontSize: "11px",
                color: accent,
                transition: "border-color 0.2s",
              }}>
                {session.user?.email?.[0]?.toUpperCase()}
              </div>
            )}

            {profileMenuOpen && (
              <>
                <div
                  onClick={(e) => { e.stopPropagation(); setProfileMenuOpen(false); }}
                  style={{ position: "fixed", inset: 0, zIndex: 9 }}
                />
                <div style={{
                  position: "absolute",
                  top: "38px",
                  right: 0,
                  zIndex: 10,
                  background: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "8px",
                  minWidth: "180px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}>
                  <p style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: "9px",
                    letterSpacing: "0.15em",
                    color: "rgba(255,255,255,0.25)",
                    textTransform: "uppercase",
                    margin: "0 0 6px",
                    padding: "0 8px",
                  }}>
                    {session.user?.email}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setProfileMenuOpen(false); handleSignOut(); }}
                    style={{
                      background: "none",
                      border: "none",
                      borderRadius: "6px",
                      color: "rgba(255,100,100,0.7)",
                      fontFamily: "'Courier New', monospace",
                      fontSize: "10px",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      padding: "8px",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,80,80,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "2px",
        padding: "0 24px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
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
      <div style={{ flex: 1, overflow: "hidden" }}>
        {activeTab === "settings" ? (
          <SettingsTab
            accent={accent}
            setAccentAndSave={setAccentAndSave}
            user={session.user}
            onSignOut={handleSignOut}
          />
        ) : (
          <PlaceholderTab name={activeTab} accent={accent} />
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: "10px 24px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
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
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; }
        @media (max-width: 400px) { .tab-label { display: none; } }
      `}</style>
    </div>
  );
}
