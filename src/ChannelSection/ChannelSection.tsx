import { type JSX, MutableRefObject } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import AudioQueueVisualizer, { AudioQueueVisualizerHandle } from '../AudioQueueVisualizer/AudioQueueVisualizer';
import ChannelAudioInfo from '../ChannelAudioInfo/ChannelAudioInfo';
import { Example } from '../types';
import { channelActivity, isExampleEnabled } from '../ExampleTab/exampleOrganizer';
import Divider from '../Divider/Divider';
import './ChannelSection.css';

interface ChannelSectionProps {
  channelNumber: number;
  channelQueueLength: number;
  examples: Example[];
  isChannelQueueEmpty: boolean;
  pauseState: boolean;
  showAudioInfo?: boolean;
  visualizerRef: MutableRefObject<AudioQueueVisualizerHandle | null>;
  enableReordering?: boolean;
  onMoveUp?: (fromIndex: number, channelNumber: number) => void;
  onMoveDown?: (fromIndex: number, channelNumber: number) => void;
  onRemoveItem?: (fromIndex: number, channelNumber: number) => void;
}

function ChannelSection({
  channelNumber,
  channelQueueLength,
  enableReordering = false,
  examples,
  isChannelQueueEmpty,
  onMoveDown,
  onMoveUp,
  onRemoveItem,
  pauseState,
  showAudioInfo = false,
  visualizerRef
}: ChannelSectionProps): JSX.Element {
  return (
    <div className="channel-section content-container channel-container">
      <h3 className="section-title section-title-primary">Channel {channelNumber}</h3>

      <div className="channel-controls">
        {examples.map((example, index) => {
          const isDisabled: boolean = !isExampleEnabled(example, channelActivity(isChannelQueueEmpty, pauseState, channelQueueLength));

          const isLastItem: boolean = index === examples.length - 1;

          return (
            <div className="channel-control-item" key={example.buttonText}>
              <button
                className={`button ${isDisabled ? 'disabled' : ''}`}
                disabled={isDisabled}
                onClick={() => void example.buttonFunction()}
              >
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
        <AudioQueueVisualizer
          channelNumber={channelNumber}
          enableReordering={enableReordering}
          onMoveDown={onMoveDown}
          onMoveUp={onMoveUp}
          onRemoveItem={onRemoveItem}
          ref={visualizerRef}
        />
      </div>

      {showAudioInfo && <ChannelAudioInfo channelNumber={channelNumber} />}
    </div>
  );
}

export default ChannelSection;
