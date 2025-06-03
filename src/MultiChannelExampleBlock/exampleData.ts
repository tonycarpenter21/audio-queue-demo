import { Example } from '../types';
import { ExampleTabs } from '../ExampleTabMenu/ExampleTabMenu';

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
  pauseChannel: (channelNumber?: number) => void,
  resumeChannel: (channelNumber?: number) => void,
  togglePauseChannel: (channelNumber?: number) => void,
  pauseAllChannels: () => void,
  resumeAllChannels: () => void,
  togglePauseAllChannels: () => void,
  queueAudioPriority: (url: string, channelNumber?: number, options?: Record<string, unknown>) => void,
  getRandomAudioFile: (files: string[]) => string,
  audioFilesChannelZero: string[],
  audioFilesChannelOne: string[]
): Record<string, Example[]> {
  return {
    [ExampleTabs.BASIC_QUEUE]: [
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
          pauseChannel();
        },
        buttonText: 'Pause Channel 0',
        buttonType: 'pause',
        codeExample: 'pauseChannel();',
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: (): void => {
          resumeChannel();
        },
        buttonText: 'Resume Channel 0',
        buttonType: 'resume',
        codeExample: 'resumeChannel();',
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: (): void => {
          togglePauseChannel();
        },
        buttonText: 'Toggle Pause Channel 0',
        buttonType: 'default',
        codeExample: 'togglePauseChannel();',
        isDisabledWhenQueueIsEmpty: true
      },
      // Channel 1 pause/resume
      {
        buttonFunction: (): void => {
          pauseChannel(1);
        },
        buttonText: 'Pause Channel 1',
        buttonType: 'pause',
        codeExample: 'pauseChannel(1);',
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: (): void => {
          resumeChannel(1);
        },
        buttonText: 'Resume Channel 1',
        buttonType: 'resume',
        codeExample: 'resumeChannel(1);',
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: (): void => {
          togglePauseChannel(1);
        },
        buttonText: 'Toggle Pause Channel 1',
        buttonType: 'default',
        codeExample: 'togglePauseChannel(1);',
        isDisabledWhenQueueIsEmpty: true
      },
      // Global pause/resume
      {
        buttonFunction: (): void => {
          pauseAllChannels();
        },
        buttonText: 'Pause All Channels',
        buttonType: 'pause',
        codeExample: 'pauseAllChannels();',
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: (): void => {
          resumeAllChannels();
        },
        buttonText: 'Resume All Channels',
        buttonType: 'resume',
        codeExample: 'resumeAllChannels();',
        isDisabledWhenQueueIsEmpty: true
      },
      {
        buttonFunction: togglePauseAllChannels,
        buttonText: 'Toggle All Channels',
        buttonType: 'default',
        codeExample: 'togglePauseAllChannels();',
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
        codeExample: 'queueAudio(audioFile, 0, { loop: true });',
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
        codeExample: 'queueAudio(audioFile, 1, { loop: true });',
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
    [ExampleTabs.ADVANCED_FEATURES]: [
      // Priority queueing
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
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesChannelOne);
          handleAudioAndVisualizer(fileName, 1, queueAudioPriority);
        },
        buttonText: 'Add Priority Sound (Channel 1)',
        buttonType: 'priority',
        codeExample: 'queueAudioPriority(audioFile, 1);',
        isDisabledWhenQueueIsEmpty: false
      },
      // Looping examples
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesChannelZero);
          handleAudioAndVisualizer(fileName, 0, (url: string, channel: number) => queueAudio(url, channel, { loop: true }), true);
        },
        buttonText: 'Add Looping Sound (Channel 0)',
        buttonType: 'default',
        codeExample: 'queueAudio(audioFile, 0, { loop: true });',
        isDisabledWhenQueueIsEmpty: false
      },
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesChannelOne);
          handleAudioAndVisualizer(fileName, 1, (url: string, channel: number) => queueAudio(url, channel, { loop: true }), true);
        },
        buttonText: 'Add Looping Sound (Channel 1)',
        buttonType: 'default',
        codeExample: 'queueAudio(audioFile, 1, { loop: true });',
        isDisabledWhenQueueIsEmpty: false
      },
      // Priority + Loop combination
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesChannelZero);
          handleAudioAndVisualizer(fileName, 0, (url: string, channel: number) => queueAudioPriority(url, channel, { loop: true }), true);
        },
        buttonText: 'Add Priority Looping Sound (Channel 0)',
        buttonType: 'priority',
        codeExample: 'queueAudioPriority(audioFile, 0, { loop: true });',
        isDisabledWhenQueueIsEmpty: false
      }
    ]
  };
}
