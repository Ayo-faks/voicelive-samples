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
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M6.40139 7.2403C7.22201 6.82997 8.20386 6.99674 8.85356 7.64645C9.04882 7.84171 9.04881 8.15829 8.85355 8.35355C8.65829 8.54881 8.3417 8.54881 8.14644 8.35355C7.79614 8.00324 7.27799 7.92002 6.84861 8.13472C6.43659 8.34073 6 8.88519 6 10C6 11.1148 6.43659 11.6593 6.84861 11.8653C7.27799 12.08 7.79614 11.9967 8.14645 11.6464C8.34171 11.4512 8.65829 11.4512 8.85355 11.6464C9.04882 11.8417 9.04882 12.1583 8.85355 12.3535C8.20386 13.0032 7.22201 13.17 6.40139 12.7597C5.56341 12.3407 5 11.3852 5 10C5 8.61486 5.56341 7.6593 6.40139 7.2403ZM14.3536 7.64648C13.7039 6.99677 12.722 6.83 11.9014 7.24033C11.0634 7.65933 10.5 8.61489 10.5 10C10.5 11.3852 11.0634 12.3407 11.9014 12.7597C12.722 13.17 13.7039 13.0033 14.3536 12.3536C14.5488 12.1583 14.5488 11.8417 14.3536 11.6465C14.1583 11.4512 13.8417 11.4512 13.6464 11.6465C13.2961 11.9968 12.778 12.08 12.3486 11.8653C11.9366 11.6593 11.5 11.1148 11.5 10C11.5 8.88522 11.9366 8.34076 12.3486 8.13475C12.778 7.92005 13.2961 8.00327 13.6464 8.35358C13.8417 8.54884 14.1583 8.54884 14.3535 8.35358C14.5488 8.15832 14.5488 7.84174 14.3536 7.64648ZM2 7C2 5.34315 3.34315 4 5 4H15C16.6569 4 18 5.34315 18 7V13C18 14.6569 16.6569 16 15 16H5C3.34315 16 2 14.6569 2 13V7ZM5 5C3.89543 5 3 5.89543 3 7V13C3 14.1046 3.89543 15 5 15H15C16.1046 15 17 14.1046 17 13V7C17 5.89543 16.1046 5 15 5H5Z" />
        </svg>
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
