export enum ExampleTabs {
  ADVANCED_FEATURES = 'Advanced Features',
  PAUSE_RESUME = 'Pause & Resume',
  PRIORITY_SOUNDS = 'Priority Sounds',
  QUEUE_MANAGEMENT = 'Queue Management',
  VOLUME_CONTROL = 'Volume Control'
}

export interface Example {
  buttonFunction: () => void;
  buttonText: string;
  buttonType?: 'default' | 'priority' | 'pause' | 'resume';
  codeExample: string;
  isDisabledWhenQueueIsEmpty?: boolean;
  isDisabledWhenChannelPlaying?: boolean;
}
