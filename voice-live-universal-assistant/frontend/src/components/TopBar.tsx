import React, { useState, useRef, useEffect } from 'react';

interface TopBarProps {
  agentName: string;
  onNewThread: () => void;
  onOpenSettings: () => void;
  showControls: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  agentName,
  onNewThread,
  onOpenSettings,
  showControls,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  return (
    <div style={barStyle}>
      {/* Left: agent name */}
      <span style={agentNameStyle}>{agentName || 'Voice Assistant'}</span>

      {/* Right: controls */}
      {showControls && (
        <div style={rightStyle}>
          {/* New chat */}
          <button style={textBtnStyle} onClick={onNewThread} aria-label="New chat" title="New chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <span>New chat</span>
          </button>

          {/* ··· Menu */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              style={dotsBtnStyle}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="More options"
              aria-expanded={menuOpen}
              title="More options"
            >
              ···
            </button>
            {menuOpen && (
              <div style={menuStyle}>
                <button
                  style={menuItemStyle}
                  onClick={() => { setMenuOpen(false); onOpenSettings(); }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Settings
                </button>
                <a style={menuLinkStyle} href="https://aka.ms/aistudio/terms" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" />
                    <line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
                  </svg>
                  Terms of use
                  <span style={externalIconStyle}>↗</span>
                </a>
                <a style={menuLinkStyle} href="https://go.microsoft.com/fwlink/?linkid=521839" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Privacy
                  <span style={externalIconStyle}>↗</span>
                </a>
                <button style={menuItemStyle} onClick={() => setMenuOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Send feedback
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Styles ---

const barStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 20px',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg-1)',
  zIndex: 10,
};

const agentNameStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--fg-1)',
};

const rightStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
};

const textBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  border: 'none',
  background: 'transparent',
  color: 'var(--fg-3)',
  fontSize: '14px',
  fontWeight: 400,
  cursor: 'pointer',
  borderRadius: '6px',
};

const dotsBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  padding: '8px',
  border: '1px solid var(--border-subtle)',
  borderRadius: '50%',
  background: 'transparent',
  color: 'var(--fg-1)',
  fontSize: '1rem',
  fontWeight: 700,
  cursor: 'pointer',
  letterSpacing: '1px',
};

const menuStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: '4px',
  minWidth: '200px',
  padding: '6px 0',
  borderRadius: '8px',
  border: '1px solid var(--border-subtle)',
  background: 'var(--bg-2)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
  zIndex: 100,
};

const menuItemBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '8px 16px',
  border: 'none',
  background: 'transparent',
  color: 'var(--fg-1)',
  fontSize: '14px',
  cursor: 'pointer',
  textDecoration: 'none',
  textAlign: 'left',
};

const menuItemStyle: React.CSSProperties = { ...menuItemBase };

const menuLinkStyle: React.CSSProperties = {
  ...menuItemBase,
  textDecoration: 'none',
  color: 'var(--fg-1)',
};

const externalIconStyle: React.CSSProperties = {
  marginLeft: 'auto',
  fontSize: '0.8rem',
  color: 'var(--fg-3)',
};
