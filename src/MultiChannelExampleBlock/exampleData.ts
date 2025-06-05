import { Example } from '../types';
import { ExampleTabs } from '../types';

export type FadeOption = 'none' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

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
  audioFilesChannelZero: string[],
  audioFilesChannelOne: string[],
  selectedFadeOption: FadeOption
): Record<string, Example[]> {
  // Helper function to get fade code example
  const getFadeCodeExample = (action: string, channel: string = ''): string => {
    if (selectedFadeOption === 'none') {
      return `${action}${channel ? `(${channel})` : '()'}`;
    }

    const channelParam = channel || '0';

    if (action.includes('pause')) {
      return `// First fade volume to 0
await setChannelVolume(
  ${channelParam}, 0, 800, '${selectedFadeOption}'
);
// Then pause the audio
await ${action}${channel ? `(${channel})` : '()'}`;
    } else if (action.includes('resume')) {
      return `// First resume at 0 volume
await setChannelVolume(${channelParam}, 0);
await ${action}${channel ? `(${channel})` : '()'};
// Then fade volume to 1.0
await setChannelVolume(
  ${channelParam}, 1.0, 800, '${selectedFadeOption}'
)`;
    } else {
      // For toggle functions
      return `// Smart toggle with fade
if (isChannelPaused(${channelParam})) {
  await setChannelVolume(${channelParam}, 0);
  await ${action}${channel ? `(${channel})` : '()'};
  await setChannelVolume(
    ${channelParam}, 1.0, 800, '${selectedFadeOption}'
  );
} else {
  await setChannelVolume(
    ${channelParam}, 0, 800, '${selectedFadeOption}'
  );
  await ${action}${channel ? `(${channel})` : '()'};
}`;
    }
  };

  return {
    [ExampleTabs.QUEUE_MANAGEMENT]: [
      // Channel 0 examples
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesChannelZero);
          handleAudioAndVisualizer(fileName, 0, queueAudio);
        },
        buttonText: 'Add Sound To End Of Queue (Channel 0)',
        buttonType: 'default',
        codeExample: 'queueAudio(audioFile);',
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesChannelZero);
          handleAudioAndVisualizer(fileName, 0, queueAudioPriority);
        },
        buttonText: 'Add Priority Sound (Channel 0)',
        buttonType: 'priority',
        codeExample: 'queueAudioPriority(audioFile);',
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
          const fileName: string = getRandomAudioFile(audioFilesChannelOne);
          handleAudioAndVisualizer(fileName, 1, queueAudio);
        },
        buttonText: 'Add Sound To End Of Queue (Channel 1)',
        buttonType: 'default',
        codeExample: 'queueAudio(audioFile, 1);',
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesChannelOne);
          handleAudioAndVisualizer(fileName, 1, queueAudioPriority);
        },
        buttonText: 'Add Priority Sound (Channel 1)',
        buttonType: 'priority',
        codeExample: 'queueAudioPriority(audioFile, 1);',
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
          const fileName: string = getRandomAudioFile(audioFilesChannelZero);
          handleAudioAndVisualizer(fileName, 0, queueAudio);
        },
        buttonText: 'Add Sound To Queue (Channel 0)',
        buttonType: 'default',
        codeExample: 'queueAudio(audioFile);',
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesChannelOne);
          handleAudioAndVisualizer(fileName, 1, queueAudio);
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
    [ExampleTabs.VOLUME_CONTROL]: [
      // Add specific looping sounds for volume demonstration
      {
        buttonFunction: (): void => {
          // Use a specific long audio file for Channel 0 (teleportation sound)
          handleAudioAndVisualizer(
            audioFilesChannelZero[2],
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
          // Use a specific long audio file for Channel 1 (long teleportation)
          handleAudioAndVisualizer(
            audioFilesChannelOne[2],
            1,
            (url: string, channel: number) => queueAudio(url, channel, { loop: true }),
            true
          ); // Pass isLooping = true
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
    ]
  };
}
