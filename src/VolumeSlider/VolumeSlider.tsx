import { useCallback, useState } from 'react';
import './VolumeSlider.css';

interface VolumeSliderProps {
  channelNumber?: number;
  initialVolume?: number;
  label?: string;
  onVolumeChange: (volume: number, channelNumber?: number) => void;
  volume?: number;
}

function VolumeSlider({ channelNumber, initialVolume = 1, label, onVolumeChange, volume: externalVolume }: VolumeSliderProps): JSX.Element {
  const [internalVolume, setInternalVolume] = useState<number>(initialVolume);

  // Use external volume if provided (for controlled component), otherwise use internal state
  const volume: number = externalVolume !== undefined ? externalVolume : internalVolume;

  const handleVolumeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume: number = parseFloat(event.target.value);
      setInternalVolume(newVolume);
      onVolumeChange(newVolume, channelNumber);
    },
    [onVolumeChange, channelNumber]
  );

  const getVolumeIcon = (): string => {
    if (volume === 0) return '🔇';
    if (volume < 0.3) return '🔈';
    if (volume < 0.7) return '🔉';
    return '🔊';
  };

  const getVolumeLabel = (): string => {
    if (label) return label;
    return `Channel ${channelNumber} Volume`;
  };

  return (
    <div className="volume-slider-container">
      <div className="volume-slider-header">
        <div className="volume-icon-container">
          <span className="volume-icon">{getVolumeIcon()}</span>
        </div>
        <span className="volume-label">{getVolumeLabel()}</span>
        <div className="volume-value-container">
          <span className="volume-value">{Math.round(volume * 100)}%</span>
        </div>
      </div>
      <div className="volume-slider-wrapper">
        <div className="volume-slider-track-background" />
        <input className="volume-slider" max="1" min="0" onChange={handleVolumeChange} step="0.01" type="range" value={volume} />
        <div
          className="volume-slider-fill"
          style={{
            width: `calc(${volume * 100}% + ${10 - volume * 20}px)`
          }}
        />
      </div>
    </div>
  );
}

export default VolumeSlider;
