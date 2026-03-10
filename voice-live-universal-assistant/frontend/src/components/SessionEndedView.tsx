import React from 'react';
import { Button, Text } from '@fluentui/react-components';
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
        <Text size={200} font="monospace" style={{ color: 'var(--fg-2)' }}>Session: {sessionId || 'N/A'}</Text>
        <Button appearance="primary" shape="circular" onClick={onNewThread} style={{ minWidth: '120px' }}>
          New chat
        </Button>
      </div>
      <div style={transcriptStyle}>
        {transcripts.filter(t => t.isFinal).map((entry, idx) => (
          <div key={idx} style={entryStyle}>
            <Text size={200} weight="semibold" style={{ color: 'var(--fg-2)' }}>
              {entry.role === 'user' ? '👤 You' : '🤖 Agent'}
            </Text>
            <Text size={300}>{entry.text}</Text>
          </div>
        ))}
        {transcripts.filter(t => t.isFinal).length === 0 && (
          <Text size={300} align="center" style={{ color: 'var(--fg-2)', padding: '20px' }}>
            No transcript available for this session.
          </Text>
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
