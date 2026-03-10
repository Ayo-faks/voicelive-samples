import React from 'react';
import type { SessionState } from '../types';
import styles from './VoiceOrb.module.css';

interface VoiceOrbProps {
  state: SessionState;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({ state }) => {
  const isConnected = state === 'listening' || state === 'thinking' || state === 'speaking' || state === 'connecting';
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening' || state === 'connecting';

  return (
    <div className={`${styles.pulseContainer} ${isConnected ? styles.connected : styles.disconnected}`}>
      {isConnected ? (
        <div className={`${styles.circleStack} ${isSpeaking ? styles.stackSpeaking : ''}`}>
          {/* 3-ring system: outer, middle, inner */}
          <div className={`${styles.ring} ${styles.ringOuter}`} />
          <div className={`${styles.ring} ${styles.ringMiddle}`} />
          <div className={`${styles.ring} ${styles.ringInner}`} />
          {/* Core circle — opacity 0.33 when active */}
          <div className={`${styles.circleCore} ${styles.circleCoreActive} ${isListening ? styles.pulseListening : ''}`} />
        </div>
      ) : (
        /* Idle: solid core circle only */
        <div className={styles.circleCore} />
      )}
    </div>
  );
};
