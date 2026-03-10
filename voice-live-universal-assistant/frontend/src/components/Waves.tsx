import React, { useRef, useEffect, useCallback } from 'react';

interface WavesProps {
  paused?: boolean;
}

interface WaveConfig {
  amplitude: number;
  frequency: number;
  speed: number;
  colorLight: string;
  baseHeight: number;
  verticalAmplitude: number;
  parallaxFactor: number;
}

const WAVES: WaveConfig[] = [
  { amplitude: 20, frequency: 0.004, speed: 0.02,  colorLight: 'hsla(0, 0%, 60%, 0.2)', baseHeight: 0.9,  verticalAmplitude: 8,  parallaxFactor: 1   },
  { amplitude: 15, frequency: 0.007, speed: 0.015, colorLight: 'hsla(0, 0%, 70%, 0.2)', baseHeight: 0.71, verticalAmplitude: 12, parallaxFactor: 0.7 },
  { amplitude: 12, frequency: 0.01,  speed: 0.01,  colorLight: 'hsla(0, 0%, 80%, 0.2)', baseHeight: 0.6,  verticalAmplitude: 15, parallaxFactor: 0.4 },
];

export const Waves: React.FC<WavesProps> = ({ paused = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef(0);

  const drawWave = useCallback((ctx: CanvasRenderingContext2D, wave: WaveConfig, canvasWidth: number, canvasHeight: number, time: number) => {
    const verticalOffset = Math.sin(time * wave.speed * 0.5) * wave.verticalAmplitude;
    ctx.fillStyle = wave.colorLight;
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight);
    for (let x = 0; x <= canvasWidth; x++) {
      const y = canvasHeight * wave.baseHeight + verticalOffset + Math.sin(x * wave.frequency + time * wave.speed * wave.parallaxFactor) * wave.amplitude;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvasWidth, canvasHeight);
    ctx.closePath();
    ctx.fill();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(container);
    resizeCanvas();

    const animate = (now: number) => {
      if (!lastFrameRef.current) lastFrameRef.current = now;
      const deltaTime = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;

      if (!paused) {
        timeRef.current += deltaTime * 50;
      }

      const rect = container.getBoundingClientRect();
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw back to front (reverse order)
      for (let i = WAVES.length - 1; i >= 0; i--) {
        drawWave(ctx, WAVES[i], rect.width, rect.height, timeRef.current);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [paused, drawWave]);

  return (
    <div ref={containerRef} style={containerStyle}>
      <canvas ref={canvasRef} style={canvasStyle} />
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '300px',
  width: '100%',
  pointerEvents: 'none',
  zIndex: 0,
};

const canvasStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
};
