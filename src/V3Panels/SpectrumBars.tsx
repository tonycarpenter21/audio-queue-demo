import { getChannelAnalyser } from 'audioq';
import { type JSX, useEffect, useRef } from 'react';
import './V3Panels.css';

const BANDS: number = 16;

interface SpectrumBarsProps {
  channelNumber: number;
}

/**
 * A live spectrum from getChannelAnalyser. Bar heights are written straight to the DOM each
 * animation frame, so React does not re-render 60 times a second.
 */
function SpectrumBars({ channelNumber }: SpectrumBarsProps): JSX.Element {
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const analyser = getChannelAnalyser(channelNumber);
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
  }, [channelNumber]);

  return (
    <div aria-label={`Channel ${channelNumber} spectrum`} className="v3-spectrum" ref={barsRef} role="img">
      {Array.from({ length: BANDS }, (_, index) => (
        <div className="v3-spectrum-bar" key={index} />
      ))}
    </div>
  );
}

export default SpectrumBars;
