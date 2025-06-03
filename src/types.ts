export interface Example {
  buttonFunction: () => void;
  buttonText: string;
  buttonType?: 'default' | 'priority' | 'pause' | 'resume';
  codeExample: string;
  isDisabledWhenQueueIsEmpty?: boolean;
  isDisabledWhenChannelPlaying?: boolean;
}
