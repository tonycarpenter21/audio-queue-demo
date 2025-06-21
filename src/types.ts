import { FadeType } from 'audio-channel-queue';

export enum ExampleTabs {
  OTHER_FEATURES = 'Other Features',
  PAUSE_RESUME = 'Pause & Resume',
  PRIORITY_SOUNDS = 'Priority Sounds',
  QUEUE_MANAGEMENT = 'Queue Management',
  VOLUME_CONTROL = 'Volume Control'
}

export const ExampleTabRoutes: Record<ExampleTabs, string> = {
  [ExampleTabs.OTHER_FEATURES]: '/other-features',
  [ExampleTabs.PAUSE_RESUME]: '/pause-resume',
  [ExampleTabs.PRIORITY_SOUNDS]: '/priority-sounds',
  [ExampleTabs.QUEUE_MANAGEMENT]: '/queue-management',
  [ExampleTabs.VOLUME_CONTROL]: '/volume-control'
};

export type FadeOption = 'None' | FadeType;

export interface Example {
  buttonFunction: () => void;
  buttonText: string;
  buttonType?: 'default' | 'priority' | 'pause' | 'resume';
  codeExample: string;
  isDisabledWhenQueueIsEmpty?: boolean;
  isDisabledWhenChannelPlaying?: boolean;
}
