import { type JSX, useEffect, useRef } from 'react';
import './V3Panels.css';

const BANDS: number = 16;

interface SpectrumBarsProps {
  /** The analyser to draw (undefined draws flat bars). */
  analyser: AnalyserNode | undefined;
  /** What the bars show, for screen readers and the caption under them. */
  label: string;
}

/**
 * A live 16-band spectrum. Bar heights are written straight to the DOM each animation frame, so
 * React does not re-render 60 times a second.
 */
function SpectrumBars({ analyser, label }: SpectrumBarsProps): JSX.Element {
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bars = barsRef.current;
    if (!analyser || !bars) return undefined;
    analyser.fftSize = BANDS * 2;
    analyser.smoothingTimeConstant = 0.75;
    const levels = new Uint8Array(analyser.frequencyBinCount);
    let frame: number = 0;
    const draw = (): void => {
      analyser.getByteFrequencyData(levels);
      Array.from(bars.children).forEach((bar, index) => {
        (bar as HTMLElement).style.height = `${Math.max(4, ((levels[index] ?? 0) / 255) * 100)}%`;
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return (): void => cancelAnimationFrame(frame);
  }, [analyser]);

  return (
    <figure className="v3-spectrum-figure">
      <div aria-label={`${label} spectrum`} className="v3-spectrum" ref={barsRef} role="img">
        {Array.from({ length: BANDS }, (_, index) => (
          <div className="v3-spectrum-bar" key={index} />
        ))}
      </div>
      <figcaption className="v3-meta">{label}</figcaption>
    </figure>
  );
}

export default SpectrumBars;
