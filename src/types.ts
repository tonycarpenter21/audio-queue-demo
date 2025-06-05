export enum ExampleTabs {
  DOCUMENTATION = 'Documentation',
  PAUSE_RESUME = 'Pause & Resume',
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
