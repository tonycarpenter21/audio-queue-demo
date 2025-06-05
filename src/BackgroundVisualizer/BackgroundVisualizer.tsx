import React, { useEffect, useRef, useCallback } from 'react';
import './BackgroundVisualizer.css';

const BASE_CONFIG = {
  angleRandomness: 0.85,
  animated: true,
  animationSpeed: 0.01,
  blurIntensity: 6,
  colorBalance: 0.45,
  glowStrength: 0,
  lineLengthMax: 380,
  lineLengthMin: 100,
  lineThickness: 9,
  opacity: 1.0
} as const;

// Function to calculate responsive bar count based on screen width
const getResponsiveLineCount = (screenWidth: number): number => {
  if (screenWidth <= 480) {
    // Mobile phones: ~40 bars (40 * 9px = 360px, leaves room for spacing)
    return 20;
  } else if (screenWidth <= 1024) {
    // Tablets: ~60 bars (60 * 9px = 540px)
    return 40;
  } else if (screenWidth <= 1200) {
    // Small laptops: ~80 bars
    return 80;
  } else {
    // Desktop and larger: full 100 bars
    return 100;
  }
};

interface Spike {
  x: number;
  width: number;
  color: string;
  gradient: CanvasGradient | null;
  freq1: number;
  freq2: number;
  phase1: number;
  phase2: number;
  amplitude: number;
}

const BackgroundVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const spikesRef = useRef<Spike[]>([]);
  const timeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  const cachedHeightsRef = useRef<number[]>([]);

  const generateRandomColor = useCallback((balance: number): string => {
    const r: number = Math.floor(20 + balance * 40);
    const g: number = Math.floor(100 + balance * 100);
    const b: number = Math.floor(200 - balance * 100);
    return `rgb(${r}, ${g}, ${b})`;
  }, []);

  const createGradient = useCallback((ctx: CanvasRenderingContext2D, color: string, height: number): CanvasGradient => {
    const gradient = ctx.createLinearGradient(0, ctx.canvas.height, 0, ctx.canvas.height - height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
    return gradient;
  }, []);

  const generateSpikes = useCallback(
    (canvas: HTMLCanvasElement): Spike[] => {
      const spikes: Spike[] = [];
      const spikeCount: number = getResponsiveLineCount(canvas.width);
      const spacing: number = canvas.width / spikeCount;

      for (let i = 0; i < spikeCount; i++) {
        const x: number = i * spacing + spacing / 2;
        const color: string = generateRandomColor(BASE_CONFIG.colorBalance + (Math.random() - 0.5) * 0.2);

        spikes.push({
          amplitude: 0.4 + Math.random() * 0.6,
          color,
          freq1: 0.5 + Math.random() * 2,
          freq2: 2 + Math.random() * 4,
          gradient: null,
          phase1: Math.random() * Math.PI * 2,
          phase2: Math.random() * Math.PI * 2,
          width: BASE_CONFIG.lineThickness,
          x
        });
      }

      cachedHeightsRef.current = new Array(spikeCount).fill(0);
      return spikes;
    },
    [generateRandomColor]
  );

  const calculateHeights = useCallback((time: number): void => {
    const timeInSeconds: number = time * 0.001;
    const speed: number = BASE_CONFIG.animationSpeed * 10;
    const heights: number[] = cachedHeightsRef.current;

    spikesRef.current.forEach((spike, i) => {
      const wave1: number = Math.sin(timeInSeconds * spike.freq1 * speed + spike.phase1) * 0.6;
      const wave2: number = Math.sin(timeInSeconds * spike.freq2 * speed + spike.phase2) * 0.4;

      let amplitude: number = wave1 + wave2;

      // Always add chaos since it's hardcoded to 85%
      const chaos: number = Math.sin(timeInSeconds * spike.freq1 * 8 + spike.phase1 * 3) * 0.2 * BASE_CONFIG.angleRandomness;
      amplitude += chaos;

      amplitude = Math.max(0, amplitude * spike.amplitude + 0.5);
      const heightRange: number = BASE_CONFIG.lineLengthMax - BASE_CONFIG.lineLengthMin;
      heights[i] = BASE_CONFIG.lineLengthMin + amplitude * heightRange;
    });
  }, []);

  const animate = useCallback(
    (currentTime: number) => {
      const canvas: HTMLCanvasElement | null = canvasRef.current;
      if (!canvas) return;

      const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
      if (!ctx) return;

      // Limit to 30fps
      if (currentTime - lastFrameTimeRef.current < 33) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTimeRef.current = currentTime;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set global opacity
      ctx.globalAlpha = BASE_CONFIG.opacity;

      // Calculate all heights
      calculateHeights(timeRef.current);
      const heights: number[] = cachedHeightsRef.current;

      // Draw all spikes cleanly
      spikesRef.current.forEach((spike, i) => {
        const height: number = heights[i];

        if (height < 2) return;

        // Create gradient when needed
        if (!spike.gradient || Math.abs(height - BASE_CONFIG.lineLengthMax) < 50) {
          spike.gradient = createGradient(ctx, spike.color, BASE_CONFIG.lineLengthMax);
        }

        // Simple, clean draw
        ctx.fillStyle = spike.gradient;
        ctx.fillRect(spike.x - spike.width / 2, canvas.height - height, spike.width, height);
      });

      timeRef.current += 33;
      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [calculateHeights, createGradient]
  );

  const resizeCanvas = useCallback((): void => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    spikesRef.current = generateSpikes(canvas);
  }, [generateSpikes]);

  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas) return;

    resizeCanvas();

    const handleResize = (): void => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);

    return (): void => {
      window.removeEventListener('resize', handleResize);
    };
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas) return;

    spikesRef.current = generateSpikes(canvas);
  }, [generateSpikes]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);

    return (): void => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  return (
    <div className="background-visualizer-container">
      <canvas className="background-visualizer-canvas" ref={canvasRef} />
      <div
        className="background-visualizer-overlay"
        style={{
          WebkitBackdropFilter: `blur(${BASE_CONFIG.blurIntensity}px)`,
          backdropFilter: `blur(${BASE_CONFIG.blurIntensity}px)`
        }}
      />
    </div>
  );
};

export default BackgroundVisualizer;
