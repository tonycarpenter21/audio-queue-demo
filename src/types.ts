export enum ExampleTabs {
  ADVANCED_FEATURES = 'Advanced Features',
  PAUSE_RESUME = 'Pause & Resume',
  PRIORITY_SOUNDS = 'Priority Sounds',
  QUEUE_MANAGEMENT = 'Queue Management',
  VOLUME_CONTROL = 'Volume Control'
}

export const ExampleTabRoutes: Record<ExampleTabs, string> = {
  [ExampleTabs.ADVANCED_FEATURES]: '/advanced-features',
  [ExampleTabs.PAUSE_RESUME]: '/pause-resume',
  [ExampleTabs.PRIORITY_SOUNDS]: '/priority-sounds',
  [ExampleTabs.QUEUE_MANAGEMENT]: '/queue-management',
  [ExampleTabs.VOLUME_CONTROL]: '/volume-control'
};

export interface Example {
  buttonFunction: () => void;
  buttonText: string;
  buttonType?: 'default' | 'priority' | 'pause' | 'resume';
  codeExample: string;
  isDisabledWhenQueueIsEmpty?: boolean;
  isDisabledWhenChannelPlaying?: boolean;
}
