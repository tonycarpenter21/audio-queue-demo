import { QueueSnapshot, transitionVolume, EasingType } from 'audio-channel-queue';
import { Example, FadeOption } from '../types';
import { ExampleTabs } from '../types';

// Track current volume levels for each channel
const volumeTracker = new Map<number, number>();

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
  onAudioComplete: (channelNumber: number, callback: (info: { remainingInQueue: number }) => void) => void,
  getQueueSnapshot: (channelNumber: number) => QueueSnapshot | null,
  getRandomAudioFile: (files: string[]) => string,
  audioFilesVocalExamples: string[],
  audioFilesSoundEffectExamples: string[],
  backgroundMusic: string,
  selectedFadeOption: FadeOption
): Record<string, Example[]> {
  // Helper function to get fade code example
  const getFadeCodeExample = (action: string, channel: string = ''): string => {
    if (selectedFadeOption === 'None') {
      // Use old functions without fade
      if (action.includes('pauseAllChannels')) {
        return `pauseAllChannels();`;
      } else if (action.includes('resumeAllChannels')) {
        return `resumeAllChannels();`;
      } else if (action.includes('togglePauseAllChannels')) {
        return `togglePauseAllChannels();`;
      } else if (action.includes('pause')) {
        const channelParam = channel || '0';
        return `pauseChannel(${channelParam});`;
      } else if (action.includes('resume')) {
        const channelParam = channel || '0';
        return `resumeChannel(${channelParam});`;
      } else if (action.includes('toggle')) {
        const channelParam = channel || '0';
        return `togglePauseChannel(${channelParam});`;
      } else {
        return `${action}${channel ? `(${channel})` : '()'}`;
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
        return channel ? `await pauseWithFade(${fadeTypeString}, ${channelParam});` : `await pauseWithFade(${fadeTypeString});`;
      } else if (action.includes('resume')) {
        const channelParam = channel || '0';
        return channel ? `await resumeWithFade(${fadeTypeString}, ${channelParam});` : `await resumeWithFade();`;
      } else if (action.includes('toggle')) {
        const channelParam = channel || '0';
        return channel
          ? `await togglePauseWithFade(
  ${fadeTypeString}, 
  ${channelParam}
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
        codeExample: 'queueAudio(audioFile);',
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => stopCurrentAudioInChannel(),
        buttonText: 'Stop Current Sound (Channel 0)',
        buttonType: 'default',
        codeExample: 'stopCurrentAudioInChannel();',
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: (): void => stopAllAudioInChannel(),
        buttonText: 'Stop All Sounds In Queue (Channel 0)',
        buttonType: 'default',
        codeExample: 'stopAllAudioInChannel();',
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
        codeExample: 'queueAudio(audioFile, 1);',
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => stopCurrentAudioInChannel(1),
        buttonText: 'Stop Current Sound (Channel 1)',
        buttonType: 'default',
        codeExample: 'stopCurrentAudioInChannel(1);',
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: (): void => stopAllAudioInChannel(1),
        buttonText: 'Stop All Sounds In Queue (Channel 1)',
        buttonType: 'default',
        codeExample: 'stopAllAudioInChannel(1);',
        isDisabledWhenQueueIsEmpty: true
      },
      // Global example
      {
        buttonFunction: (): void => stopAllAudio(),
        buttonText: 'Stop All Sounds In All Channels',
        buttonType: 'default',
        codeExample: 'stopAllAudio();',
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
        codeExample: 'queueAudio(audioFile);',
        isDisabledWhenQueueIsEmpty: false
      },
      {
        // Use background music specifically for Pause & Resume Channel 1
        buttonFunction: (): void => {
          handleAudioAndVisualizer(backgroundMusic, 1, queueAudio);
        },
        buttonText: 'Add Sound To Queue (Channel 1)',
        buttonType: 'default',
        codeExample: 'queueAudio(audioFile, 1);',
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
        codeExample: `queueAudio(audioFile, 0, {
  loop: true
});`,
        isDisabledWhenChannelPlaying: true,
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => stopAllAudioInChannel(),
        buttonText: 'Stop Channel 0',
        buttonType: 'default',
        codeExample: 'stopAllAudioInChannel();',
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
        codeExample: `queueAudio(audioFile, 1, {
  loop: true
});`,
        isDisabledWhenChannelPlaying: true,
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => stopAllAudioInChannel(1),
        buttonText: 'Stop Channel 1',
        buttonType: 'default',
        codeExample: 'stopAllAudioInChannel(1);',
        isDisabledWhenQueueIsEmpty: true
      }
    ],
    [ExampleTabs.AUDIO_DUCKING]: [
      // Channel 0: Background music with looping and pause toggle
      {
        buttonFunction: (): void => {
          handleAudioAndVisualizer(backgroundMusic, 0, (url: string, channel: number) => queueAudio(url, channel, { loop: true }), true);
        },
        buttonText: 'Start Background Music (Channel 0)',
        buttonType: 'default',
        codeExample: `queueAudio(backgroundMusic, 0, {
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
      // Channel 1: Voice/dialogue that ducks the music
      {
        buttonFunction: async (): Promise<void> => {
          // Initialize volume tracker for channel 0 if not set
          if (!volumeTracker.has(0)) {
            volumeTracker.set(0, 1.0);
          }

          // Check if channel 1 already has audio queued (indicating ducking may already be active)
          const channel1Queue = getQueueSnapshot(1);
          const shouldDuck = !channel1Queue || channel1Queue.totalItems === 0;

          // Duck background music if channel 1 is currently empty
          if (shouldDuck) {
            await transitionVolume(0, 0.25, 300, EasingType.EaseOut);
          }

          // Play voice/dialogue audio
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 1, queueAudio);

          // Set up one-time listener to restore volume when ALL queued audio completes
          const restoreVolumeHandler = (info: { remainingInQueue: number }): void => {
            if (info.remainingInQueue === 0) {
              // All audio in channel 1 has completed, restore background music
              transitionVolume(0, 1.0, 500, EasingType.EaseInOut);
            }
          };

          onAudioComplete(1, restoreVolumeHandler);
        },
        buttonText: 'Play Voice Audio With Smooth Ducking (Channel 1)',
        buttonType: 'default',
        codeExample: `// Check if channel 1 is empty
const queue = getQueueSnapshot(1);
const isAlreadyDucked = 
  queue && queue.totalItems > 0;

// Duck background music 
// if not already ducked
if (!isAlreadyDucked) {
  await transitionVolume(
    0, 0.25, 300, EasingType.EaseOut
  );
}

// Play voice audio 
// (can queue multiple)
queueAudio(voiceAudio, 1);

// Restore when ALL 
// queued audio completes
onAudioComplete(1, (info) => {
  if (info.remainingInQueue === 0) {
    await transitionVolume(
      0, 1.0, 500, EasingType.EaseInOut
    );
  }
});`,
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
        codeExample: 'queueAudio(audioFile);',
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 0, queueAudioPriority);
        },
        buttonText: 'Add Priority Sound (Channel 0)',
        buttonType: 'priority',
        codeExample: 'queueAudioPriority(audioFile);',
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
        codeExample: `queueAudioPriority(audioFile);
stopCurrentAudioInChannel();`,
        isDisabledWhenQueueIsEmpty: false
      },
      // Channel 1 examples
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesSoundEffectExamples);
          handleAudioAndVisualizer(fileName, 1, queueAudio);
        },
        buttonText: 'Add Sound To End Of Queue (Channel 1)',
        buttonType: 'default',
        codeExample: 'queueAudio(audioFile, 1);',
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesSoundEffectExamples);
          handleAudioAndVisualizer(fileName, 1, queueAudioPriority);
        },
        buttonText: 'Add Priority Sound (Channel 1)',
        buttonType: 'priority',
        codeExample: 'queueAudioPriority(audioFile, 1);',
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
        codeExample: `queueAudioPriority(audioFile, 1);
stopCurrentAudioInChannel(1);`,
        isDisabledWhenQueueIsEmpty: false
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
queueAudio(audioFile, 0);

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
          togglePauseChannelWithFade();
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
queueAudio(audioFile, 1);

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
          togglePauseChannelWithFade(1);
        },
        buttonText: 'Toggle Pause (Channel 1)',
        buttonType: 'default',
        codeExample: getFadeCodeExample('togglePauseChannel', '1'),
        isDisabledWhenQueueIsEmpty: true
      }
    ]
  };
}
