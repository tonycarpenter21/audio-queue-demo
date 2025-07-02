import { FadeOption } from '../types';
import { FadeType } from 'audio-channel-queue';
import './FadeControls.css';

interface FadeControlsProps {
  selectedFadeOption: FadeOption;
  onFadeOptionChange: (option: FadeOption) => void;
}

interface FadeOptionConfig {
  value: FadeOption;
  label: string;
  description: string;
}

const fadeOptions: FadeOptionConfig[] = [
  {
    description: 'Instant pause/resume (original behavior)',
    label: 'No Fade',
    value: 'None'
  },
  {
    description: 'Constant rate fade (mechanical)',
    label: 'Linear',
    value: FadeType.Linear
  },
  {
    description: 'Smooth, natural fade (recommended)',
    label: 'Gentle',
    value: FadeType.Gentle
  },
  {
    description: 'Quick, impactful fade (intense)',
    label: 'Dramatic',
    value: FadeType.Dramatic
  }
];

export default function FadeControls({ selectedFadeOption, onFadeOptionChange }: FadeControlsProps): JSX.Element {
  return (
    <div className="fade-controls">
      <h3 className="fade-controls-title">🎵 Audio Fade Options</h3>
      <p className="fade-controls-description">
        Choose how audio fades when pausing/resuming. The code examples below will update automatically.
      </p>
      <div className="fade-options-buttons">
        {fadeOptions.map((option) => (
          <button
            className={`fade-option-button ${selectedFadeOption === option.value ? 'active' : ''}`}
            key={option.value}
            onClick={() => onFadeOptionChange(option.value)}
          >
            <div className="fade-option-label">{option.label}</div>
            <div className="fade-option-description">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
