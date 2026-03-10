import React from 'react';
import type { TranscriptEntry } from '../types';

interface SessionEndedViewProps {
  sessionId: string;
  transcripts: TranscriptEntry[];
  onNewThread: () => void;
}

export const SessionEndedView: React.FC<SessionEndedViewProps> = ({
  sessionId, transcripts, onNewThread,
}) => {
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <p style={sessionIdStyle}>Session: {sessionId || 'N/A'}</p>
        <button style={newChatBtnStyle} onClick={onNewThread}>New chat</button>
      </div>
      <div style={transcriptStyle}>
        {transcripts.filter(t => t.isFinal).map((entry, idx) => (
          <div key={idx} style={entryStyle}>
            <span style={roleStyle}>{entry.role === 'user' ? '👤 You' : '🤖 Agent'}</span>
            <p style={textStyle}>{entry.text}</p>
          </div>
        ))}
        {transcripts.filter(t => t.isFinal).length === 0 && (
          <p style={emptyStyle}>No transcript available for this session.</p>
        )}
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '16px 20px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: '12px',
  borderBottom: '1px solid var(--border-subtle)',
  marginBottom: '12px',
};

const sessionIdStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--fg-2)',
  margin: 0,
  fontFamily: 'monospace',
};

const newChatBtnStyle: React.CSSProperties = {
  padding: '6px 16px',
  borderRadius: '9999px',
  border: '1px solid var(--border)',
  background: 'var(--bg-2)',
  color: 'var(--voice-primary)',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

const transcriptStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const entryStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

const roleStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--fg-2)',
};

const textStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: '20px',
  color: 'var(--fg-1)',
  margin: 0,
};

const emptyStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--fg-2)',
  textAlign: 'center',
  padding: '20px',
};
