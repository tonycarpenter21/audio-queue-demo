import { MutableRefObject } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import AudioQueueVisualizer, { AudioQueueVisualizerHandle } from '../AudioQueueVisualizer/AudioQueueVisualizer';
import ChannelAudioInfo from '../ChannelAudioInfo/ChannelAudioInfo';
import { Example } from '../types';
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
  examples,
  isChannelQueueEmpty,
  pauseState,
  showAudioInfo = false,
  visualizerRef,
  enableReordering = false,
  onMoveUp,
  onMoveDown,
  onRemoveItem
}: ChannelSectionProps): JSX.Element {
  return (
    <div className="channel-section content-container channel-container">
      <h3 className="section-title section-title-primary">Channel {channelNumber}</h3>

      <div className="channel-controls">
        {examples.map((example, index) => {
          // Standard disabled logic for queue-empty dependent buttons
          let isDisabled: boolean = false;

          if (example.isDisabledWhenQueueIsEmpty !== undefined) {
            isDisabled = example.isDisabledWhenQueueIsEmpty ? isChannelQueueEmpty : false;
          }

          // Check minimum queue length requirement
          if (example.minQueueLength !== undefined) {
            isDisabled = isDisabled || channelQueueLength < example.minQueueLength;
          }

          // Additional disabled logic for buttons that should be disabled when channel is playing
          const isChannelPlaying: boolean = !isChannelQueueEmpty; // If queue is not empty, channel is playing
          if (example.isDisabledWhenChannelPlaying !== undefined) {
            isDisabled = isDisabled || (example.isDisabledWhenChannelPlaying && isChannelPlaying);
          }

          // Special logic for pause/resume buttons based on current pause state
          const buttonText: string = example.buttonText.toLowerCase();
          if (buttonText.includes('resume') && !buttonText.includes('all')) {
            // Resume buttons should only be enabled when channel is paused
            isDisabled = !pauseState;
          } else if (buttonText.includes('pause') && !buttonText.includes('all') && !buttonText.includes('toggle')) {
            // Pause buttons should only be enabled when channel is not paused and has audio
            isDisabled = pauseState || isChannelQueueEmpty;
          } else if (buttonText.includes('toggle')) {
            // Toggle buttons should always be enabled when there are audio files in queue
            isDisabled = isChannelQueueEmpty;
          }

          const isLastItem: boolean = index === examples.length - 1;

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
