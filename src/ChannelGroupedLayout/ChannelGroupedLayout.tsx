import { MutableRefObject } from 'react';
import { AudioQueueVisualizerHandle } from '../AudioQueueVisualizer/AudioQueueVisualizer';
import { Example } from '../types';
import ChannelSection from '../ChannelSection/ChannelSection';
import GlobalControls from '../GlobalControls/GlobalControls';
import './ChannelGroupedLayout.css';

interface ChannelGroupedLayoutProps {
  examples: { example: Example[]; key: string }[];
  hasGlobalControls: boolean;
  queueState: { [channelNumber: number]: boolean };
  visualizerRefs: MutableRefObject<AudioQueueVisualizerHandle | null>[];
}

function ChannelGroupedLayout({ examples, queueState, visualizerRefs, hasGlobalControls }: ChannelGroupedLayoutProps): JSX.Element {
  // Group examples by channel based on the actual structure
  const getChannelExamples = (channelNumber: number): Example[] => {
    const channelExamples: Example[] = [];

    examples.forEach(({ example }) => {
      if (example.length === 2) {
        // Two-item arrays: index 0 = Channel 0, index 1 = Channel 1
        channelExamples.push(example[channelNumber]);
      }
      // Skip single-item arrays (global controls)
    });

    return channelExamples;
  };

  const getGlobalExamples = (): Example[] => {
    const globalExamples: Example[] = [];

    examples.forEach(({ example }) => {
      if (example.length === 1) {
        // Single-item arrays are global controls
        globalExamples.push(example[0]);
      }
    });

    return globalExamples;
  };

  const channel0Examples = getChannelExamples(0);
  const channel1Examples = getChannelExamples(1);
  const globalExamples = hasGlobalControls ? getGlobalExamples() : [];

  return (
    <div className="channel-grouped-layout">
      <div className="channels-container">
        <ChannelSection
          channelNumber={0}
          examples={channel0Examples}
          isChannelQueueEmpty={queueState[0]}
          visualizerRef={visualizerRefs[0]}
        />
        <ChannelSection
          channelNumber={1}
          examples={channel1Examples}
          isChannelQueueEmpty={queueState[1]}
          visualizerRef={visualizerRefs[1]}
        />
      </div>
      {hasGlobalControls && globalExamples.length > 0 && <GlobalControls examples={globalExamples} queueState={queueState} />}
    </div>
  );
}

export default ChannelGroupedLayout;
