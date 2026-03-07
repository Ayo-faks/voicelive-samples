import React from 'react';
import type { InputMode } from '../hooks/useUrlParams';

interface TopBarProps {
  agentName: string;
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  onNewThread: () => void;
  onOpenSettings: () => void;
  showModeToggle: boolean;
  showSettings: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  agentName,
  inputMode,
  onInputModeChange,
  onNewThread,
  onOpenSettings,
  showModeToggle,
  showSettings,
}) => {
  return (
    <div style={barStyle}>
      {/* Left: agent identity */}
      <div style={leftStyle}>
        <div style={agentIconStyle}>🤖</div>
        <span style={agentNameStyle}>{agentName || 'Voice Assistant'}</span>
      </div>

      {/* Right: controls */}
      <div style={rightStyle}>
        {/* Voice / Text toggle */}
        {showModeToggle && (
          <div style={toggleContainerStyle}>
            <button
              style={{
                ...toggleBtnStyle,
                ...(inputMode === 'voice' ? toggleActiveStyle : {}),
              }}
              onClick={() => onInputModeChange('voice')}
              aria-label="Voice mode"
              title="Voice mode"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              <span>Voice</span>
            </button>
            <button
              style={{
                ...toggleBtnStyle,
                ...(inputMode === 'text' ? toggleActiveStyle : {}),
              }}
              onClick={() => onInputModeChange('text')}
              aria-label="Text mode"
              title="Text mode"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Text</span>
            </button>
          </div>
        )}

        {/* New Thread */}
        <button
          style={iconBtnStyle}
          onClick={onNewThread}
          aria-label="New thread"
          title="New thread"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        {/* Settings gear */}
        {showSettings && (
          <button
            style={iconBtnStyle}
            onClick={onOpenSettings}
            aria-label="Settings"
            title="Settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// --- Styles ---

const barStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 20px',
  borderBottom: '1px solid var(--border-subtle)',
  background: 'var(--bg-2)',
  position: 'relative',
  zIndex: 10,
};

const leftStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const agentIconStyle: React.CSSProperties = {
  fontSize: '1.4rem',
};

const agentNameStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  color: 'var(--fg-1)',
};

const rightStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const toggleContainerStyle: React.CSSProperties = {
  display: 'flex',
  border: '1px solid var(--border-subtle)',
  borderRadius: '8px',
  overflow: 'hidden',
};

const toggleBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 14px',
  border: 'none',
  background: 'transparent',
  color: 'var(--fg-2)',
  fontSize: '0.85rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
};

const toggleActiveStyle: React.CSSProperties = {
  background: 'var(--brand-blue)',
  color: '#fff',
};

const iconBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  background: 'none',
  border: '1px solid var(--border-subtle)',
  borderRadius: '8px',
  color: 'var(--fg-2)',
  cursor: 'pointer',
  transition: 'background 0.15s, color 0.15s',
};
