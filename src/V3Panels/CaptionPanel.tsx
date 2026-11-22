import { AudioCueInfo, onAudioCue } from 'audioq';
import { type JSX, useEffect, useState } from 'react';
import './V3Panels.css';

interface Caption {
  team: unknown;
  text: string;
}

interface CaptionPanelProps {
  /** Channels whose captions are shown. */
  channels: readonly number[];
}

/** Shows the captions (ranged cues) of the given channels as they play, from onAudioCue. */
function CaptionPanel({ channels }: CaptionPanelProps): JSX.Element {
  const [captions, setCaptions] = useState<Record<number, Caption | null>>({});

  useEffect(() => {
    const handleCue = ({ active, channelNumber, cue }: AudioCueInfo): void => {
      setCaptions((current) => ({ ...current, [channelNumber]: active ? { team: cue.data, text: cue.text ?? '' } : null }));
    };
    const unsubscribes = channels.map((channel) => onAudioCue(channel, handleCue));
    return (): void => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [channels]);

  return (
    <div className="v3-panel content-container">
      <div className="v3-panel-title">💬 Captions from onAudioCue</div>
      <div className="v3-captions">
        {channels.map((channel) => {
          const caption: Caption | null | undefined = captions[channel];
          return (
            <div className={`v3-caption v3-team-${typeof caption?.team === 'string' ? caption.team : 'none'}`} key={channel}>
              <span className="v3-meta">Channel {channel}</span>
              <span>{caption ? caption.text : '…'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CaptionPanel;
