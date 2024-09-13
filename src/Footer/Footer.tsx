import Divider from '../Divider/Divider';
import './Footer.css';

function Footer(): JSX.Element {
  return (
    <div className="footer-container">
      <Divider />
      <div className="footer-link-container">
        <a href="https://www.npmjs.com/package/audio-channel-queue">NPM Package</a>
        <a href="https://github.com/tonycarpenter21/audio-channel-queue">NPM Package Github Repo</a>
        <a href="https://github.com/tonycarpenter21/audio-queue-demo">Demo Github Repo</a>
      </div>
      <div>
        This project is licensed under the{' '}
        <a href="https://github.com/tonycarpenter21/audio-channel-queue/blob/main/LICENSE">MIT License</a>
      </div>
    </div>
  );
}

export default Footer;
