import { ExampleTabs } from '../types';
import { Example, FadeOption } from '../types';
import './ExampleTab.css';
import { MutableRefObject } from 'react';
import { AudioQueueVisualizerHandle } from '../AudioQueueVisualizer/AudioQueueVisualizer';
import ChannelSection from '../ChannelSection/ChannelSection';
import GlobalControls from '../GlobalControls/GlobalControls';
import VolumeSlider from '../VolumeSlider/VolumeSlider';
import { setChannelVolume, setAllChannelsVolume } from 'audio-channel-queue';
import { useState } from 'react';
import { FadeType } from 'audio-channel-queue';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FadeControlsProps {
  selectedFadeOption: FadeOption;
  onFadeOptionChange: (option: FadeOption) => void;
}

function FadeControls({ selectedFadeOption, onFadeOptionChange }: FadeControlsProps): JSX.Element {
  const fadeOptions: {
    value: FadeOption;
    label: string;
    description: string;
  }[] = [
    {
      description: 'Instant pause/resume (original behavior)',
      label: 'No Fade',
      value: 'None'
    },
    {
      description: 'Constant rate fade (mechanical)',
      label: 'Linear',
      value: FadeType.Linear
    },
    {
      description: 'Smooth, natural fade (recommended)',
      label: 'Gentle',
      value: FadeType.Gentle
    },
    {
      description: 'Quick, impactful fade (intense)',
      label: 'Dramatic',
      value: FadeType.Dramatic
    }
  ];

  return (
    <div className="fade-controls">
      <h3 className="fade-controls-title">🎵 Audio Fade Options</h3>
      <p className="fade-controls-description">
        Choose how audio fades when pausing/resuming. The code examples below will update automatically.
      </p>
      <div className="fade-options-buttons">
        {fadeOptions.map((option) => (
          <button
            className={`fade-option-button ${selectedFadeOption === option.value ? 'active' : ''}`}
            key={option.value}
            onClick={() => onFadeOptionChange(option.value)}
          >
            <div className="fade-option-label">{option.label}</div>
            <div className="fade-option-description">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

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
  selectedFadeOption?: FadeOption;
  onFadeOptionChange?: (option: FadeOption) => void;
}): JSX.Element {
  const { currentExampleTab, examples, queueState, pauseState, visualizerRefs, selectedFadeOption, onFadeOptionChange } = props;

  // Track volume states for dynamic code examples
  const [volumeStates, setVolumeStates] = useState({
    channel0: 100,
    channel1: 100,
    master: 100
  });

  const tabContent: Record<ExampleTabs, { description: string[] }> = {
    [ExampleTabs.QUEUE_MANAGEMENT]: {
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
    [ExampleTabs.OTHER_FEATURES]: {
      description: [] // No description for this tab
    },
    // All advanced features are grouped together here
    [ExampleTabs.PRIORITY_SOUNDS]: {
      description: [
        'This example demonstrates how to add priority sounds to the audio queue.',
        'Priority sounds will queue after the currently playing sound.',
        'To test this functionality, click the "Add Priority Sound" button to add a priority sound to the queue.'
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
      // Update volume state for code examples
      setVolumeStates((prev) => ({
        ...prev,
        [`channel${channelNumber}`]: Math.round(volume * 100)
      }));
    } else {
      setAllChannelsVolume(volume);
      // Update master volume state for code examples
      setVolumeStates((prev) => ({
        ...prev,
        master: Math.round(volume * 100)
      }));
    }
  };

  const renderVolumeControls = (): JSX.Element | null => {
    if (currentExampleTab !== ExampleTabs.VOLUME_CONTROL) return null;

    return (
      <div className="volume-controls-section">
        <h3 className="section-title section-title-primary">Volume Controls</h3>
        <div className="volume-controls-container">
          <div className="volume-control-item">
            <VolumeSlider channelNumber={0} initialVolume={1} onVolumeChange={handleVolumeChange} />
            <SyntaxHighlighter
              customStyle={{
                borderRadius: '10px',
                padding: '10px 20px'
              }}
              language="typescript"
              style={vscDarkPlus}
            >
              {`setChannelVolume(0, ${volumeStates.channel0 / 100});`}
            </SyntaxHighlighter>
          </div>

          <div className="volume-controls-divider" />

          <div className="volume-control-item">
            <VolumeSlider channelNumber={1} initialVolume={1} onVolumeChange={handleVolumeChange} />
            <SyntaxHighlighter
              customStyle={{
                borderRadius: '10px',
                padding: '10px 20px'
              }}
              language="typescript"
              style={vscDarkPlus}
            >
              {`setChannelVolume(1, ${volumeStates.channel1 / 100});`}
            </SyntaxHighlighter>
          </div>

          <div className="volume-controls-divider" />

          <div className="volume-control-item">
            <VolumeSlider initialVolume={1} isGlobal={true} onVolumeChange={handleVolumeChange} />
            <SyntaxHighlighter
              customStyle={{
                borderRadius: '10px',
                padding: '10px 20px'
              }}
              language="typescript"
              style={vscDarkPlus}
            >
              {`setAllChannelsVolume(${volumeStates.master / 100});`}
            </SyntaxHighlighter>
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

      {currentExampleTab === ExampleTabs.PAUSE_RESUME && (
        <FadeControls onFadeOptionChange={onFadeOptionChange || ((): void => {})} selectedFadeOption={selectedFadeOption || 'None'} />
      )}

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
