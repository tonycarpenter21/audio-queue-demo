import { QueueManipulationResult, QueueItem, setVolumeDucking, togglePauseChannel } from 'audioq';
import { Example, FadeOption } from '../types';
import { ExampleTabs } from '../types';

type HandleAudioAndVisualizer = (
  fileName: string,
  channelNumber: number,
  queueFunction: (url: string, channelNumber: number, options?: Record<string, unknown>) => void,
  isLooping?: boolean
) => void;

export function createExamples(
  handleAudioAndVisualizer: HandleAudioAndVisualizer,
  queueAudio: (url: string, channelNumber?: number, options?: Record<string, unknown>) => void,
  stopCurrentAudioInChannel: (channelNumber?: number) => void,
  stopAllAudioInChannel: (channelNumber?: number) => void,
  stopAllAudio: () => void,
  pauseChannelWithFade: (channelNumber?: number) => Promise<void>,
  resumeChannelWithFade: (channelNumber?: number) => Promise<void>,
  togglePauseChannelWithFade: (channelNumber?: number) => Promise<void>,
  pauseAllChannelsWithFade: () => Promise<void>,
  resumeAllChannelsWithFade: () => Promise<void>,
  togglePauseAllChannelsWithFade: () => Promise<void>,
  queueAudioPriority: (url: string, channelNumber?: number, options?: Record<string, unknown>) => void,
  getRandomAudioFile: (files: string[]) => string,
  audioFilesVocalExamples: string[],
  audioFilesSoundEffectExamples: string[],
  backgroundMusic: string,
  selectedFadeOption: FadeOption,
  clearQueueAfterCurrent: (channelNumber?: number) => Promise<QueueManipulationResult>,
  getQueueItemInfo: (queuedSlotNumber: number, channelNumber?: number) => QueueItem | null,
  getQueueLength: (channelNumber?: number) => number,
  isDuckingEnabled: boolean,
  setIsDuckingEnabled: (enabled: boolean) => void
): Record<string, Example[]> {
  // Helper function to get fade code example
  const getFadeCodeExample = (action: string, channel: string = ''): string => {
    if (selectedFadeOption === 'None') {
      // Use old functions without fade
      if (action.includes('pauseAllChannels')) {
        return `await pauseAllChannels();`;
      } else if (action.includes('resumeAllChannels')) {
        return `await resumeAllChannels();`;
      } else if (action.includes('togglePauseAllChannels')) {
        return `await togglePauseAllChannels();`;
      } else if (action.includes('pause')) {
        const channelParam = channel || '0';
        return `await pauseChannel(${channelParam});`;
      } else if (action.includes('resume')) {
        const channelParam = channel || '0';
        return `await resumeChannel(${channelParam});`;
      } else if (action.includes('toggle')) {
        const channelParam = channel || '0';
        return `await togglePauseChannel(${channelParam});`;
      } else {
        return `await ${action}${channel ? `(${channel})` : '()'}`;
      }
    } else {
      // Use fade functions with FadeType
      const fadeTypeString = `FadeType.${selectedFadeOption.charAt(0).toUpperCase() + selectedFadeOption.slice(1)}`;

      if (action.includes('pauseAllChannels')) {
        return `await pauseAllWithFade(
  ${fadeTypeString}
);`;
      } else if (action.includes('resumeAllChannels')) {
        return `await resumeAllWithFade();`;
      } else if (action.includes('togglePauseAllChannels')) {
        return `await togglePauseAllWithFade(
  ${fadeTypeString}
);`;
      } else if (action.includes('pause')) {
        const channelParam = channel || '0';
        return channel
          ? `await pauseWithFade(
  ${fadeTypeString}, ${channelParam}
);`
          : `await pauseWithFade(
  ${fadeTypeString}
);`;
      } else if (action.includes('resume')) {
        const channelParam = channel || '0';
        return channel
          ? `await resumeWithFade(
  ${fadeTypeString}, ${channelParam}
);`
          : `await resumeWithFade();`;
      } else if (action.includes('toggle')) {
        const channelParam = channel || '0';
        return channel
          ? `await togglePauseWithFade(
  ${fadeTypeString}, ${channelParam}
);`
          : `await togglePauseWithFade(
  ${fadeTypeString}
);`;
      } else {
        return `await ${action}${channel ? `(${channel})` : '()'}`;
      }
    }
  };

  return {
    [ExampleTabs.QUEUE_MANAGEMENT]: [
      // Channel 0 examples
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 0, queueAudio);
        },
        buttonText: 'Add Sound To End Of Queue (Channel 0)',
        buttonType: 'default',
        codeExample: 'await queueAudio(audioFile);',
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => stopCurrentAudioInChannel(),
        buttonText: 'Stop Current Sound (Channel 0)',
        buttonType: 'default',
        codeExample: 'await stopCurrentAudioInChannel();',
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: (): void => stopAllAudioInChannel(),
        buttonText: 'Stop All Sounds In Queue (Channel 0)',
        buttonType: 'default',
        codeExample: 'await stopAllAudioInChannel();',
        isDisabledWhenQueueIsEmpty: true
      },
      // Channel 1 examples
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesSoundEffectExamples);
          handleAudioAndVisualizer(fileName, 1, queueAudio);
        },
        buttonText: 'Add Sound To End Of Queue (Channel 1)',
        buttonType: 'default',
        codeExample: 'await queueAudio(audioFile, 1);',
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => stopCurrentAudioInChannel(1),
        buttonText: 'Stop Current Sound (Channel 1)',
        buttonType: 'default',
        codeExample: 'await stopCurrentAudioInChannel(1);',
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: (): void => stopAllAudioInChannel(1),
        buttonText: 'Stop All Sounds In Queue (Channel 1)',
        buttonType: 'default',
        codeExample: 'await stopAllAudioInChannel(1);',
        isDisabledWhenQueueIsEmpty: true
      },
      // Global example
      {
        buttonFunction: (): void => stopAllAudio(),
        buttonText: 'Stop All Sounds In All Channels',
        buttonType: 'default',
        codeExample: 'await stopAllAudio();',
        isDisabledWhenQueueIsEmpty: true
      }
    ],
    [ExampleTabs.PAUSE_RESUME]: [
      // First add some basic queue buttons so users can add sounds to test pause/resume
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 0, queueAudio);
        },
        buttonText: 'Add Sound To Queue (Channel 0)',
        buttonType: 'default',
        codeExample: 'await queueAudio(audioFile);',
        isDisabledWhenQueueIsEmpty: false
      },
      {
        // Use background music specifically for Pause & Resume Channel 1
        buttonFunction: (): void => {
          handleAudioAndVisualizer(backgroundMusic, 1, queueAudio);
        },
        buttonText: 'Add Sound To Queue (Channel 1)',
        buttonType: 'default',
        codeExample: 'await queueAudio(audioFile, 1);',
        isDisabledWhenQueueIsEmpty: false
      },
      // Channel 0 pause/resume
      {
        buttonFunction: (): void => {
          pauseChannelWithFade();
        },
        buttonText: 'Pause Channel 0',
        buttonType: 'pause',
        codeExample: getFadeCodeExample('pauseChannel'),
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: (): void => {
          resumeChannelWithFade();
        },
        buttonText: 'Resume Channel 0',
        buttonType: 'resume',
        codeExample: getFadeCodeExample('resumeChannel'),
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: (): void => {
          togglePauseChannelWithFade();
        },
        buttonText: 'Toggle Pause Channel 0',
        buttonType: 'default',
        codeExample: getFadeCodeExample('togglePauseChannel'),
        isDisabledWhenQueueIsEmpty: true
      },
      // Channel 1 pause/resume
      {
        buttonFunction: (): void => {
          pauseChannelWithFade(1);
        },
        buttonText: 'Pause Channel 1',
        buttonType: 'pause',
        codeExample: getFadeCodeExample('pauseChannel', '1'),
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: (): void => {
          resumeChannelWithFade(1);
        },
        buttonText: 'Resume Channel 1',
        buttonType: 'resume',
        codeExample: getFadeCodeExample('resumeChannel', '1'),
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: (): void => {
          togglePauseChannelWithFade(1);
        },
        buttonText: 'Toggle Pause Channel 1',
        buttonType: 'default',
        codeExample: getFadeCodeExample('togglePauseChannel', '1'),
        isDisabledWhenQueueIsEmpty: true
      },
      // Global pause/resume
      {
        buttonFunction: (): void => {
          pauseAllChannelsWithFade();
        },
        buttonText: 'Pause All Channels',
        buttonType: 'pause',
        codeExample: getFadeCodeExample('pauseAllChannels'),
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: (): void => {
          resumeAllChannelsWithFade();
        },
        buttonText: 'Resume All Channels',
        buttonType: 'resume',
        codeExample: getFadeCodeExample('resumeAllChannels'),
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: togglePauseAllChannelsWithFade,
        buttonText: 'Toggle All Channels',
        buttonType: 'default',
        codeExample: getFadeCodeExample('togglePauseAllChannels'),
        isDisabledWhenQueueIsEmpty: true
      }
    ],
    [ExampleTabs.VOLUME_LOOPING]: [
      // Add specific looping sounds for volume demonstration
      {
        buttonFunction: (): void => {
          // Use a specific long audio file for Channel 0 (teleportation sound)
          handleAudioAndVisualizer(
            audioFilesVocalExamples[2],
            0,
            (url: string, channel: number) => queueAudio(url, channel, { loop: true }),
            true
          ); // Pass isLooping = true
        },
        buttonText: 'Start Looping Audio (Channel 0)',
        buttonType: 'default',
        codeExample: `await queueAudio(audioFile, 0, {
  loop: true
});`,
        isDisabledWhenChannelPlaying: true,
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => stopAllAudioInChannel(),
        buttonText: 'Stop Channel 0',
        buttonType: 'default',
        codeExample: 'await stopAllAudioInChannel();',
        isDisabledWhenQueueIsEmpty: true
      },
      // Channel 1 looping audio
      {
        buttonFunction: (): void => {
          // Use background music for Channel 1 volume demonstration
          handleAudioAndVisualizer(backgroundMusic, 1, (url: string, channel: number) => queueAudio(url, channel, { loop: true }), true); // Pass isLooping = true
        },
        buttonText: 'Start Looping Audio (Channel 1)',
        buttonType: 'default',
        codeExample: `await queueAudio(audioFile, 1, {
  loop: true
});`,
        isDisabledWhenChannelPlaying: true,
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => stopAllAudioInChannel(1),
        buttonText: 'Stop Channel 1',
        buttonType: 'default',
        codeExample: 'await stopAllAudioInChannel(1);',
        isDisabledWhenQueueIsEmpty: true
      }
    ],
    [ExampleTabs.AUDIO_DUCKING]: [
      // Volume ducking toggle button
      {
        buttonFunction: (): void => {
          const newDuckingState: boolean = !isDuckingEnabled;
          setIsDuckingEnabled(newDuckingState);

          if (newDuckingState) {
            setVolumeDucking({
              duckingVolume: 0.25, // Background music reduced to 25%
              priorityChannel: 1, // Channel 1 (voice) has priority
              priorityVolume: 1.0 // Voice plays at full volume
            });
          } else {
            // Disable ducking by setting all volumes to 100%
            setVolumeDucking({
              duckingVolume: 1.0, // No ducking
              priorityChannel: 1,
              priorityVolume: 1.0
            });
          }
        },
        buttonText: `${isDuckingEnabled ? '🔇 Disable' : '🔊 Enable'} Volume Ducking (Channel 1 Currently ${isDuckingEnabled ? 'On' : 'Off'})`,
        buttonType: isDuckingEnabled ? 'resume' : 'priority',
        codeExample: isDuckingEnabled
          ? `// Currently ON - Disable ducking
setVolumeDucking({
  // No ducking
  duckingVolume: 1.0,
  priorityChannel: 1,     
  priorityVolume: 1.0     
});`
          : `// Currently OFF - Enable ducking  
setVolumeDucking({
  // Duck to 25%
  duckingVolume: 0.25,
  // Channel 1 priority
  priorityChannel: 1,
  // Voice at 100%
  priorityVolume: 1.0
});`,
        isDisabledWhenChannelPlaying: true,
        isDisabledWhenQueueIsEmpty: false
      },
      // Channel 0: Background music with looping and pause toggle
      {
        buttonFunction: (): void => {
          handleAudioAndVisualizer(backgroundMusic, 0, (url: string, channel: number) => queueAudio(url, channel, { loop: true }), true);
        },
        buttonText: 'Start Background Music (Channel 0)',
        buttonType: 'default',
        codeExample: `// Start background music -
// will auto-duck when channel 1 
// plays if ducking enabled
await queueAudio(backgroundMusic, 0, {
  loop: true
});`,
        isDisabledWhenChannelPlaying: true,
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => {
          togglePauseChannelWithFade();
        },
        buttonText: 'Toggle Music Pause (Channel 0)',
        buttonType: 'default',
        codeExample: getFadeCodeExample('togglePauseChannel'),
        isDisabledWhenQueueIsEmpty: true
      },
      // Channel 1: Voice/dialogue that automatically ducks the music (if enabled)
      {
        buttonFunction: (): void => {
          // Simply queue audio - ducking happens automatically if enabled!
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 1, queueAudio);
        },
        buttonText: 'Play Voice Audio (Channel 1)',
        buttonType: 'default',
        codeExample: `// Just queue voice audio normally -
// Background music will 
// automatically duck/restore
// if volume ducking is enabled
await queueAudio(voiceAudio, 1);

// You can queue multiple voices!
// Ducking stays active until 
// channel 1 is empty
await queueAudio(anotherVoice, 1);
await queueAudio(thirdVoice, 1);`,
        isDisabledWhenQueueIsEmpty: false
      }
    ],
    [ExampleTabs.PRIORITY_SOUNDS]: [
      // Channel 0 examples
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 0, queueAudio);
        },
        buttonText: 'Add Sound To End Of Queue (Channel 0)',
        buttonType: 'default',
        codeExample: 'await queueAudio(audioFile);',
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 0, queueAudioPriority);
        },
        buttonText: 'Add Priority Sound (Channel 0)',
        buttonType: 'priority',
        codeExample: 'await queueAudioPriority(audioFile);',
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 0, queueAudioPriority);
          stopCurrentAudioInChannel();
        },
        buttonText: 'Interrupt And Add Priority Sound (Channel 0)',
        buttonType: 'priority',
        codeExample: `await queueAudioPriority(audioFile);
await stopCurrentAudioInChannel();`,
        isDisabledWhenQueueIsEmpty: true
      },
      // Channel 1 examples
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesSoundEffectExamples);
          handleAudioAndVisualizer(fileName, 1, queueAudio);
        },
        buttonText: 'Add Sound To End Of Queue (Channel 1)',
        buttonType: 'default',
        codeExample: 'await queueAudio(audioFile, 1);',
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesSoundEffectExamples);
          handleAudioAndVisualizer(fileName, 1, queueAudioPriority);
        },
        buttonText: 'Add Priority Sound (Channel 1)',
        buttonType: 'priority',
        codeExample: 'await queueAudioPriority(audioFile, 1);',
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesSoundEffectExamples);
          handleAudioAndVisualizer(fileName, 1, queueAudioPriority);
          stopCurrentAudioInChannel(1);
        },
        buttonText: 'Interrupt And Add Priority Sound (Channel 1)',
        buttonType: 'priority',
        codeExample: `await queueAudioPriority(audioFile, 1);
await stopCurrentAudioInChannel(1);`,
        isDisabledWhenQueueIsEmpty: true
      }
    ],
    [ExampleTabs.AUDIO_INFO]: [
      // Channel 0 examples for audio info
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 0, queueAudio);
        },
        buttonText: 'Add Sound To Queue (Channel 0)',
        buttonType: 'default',
        codeExample: `// Add audio to channel 0
await queueAudio(audioFile, 0);

// Get current audio info
const info = getCurrentAudioInfo();
console.log('Current audio:', info);

// Get queue snapshot
const snapshot = getQueueSnapshot();
console.log('Queue:', snapshot);`,
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => {
          togglePauseChannel();
        },
        buttonText: 'Toggle Pause (Channel 0)',
        buttonType: 'default',
        codeExample: getFadeCodeExample('togglePauseChannel'),
        isDisabledWhenQueueIsEmpty: true
      },
      // Channel 1 examples for audio info
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesSoundEffectExamples);
          handleAudioAndVisualizer(fileName, 1, queueAudio);
        },
        buttonText: 'Add Sound To Queue (Channel 1)',
        buttonType: 'default',
        codeExample: `// Add audio to channel 1
await queueAudio(audioFile, 1);

// Get current audio info
const info = getCurrentAudioInfo(1);
console.log('Current audio:', info);

// Get queue snapshot
const snapshot = getQueueSnapshot(1);
console.log('Queue:', snapshot);
`,
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => {
          togglePauseChannel(1);
        },
        buttonText: 'Toggle Pause (Channel 1)',
        buttonType: 'default',
        codeExample: getFadeCodeExample('togglePauseChannel', '1'),
        isDisabledWhenQueueIsEmpty: true
      }
    ],
    [ExampleTabs.ADVANCED_QUEUE_MANIPULATION]: [
      // Channel 0: Basic queue setup for advanced manipulation
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 0, queueAudio);
        },
        buttonText: 'Add Sound To Queue (Channel 0)',
        buttonType: 'default',
        codeExample: `await queueAudio(audioFile);`,
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => {
          togglePauseChannelWithFade(0);
        },
        buttonText: 'Toggle Pause (Channel 0)',
        buttonType: 'default',
        codeExample: getFadeCodeExample('togglePauseChannel', '0'),
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: async (): Promise<void> => {
          const queueLength: number = getQueueLength(0);
          if (queueLength >= 2) {
            await clearQueueAfterCurrent(0);
          }
        },
        buttonText: 'Clear All After Current (Channel 0)',
        buttonType: 'default',
        codeExample: `await clearQueueAfterCurrent();`,
        isDisabledWhenQueueIsEmpty: true,
        minQueueLength: 2
      },
      // Channel 1: Similar setup for advanced manipulation
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesSoundEffectExamples);
          handleAudioAndVisualizer(fileName, 1, queueAudio);
        },
        buttonText: 'Add Sound To Queue (Channel 1)',
        buttonType: 'default',
        codeExample: `await queueAudio(soundEffect, 1);`,
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => {
          togglePauseChannelWithFade(1);
        },
        buttonText: 'Toggle Pause (Channel 1)',
        buttonType: 'default',
        codeExample: getFadeCodeExample('togglePauseChannel', '1'),
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: async (): Promise<void> => {
          const queueLength: number = getQueueLength(1);
          if (queueLength >= 2) {
            await clearQueueAfterCurrent(1);
          }
        },
        buttonText: 'Clear All After Current (Channel 1)',
        buttonType: 'default',
        codeExample: `await clearQueueAfterCurrent(1);`,
        isDisabledWhenQueueIsEmpty: true,
        minQueueLength: 2
      },
      // Utility examples
      {
        buttonFunction: (): void => {
          const length0: number = getQueueLength(0);
          const length1: number = getQueueLength(1);
          const item0: QueueItem | null = getQueueItemInfo(1, 0);
          const item1: QueueItem | null = getQueueItemInfo(1, 1);

          // eslint-disable-next-line no-console
          console.log(`Channel 0 queue length: ${length0}`);
          // eslint-disable-next-line no-console
          console.log(`Channel 1 queue length: ${length1}`);
          // eslint-disable-next-line no-console
          console.log('Channel 0 item at index 1:', item0);
          // eslint-disable-next-line no-console
          console.log('Channel 1 item at index 1:', item1);
        },
        buttonText: 'Show Queue Manipulation Result Interface',
        buttonType: 'default',
        codeExample: `// All queue manipulation functions return a QueueManipulationResult:
interface QueueManipulationResult {
  success: boolean;          // Whether the operation was successful
  error?: string;            // Error message if operation failed
  updatedQueue?: QueueSnapshot; // The queue snapshot after the operation (if successful)
}

// Example usage:
const result = await removeQueuedItem(1, 0);
if (result.success) {
  console.log('Success!', result.updatedQueue);
} else {
  console.log('Error:', result.error);
}`,
        isDisabledWhenQueueIsEmpty: false
      }
    ]
  };
}
