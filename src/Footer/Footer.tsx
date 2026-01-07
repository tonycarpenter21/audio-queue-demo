import './Footer.css';
import packageJson from '../../package.json';
import DebugConsole from '../DebugConsole/DebugConsole';

function Footer(): JSX.Element {
  const packageVersion: string = packageJson.dependencies['audioq'];

  return (
    <div className="footer-container">
      <div className="footer-link-container">
        <a href="https://www.npmjs.com/package/audioq">NPM Package</a>
        <a href="https://github.com/tonycarpenter21/audioq">NPM Package Github Repo</a>
        <a href="https://github.com/tonycarpenter21/audio-queue-demo">Demo Github Repo</a>
        <a href="https://tonycarpenter21.github.io/audio-queue-docs/">Documentation</a>
      </div>
      <div>
        This project is licensed under the <a href="https://github.com/tonycarpenter21/audioq/blob/main/LICENSE">MIT License</a>
      </div>
      <div className="footer-version">
        <span className="footer-version-badge">Package Version: {packageVersion}</span>
      </div>
      <div className="footer-debug-console-wrapper">
        <DebugConsole />
      </div>
    </div>
  );
}

export default Footer;
