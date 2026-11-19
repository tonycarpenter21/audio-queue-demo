import { type JSX, MutableRefObject } from 'react';
import { AudioQueueVisualizerHandle } from '../AudioQueueVisualizer/AudioQueueVisualizer';
import ChannelSection from '../ChannelSection/ChannelSection';
import { Example } from '../types';

interface ChannelsLayoutProps {
  channel0Examples: Example[];
  channel1Examples: Example[];
  queueState: Record<number, boolean>;
  queueLengths: Record<number, number>;
  pauseState: Record<number, boolean>;
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
  enableReordering,
  onMoveDown,
  onMoveUp,
  onRemoveItem,
  pauseState,
  queueLengths,
  queueState,
  showAudioInfo,
  visualizerRefs
}: ChannelsLayoutProps): JSX.Element {
  const channelConfigs = [
    { channelNumber: 0, examples: channel0Examples, visualizerRef: visualizerRefs[0] },
    { channelNumber: 1, examples: channel1Examples, visualizerRef: visualizerRefs[1] }
  ];

  return (
    <div className="channels-container">
      {channelConfigs.map(
        ({ channelNumber, examples, visualizerRef }) =>
          visualizerRef && (
            <ChannelSection
              channelNumber={channelNumber}
              channelQueueLength={queueLengths[channelNumber] ?? 0}
              enableReordering={enableReordering}
              examples={examples}
              isChannelQueueEmpty={queueState[channelNumber] ?? true}
              key={channelNumber}
              onMoveDown={(from, channel) => void onMoveDown(from, channel)}
              onMoveUp={(from, channel) => void onMoveUp(from, channel)}
              onRemoveItem={(from, channel) => void onRemoveItem(from, channel)}
              pauseState={pauseState[channelNumber] ?? false}
              showAudioInfo={showAudioInfo}
              visualizerRef={visualizerRef}
            />
          )
      )}
    </div>
  );
}
