import { useCallback, useState } from 'react';
import './VolumeSlider.css';

interface VolumeSliderProps {
  channelNumber?: number;
  initialVolume?: number;
  isGlobal?: boolean;
  onVolumeChange: (volume: number, channelNumber?: number) => void;
}

function VolumeSlider({ channelNumber, initialVolume = 1, isGlobal = false, onVolumeChange }: VolumeSliderProps): JSX.Element {
  const [volume, setVolume] = useState<number>(initialVolume);

  const handleVolumeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume: number = parseFloat(event.target.value);
      setVolume(newVolume);
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
    if (isGlobal) return 'Master Volume';
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
            maxWidth: '100%',
            width: `calc(${volume * 100}% + ${volume === 0 ? 0 : 10}px)`
          }}
        />
      </div>
    </div>
  );
}

export default VolumeSlider;
