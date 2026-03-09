import React from 'react';

interface WavesProps {
  paused?: boolean;
}

/**
 * Animated SVG waves background — matches Foundry Portal's agentPreview waves.
 * Pauses animation when chat has messages (paused prop).
 */
export const Waves: React.FC<WavesProps> = ({ paused = false }) => {
  return (
    <div style={containerStyle}>
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={svgStyle}
      >
        <path
          d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,218.7C672,213,768,171,864,165.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          style={{
            ...wavePathStyle,
            opacity: 0.04,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
        <path
          d="M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,245.3C672,256,768,256,864,234.7C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          style={{
            ...wavePathStyle,
            opacity: 0.025,
            animationDelay: '-2s',
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
        <path
          d="M0,256L48,250.7C96,245,192,235,288,224C384,213,480,203,576,208C672,213,768,235,864,240C960,245,1056,235,1152,218.7C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          style={{
            ...wavePathStyle,
            opacity: 0.04,
            animationDelay: '-4s',
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      </svg>
      <style>{keyframes}</style>
    </div>
  );
};

const keyframes = `
@keyframes wave-drift {
  0% { transform: translateX(0); }
  50% { transform: translateX(-25px); }
  100% { transform: translateX(0); }
}
`;

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '30%',
  pointerEvents: 'none',
  overflow: 'hidden',
  zIndex: 0,
};

const svgStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  width: '100%',
  height: '100%',
};

const wavePathStyle: React.CSSProperties = {
  fill: 'var(--wave-color)',
  animation: 'wave-drift 8s ease-in-out infinite',
};
