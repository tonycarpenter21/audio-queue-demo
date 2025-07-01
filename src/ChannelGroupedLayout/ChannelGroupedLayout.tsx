import { MutableRefObject } from 'react';
import { AudioQueueVisualizerHandle } from '../AudioQueueVisualizer/AudioQueueVisualizer';
import { Example } from '../types';
import ChannelSection from '../ChannelSection/ChannelSection';
import GlobalControls from '../GlobalControls/GlobalControls';
import './ChannelGroupedLayout.css';

interface ChannelGroupedLayoutProps {
  examples: { example: Example[]; key: string }[];
  hasGlobalControls: boolean;
  queueLengths: { [channelNumber: number]: number };
  queueState: { [channelNumber: number]: boolean };
  pauseState: { [channelNumber: number]: boolean };
  visualizerRefs: MutableRefObject<AudioQueueVisualizerHandle | null>[];
}

function ChannelGroupedLayout({
  examples,
  queueLengths,
  queueState,
  pauseState,
  visualizerRefs,
  hasGlobalControls
}: ChannelGroupedLayoutProps): JSX.Element {
  // Group examples by channel based on the actual structure
  const getChannelExamples = (channelNumber: number): Example[] => {
    const channelExamples: Example[] = [];

    examples.forEach(({ example }) => {
      example.forEach((ex) => {
        const text: string = ex.buttonText.toLowerCase();
        if (text.includes(`channel ${channelNumber}`)) {
          channelExamples.push(ex);
        }
      });
    });

    return channelExamples;
  };

  const getGlobalExamples = (): Example[] => {
    const globalExamples: Example[] = [];

    examples.forEach(({ example }) => {
      example.forEach((ex) => {
        const text: string = ex.buttonText.toLowerCase();
        if (text.includes('all channels') || text.includes('all sounds')) {
          globalExamples.push(ex);
        }
      });
    });

    return globalExamples;
  };

  const channel0Examples: Example[] = getChannelExamples(0);
  const channel1Examples: Example[] = getChannelExamples(1);
  const globalExamples: Example[] = hasGlobalControls ? getGlobalExamples() : [];

  return (
    <div className="channel-grouped-layout">
      <div className="channels-container">
        <ChannelSection
          channelNumber={0}
          channelQueueLength={queueLengths[0]}
          examples={channel0Examples}
          isChannelQueueEmpty={queueState[0]}
          pauseState={pauseState[0]}
          visualizerRef={visualizerRefs[0]}
        />
        <ChannelSection
          channelNumber={1}
          channelQueueLength={queueLengths[1]}
          examples={channel1Examples}
          isChannelQueueEmpty={queueState[1]}
          pauseState={pauseState[1]}
          visualizerRef={visualizerRefs[1]}
        />
      </div>
      {hasGlobalControls && globalExamples.length > 0 && (
        <GlobalControls examples={globalExamples} pauseState={pauseState} queueState={queueState} />
      )}
    </div>
  );
}

export default ChannelGroupedLayout;
