import { MutableRefObject } from 'react';
import { AudioQueueVisualizerHandle } from '../AudioQueueVisualizer/AudioQueueVisualizer';
import ChannelSection from '../ChannelSection/ChannelSection';
import { Example } from '../types';

interface ChannelsLayoutProps {
  channel0Examples: Example[];
  channel1Examples: Example[];
  queueState: {
    [channelNumber: number]: boolean;
  };
  queueLengths: {
    [channelNumber: number]: number;
  };
  pauseState: {
    [channelNumber: number]: boolean;
  };
  visualizerRefs: MutableRefObject<AudioQueueVisualizerHandle | null>[];
  enableReordering: boolean;
  showAudioInfo: boolean;
  onMoveUp: (fromIndex: number, channelNumber: number) => Promise<void>;
  onMoveDown: (fromIndex: number, channelNumber: number) => Promise<void>;
  onRemoveItem: (fromIndex: number, channelNumber: number) => Promise<void>;
}

export default function ChannelsLayout({
  channel0Examples,
  channel1Examples,
  queueState,
  queueLengths,
  pauseState,
  visualizerRefs,
  enableReordering,
  showAudioInfo,
  onMoveUp,
  onMoveDown,
  onRemoveItem
}: ChannelsLayoutProps): JSX.Element {
  const channelConfigs = [
    { channelNumber: 0, examples: channel0Examples },
    { channelNumber: 1, examples: channel1Examples }
  ];

  return (
    <div className="channels-container">
      {channelConfigs.map(({ channelNumber, examples }) => (
        <ChannelSection
          channelNumber={channelNumber}
          channelQueueLength={queueLengths[channelNumber]}
          enableReordering={enableReordering}
          examples={examples}
          isChannelQueueEmpty={queueState[channelNumber]}
          key={channelNumber}
          onMoveDown={onMoveDown}
          onMoveUp={onMoveUp}
          onRemoveItem={onRemoveItem}
          pauseState={pauseState[channelNumber]}
          showAudioInfo={showAudioInfo}
          visualizerRef={visualizerRefs[channelNumber]}
        />
      ))}
    </div>
  );
}
