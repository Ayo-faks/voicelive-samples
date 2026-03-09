import React from 'react';
import type { SessionState } from '../types';
import styles from './VoiceOrb.module.css';

interface VoiceOrbProps {
  state: SessionState;
  size?: number;
}

/**
 * Voice orb matching the Foundry Portal design:
 * - Idle: solid circle (120px default)
 * - Active: 3 concentric circles with graduated opacity + pulse animation
 */
export const VoiceOrb: React.FC<VoiceOrbProps> = ({ state, size = 120 }) => {
  const isActive = state === 'listening' || state === 'thinking' || state === 'speaking';
  const isConnecting = state === 'connecting';

  if (!isActive && !isConnecting) {
    // Idle: solid circle
    return (
      <div className={styles['orb-container']} style={{ width: size, height: size }}>
        <div className={styles['orb-idle']} style={{ width: size, height: size }} />
      </div>
    );
  }

  // Active/connecting: 3 concentric circles (Foundry: 244/182/138 from 120 base)
  const innerSize = Math.round(size * 1.15);  // 138px from 120
  const midSize = Math.round(size * 1.52);    // 182px from 120
  const outerSize = Math.round(size * 2.03);  // 244px from 120

  const pulseClass = state === 'listening' || state === 'connecting' ? styles['pulse-listening'] : '';

  return (
    <div
      className={`${styles['orb-container']} ${pulseClass}`}
      style={{ width: outerSize, height: outerSize }}
    >
      <div className={styles['circle-outer']} style={{ width: outerSize, height: outerSize }} />
      <div className={styles['circle-mid']} style={{ width: midSize, height: midSize }} />
      <div className={styles['circle-inner']} style={{ width: innerSize, height: innerSize }} />
    </div>
  );
};
