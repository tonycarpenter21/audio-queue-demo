import { FadeType } from 'audio-channel-queue';

export enum ExampleTabs {
  ADVANCED_QUEUE_MANIPULATION = 'Advanced Queue Manipulation',
  AUDIO_DUCKING = 'Audio Ducking',
  AUDIO_INFO = 'Audio Info',
  OTHER_FEATURES = 'Other Features',
  PAUSE_RESUME = 'Pause & Resume',
  PRIORITY_SOUNDS = 'Priority Sounds',
  QUEUE_MANAGEMENT = 'Queue Management',
  VOLUME_LOOPING = 'Volume & Looping'
}

export const ExampleTabRoutes: Record<ExampleTabs, string> = {
  [ExampleTabs.ADVANCED_QUEUE_MANIPULATION]: '/advanced-queue-manipulation',
  [ExampleTabs.AUDIO_DUCKING]: '/audio-ducking',
  [ExampleTabs.AUDIO_INFO]: '/audio-info',
  [ExampleTabs.OTHER_FEATURES]: '/other-features',
  [ExampleTabs.PAUSE_RESUME]: '/pause-resume',
  [ExampleTabs.PRIORITY_SOUNDS]: '/priority-sounds',
  [ExampleTabs.QUEUE_MANAGEMENT]: '/queue-management',
  [ExampleTabs.VOLUME_LOOPING]: '/volume-and-looping'
};

export type FadeOption = 'None' | FadeType;

export interface Example {
  buttonFunction: () => void;
  buttonText: string;
  buttonType?: 'default' | 'priority' | 'pause' | 'resume';
  codeExample: string;
  isDisabledWhenQueueIsEmpty?: boolean;
  isDisabledWhenChannelPlaying?: boolean;
  minQueueLength?: number;
}
