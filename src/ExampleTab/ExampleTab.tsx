import { ExampleTabs } from '../ExampleTabMenu/ExampleTabMenu';
import { Example } from '../types';
import './ExampleTab.css';
import { MutableRefObject } from 'react';
import { AudioQueueVisualizerHandle } from '../AudioQueueVisualizer/AudioQueueVisualizer';
import ChannelSection from '../ChannelSection/ChannelSection';
import GlobalControls from '../GlobalControls/GlobalControls';
import VolumeSlider from '../VolumeSlider/VolumeSlider';
import { setChannelVolume, setAllChannelsVolume } from 'audio-channel-queue';

function ExampleTab(props: {
  currentExampleTab: ExampleTabs;
  examples: Record<string, Example[]>;
  queueState: {
    [channelNumber: number]: boolean;
  };
  pauseState: {
    [channelNumber: number]: boolean;
  };
  visualizerRefs: MutableRefObject<AudioQueueVisualizerHandle | null>[];
}): JSX.Element {
  const { currentExampleTab, examples, queueState, pauseState, visualizerRefs } = props;

  const tabContent: Record<ExampleTabs, { description: string[] }> = {
    [ExampleTabs.BASIC_QUEUE]: {
      description: [
        'This example shows how to add and remove audio files from queues. Channel-specific controls let you manage each audio channel independently.',
        'Audio files will never overlap within their given channel. Use different channels when you want audio to play simultaneously.',
        'To test this functionality, click the "Add Sound" buttons to queue audio, then use the stop controls to manage playback.'
      ]
    },
    [ExampleTabs.PAUSE_RESUME]: {
      description: [
        'This example demonstrates the new pause and resume functionality for fine-grained audio control.',
        'You can pause individual channels or all channels at once, and resume them later without losing your place in the audio.',
        'Toggle pause provides a convenient way to pause/resume with a single button press.'
      ]
    },
    [ExampleTabs.VOLUME_CONTROL]: {
      description: [
        'Control the volume of individual channels or all channels simultaneously using the volume sliders below.',
        'This example uses looping audio files to demonstrate volume control - you can adjust levels while audio is playing.',
        'Start the looping audio, then use pause/resume controls and volume sliders to test different volume levels.',
        'Volume settings are persistent and affect all audio played on that channel.'
      ]
    },
    [ExampleTabs.ADVANCED_FEATURES]: {
      description: [
        'Advanced features include priority queueing and audio looping capabilities.',
        'Priority audio will jump to the front of the queue for urgent sounds.',
        'Looping audio will automatically restart when it finishes playing.',
        'Combine features for powerful audio management scenarios.'
      ]
    }
  };

  const currentContent: { description: string[] } = tabContent[currentExampleTab];
  const currentExamples: Example[] = examples[currentExampleTab] || [];

  // Organize examples by channel and global
  const organizeExamples = (): {
    channel0: Example[];
    channel1: Example[];
    global: Example[];
  } => {
    const channel0: Example[] = [];
    const channel1: Example[] = [];
    const global: Example[] = [];

    currentExamples.forEach((example) => {
      const text: string = example.buttonText.toLowerCase();

      if (text.includes('channel 0')) {
        channel0.push(example);
      } else if (text.includes('channel 1')) {
        channel1.push(example);
      } else if (text.includes('all channels') || text.includes('all sounds')) {
        global.push(example);
      }
    });

    return { channel0, channel1, global };
  };

  const { channel0, channel1, global }: { channel0: Example[]; channel1: Example[]; global: Example[] } = organizeExamples();

  const handleVolumeChange = (volume: number, channelNumber?: number): void => {
    if (channelNumber !== undefined) {
      setChannelVolume(channelNumber, volume);
    } else {
      setAllChannelsVolume(volume);
    }
  };

  const renderVolumeControls = (): JSX.Element | null => {
    if (currentExampleTab !== ExampleTabs.VOLUME_CONTROL) return null;

    return (
      <div className="volume-controls-section">
        <h3 className="section-title section-title-primary">Volume Controls</h3>
        <div className="volume-controls-grid">
          <div className="volume-control-item">
            <VolumeSlider channelNumber={0} initialVolume={1} onVolumeChange={handleVolumeChange} />
          </div>
          <div className="volume-control-item">
            <VolumeSlider channelNumber={1} initialVolume={1} onVolumeChange={handleVolumeChange} />
          </div>
          <div className="volume-control-item">
            <VolumeSlider initialVolume={1} isGlobal={true} onVolumeChange={handleVolumeChange} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="description-and-channel-example-container">
      <div className="description-container">
        {currentContent.description.map((description) => (
          <p key={description}>{description}</p>
        ))}
      </div>

      {renderVolumeControls()}

      <div className="channel-grouped-layout">
        {global.length > 0 && <GlobalControls examples={global} pauseState={pauseState} queueState={queueState} />}
        <div className="channels-container">
          <ChannelSection
            channelNumber={0}
            examples={channel0}
            isChannelQueueEmpty={queueState[0]}
            pauseState={pauseState[0]}
            visualizerRef={visualizerRefs[0]}
          />
          <ChannelSection
            channelNumber={1}
            examples={channel1}
            isChannelQueueEmpty={queueState[1]}
            pauseState={pauseState[1]}
            visualizerRef={visualizerRefs[1]}
          />
        </div>
      </div>
    </div>
  );
}

export default ExampleTab;
