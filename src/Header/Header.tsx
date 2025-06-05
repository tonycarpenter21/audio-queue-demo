import './Header.css';
import { ExampleTabs } from '../types';

interface HeaderProps {
  currentExampleTab: ExampleTabs;
  onTabChange: (tab: ExampleTabs) => void;
}

function Header({ currentExampleTab, onTabChange }: HeaderProps): JSX.Element {
  const handleTabClick = (tab: ExampleTabs): void => {
    if (tab === ExampleTabs.DOCUMENTATION) {
      // Open documentation in a new tab
      let docsUrl: string;

      if (process.env.NODE_ENV === 'development') {
        // In development, try different ports in order of preference
        const currentPort = window.location.port;
        if (currentPort === '3000') {
          docsUrl = 'http://localhost:3001'; // Demo on 3000, docs likely on 3001
        } else if (currentPort === '3001') {
          docsUrl = 'http://localhost:3000'; // Demo on 3001, docs likely on 3000
        } else {
          docsUrl = 'http://localhost:3000'; // Default to 3000
        }

        // Show a helpful message in development
        console.log(`📖 Opening docs at: ${docsUrl}`);
        console.log("💡 If docs don't load, make sure Docusaurus is running with: cd docs && npm start");
      } else {
        docsUrl = 'https://tonycarpenter21.github.io/audio-queue-demo/docs/';
      }

      window.open(docsUrl, '_blank', 'noopener,noreferrer');
    } else {
      onTabChange(tab);
    }
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
            <span className="feature-text">Queue Management</span>
          </button>
          <button
            className={`feature ${currentExampleTab === ExampleTabs.PAUSE_RESUME ? 'active' : ''}`}
            onClick={() => handleTabClick(ExampleTabs.PAUSE_RESUME)}
          >
            <span className="feature-icon">⏯️</span>
            <span className="feature-text">Pause & Resume</span>
          </button>
          <button
            className={`feature ${currentExampleTab === ExampleTabs.VOLUME_CONTROL ? 'active' : ''}`}
            onClick={() => handleTabClick(ExampleTabs.VOLUME_CONTROL)}
          >
            <span className="feature-icon">🔊</span>
            <span className="feature-text">Volume Control</span>
          </button>
          <button
            className={`feature ${currentExampleTab === ExampleTabs.DOCUMENTATION ? 'active' : ''}`}
            onClick={() => handleTabClick(ExampleTabs.DOCUMENTATION)}
          >
            <span className="feature-icon">📖</span>
            <span className="feature-text">Documentation</span>
          </button>
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
        </div>
      </div>
    </div>
  );
}

export default Header;
