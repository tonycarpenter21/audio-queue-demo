import { useState } from 'react';
import './Header.css';
import { ExampleTabs } from '../types';

interface HeaderProps {
  currentExampleTab: ExampleTabs;
  onTabChange: (tab: ExampleTabs) => void;
}

interface AdvancedFeatureOption {
  icon: string;
  label: string;
  tab: ExampleTabs;
}

function Header({ currentExampleTab, onTabChange }: HeaderProps): JSX.Element {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const advancedFeatureOptions: AdvancedFeatureOption[] = [
    {
      icon: '🦆',
      label: 'Audio Ducking',
      tab: ExampleTabs.AUDIO_DUCKING
    },
    {
      icon: '📊',
      label: 'Audio Info',
      tab: ExampleTabs.AUDIO_INFO
    },
    {
      icon: '🔝',
      label: 'Add Priority Sound',
      tab: ExampleTabs.PRIORITY_SOUNDS
    }
  ];

  const handleTabClick = (tab: ExampleTabs): void => {
    if (tab === ExampleTabs.OTHER_FEATURES) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      onTabChange(tab);
      setIsDropdownOpen(false);
    }
  };

  const handleDropdownItemClick = (tab: ExampleTabs): void => {
    onTabChange(tab);
    setIsDropdownOpen(false);
  };

  const isAdvancedFeatureActive = (): boolean => {
    return advancedFeatureOptions.some((option) => option.tab === currentExampleTab);
  };

  return (
    <div className="header-container">
      <div className="hero-content">
        <h1>Audio Channel Queue</h1>
        <p className="hero-description">
          Multi-channel audio queue management for browsers with real-time progress tracking, volume control, and advanced event handling.
          Perfect for games, interactive applications, and web-based audio experiences.
        </p>

        <div className="feature-highlights">
          <button
            className={`feature ${currentExampleTab === ExampleTabs.QUEUE_MANAGEMENT ? 'active' : ''}`}
            onClick={() => handleTabClick(ExampleTabs.QUEUE_MANAGEMENT)}
          >
            <span className="feature-icon">🎵</span>
            <span className="feature-text">{ExampleTabs.QUEUE_MANAGEMENT}</span>
          </button>
          <button
            className={`feature ${currentExampleTab === ExampleTabs.PAUSE_RESUME ? 'active' : ''}`}
            onClick={() => handleTabClick(ExampleTabs.PAUSE_RESUME)}
          >
            <span className="feature-icon">⏯️</span>
            <span className="feature-text">{ExampleTabs.PAUSE_RESUME}</span>
          </button>
          <button
            className={`feature ${currentExampleTab === ExampleTabs.VOLUME_LOOPING ? 'active' : ''}`}
            onClick={() => handleTabClick(ExampleTabs.VOLUME_LOOPING)}
          >
            <span className="feature-icon">🔊</span>
            <span className="feature-text">{ExampleTabs.VOLUME_LOOPING}</span>
          </button>
          <div className="advanced-features-container">
            <button
              className={`feature ${isAdvancedFeatureActive() ? 'active' : ''}`}
              onClick={() => handleTabClick(ExampleTabs.OTHER_FEATURES)}
            >
              <span className="feature-icon">⚙️</span>
              <div className="feature-text-with-arrow">
                <span className="feature-text">{ExampleTabs.OTHER_FEATURES}</span>
                <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
              </div>
            </button>
            {isDropdownOpen && (
              <>
                <div className="dropdown-backdrop" onClick={() => setIsDropdownOpen(false)} />
                <div className="dropdown-menu">
                  {advancedFeatureOptions.map((option) => (
                    <button
                      className={`dropdown-item ${currentExampleTab === option.tab ? 'active' : ''}`}
                      key={option.tab}
                      onClick={() => handleDropdownItemClick(option.tab)}
                    >
                      <span className="dropdown-icon">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="hero-actions">
          <a
            className="action-button primary"
            href="https://www.npmjs.com/package/audio-channel-queue"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="button-icon">📦</span>
            Install Package
          </a>
          <a
            className="action-button secondary"
            href="https://github.com/tonycarpenter21/audio-channel-queue"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="button-icon">⭐</span>
            View on GitHub
          </a>
          <a
            className="action-button secondary"
            href="https://tonycarpenter21.github.io/audio-queue-docs/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="button-icon">📖</span>
            Documentation
          </a>
        </div>
      </div>
    </div>
  );
}

export default Header;
