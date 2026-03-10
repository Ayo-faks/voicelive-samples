import React from 'react';
import type { SessionState } from '../types';
import styles from './VoiceOrb.module.css';

interface VoiceOrbProps {
  state: SessionState;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({ state }) => {
  const isConnected = state === 'listening' || state === 'thinking' || state === 'speaking' || state === 'connecting';
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';

  return (
    <div className={`${styles.pulseContainer} ${isConnected ? styles.connected : styles.disconnected}`}>
      {isConnected && (
        <>
          {/* Outer pulse ring: 228px, opacity 0.2 */}
          <div
            className={`${styles.pulse} ${isSpeaking ? styles.pulseMove : ''}`}
            style={{
              '--pulse-width': '228px',
              '--pulse-height': '228px',
              '--pulse-opacity': '0.2',
            } as React.CSSProperties}
          />
          {/* Inner pulse ring: 190px, opacity 0.3 */}
          <div
            className={`${styles.pulse} ${isSpeaking ? styles.pulseMove : ''}`}
            style={{
              '--pulse-width': '190px',
              '--pulse-height': '190px',
              '--pulse-opacity': '0.3',
            } as React.CSSProperties}
          />
        </>
      )}
      {/* Core circle: 120px solid */}
      <div className={`${styles.circleCore} ${isListening || state === 'connecting' ? styles.pulseListening : ''}`} />
    </div>
  );
};
