import { AudioCueInfo, onAudioCue } from 'audioq';
import { useEffect, useState } from 'react';
import './V3Panels.css';

interface Caption {
  team: unknown;
  text: string;
}

/** Shows ranged cues as captions and flashes on point cues, for both channels. */
function CaptionPanel(): JSX.Element {
  const [captions, setCaptions] = useState<Record<number, Caption | null>>({});
  const [beat, setBeat] = useState<number | null>(null);

  useEffect(() => {
    let beatTimer: ReturnType<typeof setTimeout> | undefined;
    const handleCue = ({ active, channelNumber, cue }: AudioCueInfo): void => {
      if (cue.endMs === undefined) {
        // A point cue: flash the beat number
        const data = cue.data as { beat?: number } | undefined;
        setBeat(data?.beat ?? null);
        clearTimeout(beatTimer);
        beatTimer = setTimeout(() => setBeat(null), 300);
        return;
      }
      setCaptions((current) => ({ ...current, [channelNumber]: active ? { team: cue.data, text: cue.text ?? '' } : null }));
    };
    const unsubscribes = [onAudioCue(0, handleCue), onAudioCue(1, handleCue)];
    return (): void => {
      clearTimeout(beatTimer);
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  return (
    <div className="v3-panel content-container">
      <div className="v3-panel-title">💬 Captions from onAudioCue</div>
      <div className="v3-captions">
        {[0, 1].map((channel) => {
          const caption: Caption | null | undefined = captions[channel];
          return (
            <div className={`v3-caption v3-team-${String(caption?.team ?? 'none')}`} key={channel}>
              <span className="v3-meta">Channel {channel}</span>
              <span>{caption ? caption.text : '…'}</span>
            </div>
          );
        })}
        <div className={`v3-beat ${beat === null ? '' : 'v3-beat-on'}`}>{beat === null ? 'beat' : `beat ${beat + 1}`}</div>
      </div>
    </div>
  );
}

export default CaptionPanel;
