import React from 'react';

interface SessionControlsProps {
  isCCEnabled: boolean;
  isMuted: boolean;
  onToggleCC: () => void;
  onToggleMute: () => void;
  onEndSession: () => void;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  isCCEnabled, isMuted, onToggleCC, onToggleMute, onEndSession,
}) => {
  return (
    <div style={barStyle}>
      {/* CC Toggle */}
      <button
        style={{ ...iconBtnStyle, ...(isCCEnabled ? ccActiveStyle : {}) }}
        onClick={onToggleCC}
        aria-label="Toggle closed captions"
        title="Closed captions"
      >
        <span style={{ fontSize: '14px', fontWeight: 600 }}>CC</span>
      </button>

      {/* Mic Toggle */}
      <button
        style={{ ...micBtnStyle, ...(isMuted ? micMutedStyle : {}) }}
        onClick={onToggleMute}
        aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3ZM8 5a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0V5Zm-2 5a.5.5 0 0 0-1 0 5 5 0 0 0 4.5 4.975V16.5a.5.5 0 0 0 1 0v-1.525A5 5 0 0 0 15 10a.5.5 0 0 0-1 0 4 4 0 0 1-8 0Z" />
        </svg>
        {isMuted && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ position: 'absolute' }}>
            <line x1="3" y1="3" x2="17" y2="17" stroke="var(--error)" strokeWidth="2" />
          </svg>
        )}
      </button>

      {/* End Session - text button */}
      <button style={endBtnStyle} onClick={onEndSession} aria-label="End session">
        End session
      </button>
    </div>
  );
};

const barStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '8px',
  padding: '16px',
};

const iconBtnStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  padding: '8px',
  border: 'none',
  borderRadius: '9999px',
  background: 'transparent',
  color: 'var(--fg-2)',
  cursor: 'pointer',
  transition: 'background 0.12s, color 0.12s',
};

const ccActiveStyle: React.CSSProperties = {
  background: 'var(--brand-blue-bg)',
  color: 'var(--brand-blue)',
};

const micBtnStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  padding: '8px',
  border: '1px solid var(--voice-primary)',
  borderRadius: '9999px',
  background: 'transparent',
  color: 'var(--voice-primary)',
  cursor: 'pointer',
  transition: 'all 0.12s ease',
};

const micMutedStyle: React.CSSProperties = {
  border: '1px solid var(--voice-primary)',
  color: 'var(--fg-1)',
  background: 'var(--bg-3)',
};

const endBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 16px',
  border: '1px solid var(--border)',
  borderRadius: '9999px',
  background: 'var(--bg-2)',
  color: 'var(--voice-primary)',
  fontSize: '14px',
  fontWeight: 600,
  lineHeight: '20px',
  cursor: 'pointer',
  transition: 'background 0.12s, transform 0.12s',
};
