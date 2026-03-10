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
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M6.5 9.5C6.22386 9.5 6 9.72386 6 10C6 10.2761 6.22386 10.5 6.5 10.5H9.5V13.5C9.5 13.7761 9.72386 14 10 14C10.2761 14 10.5 13.7761 10.5 13.5V10.5H13.5C13.7761 10.5 14 10.2761 14 10C14 9.72386 13.7761 9.5 13.5 9.5H10.5V6.5C10.5 6.22386 10.2761 6 10 6C9.72386 6 9.5 6.22386 9.5 6.5V9.5H6.5ZM18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10L2.00738 10.3463L2.03275 10.7283C2.12433 11.7422 2.4066 12.7186 2.86169 13.6153L2.925 13.735L2.01493 17.3787L2.00114 17.4624L2.00131 17.5438C2.02622 17.8369 2.31127 18.0625 2.62109 17.9851L6.266 17.075L6.38669 17.1393C7.49591 17.7018 8.72679 18 10 18C14.4183 18 18 14.4183 18 10ZM3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17C8.7837 17 7.61362 16.6898 6.57701 16.1075L6.4903 16.0691L6.39873 16.0479C6.33662 16.0396 6.27294 16.0429 6.21104 16.0583L3.187 16.812L3.94274 13.7912L3.95692 13.6973C3.9621 13.603 3.94046 13.5084 3.89283 13.4263L3.83917 13.3458C3.31039 12.3162 3 11.192 3 10Z" /></svg>
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
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M6.25 10C6.25 10.6904 5.69036 11.25 5 11.25C4.30964 11.25 3.75 10.6904 3.75 10C3.75 9.30964 4.30964 8.75 5 8.75C5.69036 8.75 6.25 9.30964 6.25 10ZM11.25 10C11.25 10.6904 10.6904 11.25 10 11.25C9.30964 11.25 8.75 10.6904 8.75 10C8.75 9.30964 9.30964 8.75 10 8.75C10.6904 8.75 11.25 9.30964 11.25 10ZM15 11.25C15.6904 11.25 16.25 10.6904 16.25 10C16.25 9.30964 15.6904 8.75 15 8.75C14.3096 8.75 13.75 9.30964 13.75 10C13.75 10.6904 14.3096 11.25 15 11.25Z" /></svg>
            </button>
            {menuOpen && (
              <div style={menuStyle}>
                <button
                  style={menuItemStyle}
                  onClick={() => { setMenuOpen(false); onOpenSettings(); }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M7.83471 2.08573C7.87104 1.88627 8.02422 1.7285 8.22251 1.6863C8.8027 1.5628 9.39758 1.5 10.0003 1.5C10.6026 1.5 11.1971 1.56273 11.7769 1.68607C11.9752 1.72824 12.1284 1.88591 12.1648 2.08529L12.5313 4.09165C12.6303 4.63497 13.1511 4.9951 13.6944 4.89601C13.7479 4.88627 13.8004 4.87219 13.8515 4.85395L15.7698 4.16802C15.9605 4.09984 16.1734 4.15339 16.3092 4.30364C17.1119 5.19213 17.7202 6.24053 18.0895 7.38266C18.1518 7.57534 18.0918 7.78658 17.9374 7.91764L16.3825 9.23773C15.9615 9.5952 15.9101 10.2263 16.2675 10.6473C16.3027 10.6887 16.3411 10.7271 16.3825 10.7623L17.9374 12.0824C18.0918 12.2134 18.1518 12.4247 18.0895 12.6173C17.7202 13.7595 17.1119 14.8079 16.3092 15.6964C16.1734 15.8466 15.9605 15.9002 15.7698 15.832L13.8515 15.1461C13.3315 14.96 12.759 15.231 12.5734 15.7509C12.5551 15.8021 12.541 15.8547 12.5313 15.9083L12.1648 17.9147C12.1284 18.1141 11.9752 18.2718 11.7769 18.3139C11.1971 18.4373 10.6026 18.5 10.0003 18.5C9.39758 18.5 8.8027 18.4372 8.22251 18.3137C8.02422 18.2715 7.87104 18.1137 7.83471 17.9143L7.46925 15.9083C7.37016 15.365 6.84945 15.0049 6.30612 15.104C6.25266 15.1137 6.20012 15.1278 6.14897 15.1461L4.23069 15.832C4.04002 15.9002 3.82707 15.8466 3.69133 15.6964C2.88863 14.8079 2.28028 13.7595 1.91099 12.6173C1.84873 12.4247 1.90878 12.2134 2.06309 12.0824L3.61803 10.7623C4.03905 10.4048 4.09042 9.77369 3.73293 9.35268C3.69775 9.31124 3.65943 9.27289 3.61803 9.23773L2.06309 7.91764C1.90878 7.78658 1.84873 7.57534 1.91099 7.38266C2.28028 6.24053 2.88863 5.19213 3.69133 4.30364C3.82707 4.15339 4.04002 4.09984 4.23069 4.16802L6.14897 4.85392C6.66905 5.03977 7.24131 4.76883 7.42716 4.24875C7.44544 4.19762 7.45952 4.14507 7.46925 4.09173L7.83471 2.08573ZM10.0003 13C11.6571 13 13.0003 11.6569 13.0003 10C13.0003 8.34315 11.6571 7 10.0003 7C8.34342 7 7.00027 8.34315 7.00027 10C7.00027 11.6569 8.34342 13 10.0003 13Z" /></svg>
                  Settings
                </button>
                <a style={menuLinkStyle} href="https://aka.ms/aistudio/terms" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M2 4.5C2 4.22386 2.22386 4 2.5 4H13.5C13.7761 4 14 4.22386 14 4.5C14 4.77614 13.7761 5 13.5 5H2.5C2.22386 5 2 4.77614 2 4.5ZM2 9.5C2 9.22386 2.22386 9 2.5 9H17.5C17.7761 9 18 9.22386 18 9.5C18 9.77614 17.7761 10 17.5 10H2.5C2.22386 10 2 9.77614 2 9.5ZM2.5 14C2.22386 14 2 14.2239 2 14.5C2 14.7761 2.22386 15 2.5 15H11.5C11.7761 15 12 14.7761 12 14.5C12 14.2239 11.7761 14 11.5 14H2.5Z" /></svg>
                  Terms of use
                  <span style={externalIconStyle}>↗</span>
                </a>
                <a style={menuLinkStyle} href="https://go.microsoft.com/fwlink/?linkid=521839" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M9.72265 2.08397C9.8906 1.97201 10.1094 1.97201 10.2774 2.08397C12.2155 3.3761 14.3117 4.1823 16.5707 4.50503C16.817 4.54021 17 4.75117 17 5V9.5C17 13.3913 14.693 16.2307 10.1795 17.9667C10.064 18.0111 9.93605 18.0111 9.82051 17.9667C5.30699 16.2307 3 13.3913 3 9.5V5C3 4.75117 3.18296 4.54021 3.42929 4.50503C5.68833 4.1823 7.78446 3.3761 9.72265 2.08397ZM9.59914 3.34583C7.85275 4.39606 5.98541 5.09055 4 5.42787V9.5C4 12.892 5.96795 15.3634 10 16.9632C14.0321 15.3634 16 12.892 16 9.5V5.42787C14.0146 5.09055 12.1473 4.39606 10.4009 3.34583L10 3.09715L9.59914 3.34583Z" /></svg>
                  Privacy
                  <span style={externalIconStyle}>↗</span>
                </a>
                <button style={menuItemStyle} onClick={() => setMenuOpen(false)}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M6.5 9.5C6.22386 9.5 6 9.72386 6 10C6 10.2761 6.22386 10.5 6.5 10.5H9.5V13.5C9.5 13.7761 9.72386 14 10 14C10.2761 14 10.5 13.7761 10.5 13.5V10.5H13.5C13.7761 10.5 14 10.2761 14 10C14 9.72386 13.7761 9.5 13.5 9.5H10.5V6.5C10.5 6.22386 10.2761 6 10 6C9.72386 6 9.5 6.22386 9.5 6.5V9.5H6.5ZM18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10L2.00738 10.3463L2.03275 10.7283C2.12433 11.7422 2.4066 12.7186 2.86169 13.6153L2.925 13.735L2.01493 17.3787L2.00114 17.4624L2.00131 17.5438C2.02622 17.8369 2.31127 18.0625 2.62109 17.9851L6.266 17.075L6.38669 17.1393C7.49591 17.7018 8.72679 18 10 18C14.4183 18 18 14.4183 18 10ZM3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17C8.7837 17 7.61362 16.6898 6.57701 16.1075L6.4903 16.0691L6.39873 16.0479C6.33662 16.0396 6.27294 16.0429 6.21104 16.0583L3.187 16.812L3.94274 13.7912L3.95692 13.6973C3.9621 13.603 3.94046 13.5084 3.89283 13.4263L3.83917 13.3458C3.31039 12.3162 3 11.192 3 10Z" /></svg>
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
  padding: '12px 16px',
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
  gap: '8px',
};

const textBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 12px',
  border: 'none',
  background: 'transparent',
  color: 'var(--fg-2)',
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
  fontSize: '14px',
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
  fontSize: '12px',
  color: 'var(--fg-2)',
};
