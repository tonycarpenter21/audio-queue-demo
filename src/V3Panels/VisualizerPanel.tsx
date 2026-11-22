import { getChannelAnalyser } from 'audioq';
import { type JSX, useEffect, useState } from 'react';
import SpectrumBars from './SpectrumBars';
import './V3Panels.css';

interface Analysers {
  channel0: AnalyserNode;
  channel1: AnalyserNode;
  mix: AnalyserNode;
}

/**
 * Three spectrums: channel 0, channel 1, and both together. The combined one is a plain Web Audio
 * AnalyserNode that both channel analysers also play into.
 */
function VisualizerPanel(): JSX.Element {
  const [analysers, setAnalysers] = useState<Analysers | undefined>(undefined);

  useEffect(() => {
    const channel0 = getChannelAnalyser(0);
    const channel1 = getChannelAnalyser(1);
    if (!channel0 || !channel1) return undefined;
    const mix = channel0.context.createAnalyser();
    channel0.connect(mix);
    channel1.connect(mix);
    setAnalysers({ channel0, channel1, mix });
    return (): void => {
      try {
        channel0.disconnect(mix);
        channel1.disconnect(mix);
      } catch {
        // The audio context was already closed (destroyAllChannels); nothing left to disconnect.
      }
    };
  }, []);

  return (
    <div className="v3-panel content-container">
      <div className="v3-panel-title">📈 getChannelAnalyser()</div>
      {analysers ? (
        <>
          <SpectrumBars analyser={analysers.channel0} label="Channel 0" />
          <SpectrumBars analyser={analysers.channel1} label="Channel 1" />
          <SpectrumBars analyser={analysers.mix} label="Both channels" />
        </>
      ) : (
        <div className="v3-meta">Web Audio is not available in this browser.</div>
      )}
    </div>
  );
}

export default VisualizerPanel;
