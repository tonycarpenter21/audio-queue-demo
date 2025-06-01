import { MutableRefObject } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AudioQueueVisualizerHandle } from '../AudioQueueVisualizer/AudioQueueVisualizer';
import AudioQueueVisualizer from '../AudioQueueVisualizer/AudioQueueVisualizer';
import { Example } from '../types';
import Divider from '../Divider/Divider';
import './ChannelSection.css';

interface ChannelSectionProps {
  channelNumber: number;
  examples: Example[];
  isChannelQueueEmpty: boolean;
  visualizerRef: MutableRefObject<AudioQueueVisualizerHandle | null>;
}

function ChannelSection({ channelNumber, examples, isChannelQueueEmpty, visualizerRef }: ChannelSectionProps): JSX.Element {
  return (
    <div className="channel-section content-container channel-container">
      <h3 className="section-title section-title-primary">Channel {channelNumber}</h3>

      <div className="channel-controls">
        {examples.map((example, index) => {
          const isDisabled = example.isDisabledWhenQueueIsEmpty && isChannelQueueEmpty;
          const isLastItem = index === examples.length - 1;

          return (
            <div className="channel-control-item" key={example.buttonText}>
              <button className={`button ${isDisabled ? 'disabled' : ''}`} disabled={isDisabled} onClick={() => example.buttonFunction()}>
                {example.buttonText}
              </button>

              <SyntaxHighlighter
                customStyle={{
                  borderRadius: '10px',
                  padding: '10px 20px'
                }}
                language="typescript"
                style={vscDarkPlus}
              >
                {example.codeExample}
              </SyntaxHighlighter>

              {!isLastItem && <Divider />}
            </div>
          );
        })}
      </div>

      <div className="channel-visualizer">
        <AudioQueueVisualizer channelNumber={channelNumber} ref={visualizerRef} />
      </div>
    </div>
  );
}

export default ChannelSection;
