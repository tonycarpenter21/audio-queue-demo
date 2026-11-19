import { FadeType } from 'audioq';
import { MutableRefObject } from 'react';
import { AudioQueueVisualizerHandle } from './AudioQueueVisualizer/AudioQueueVisualizer';

export enum ExampleTabs {
  ADVANCED_QUEUE_MANIPULATION = 'Advanced Queue Manipulation',
  AUDIO_DUCKING = 'Audio Ducking',
  AUDIO_INFO = 'Audio Info',
  NOTIFICATIONS = 'Notifications & Voice',
  OTHER_FEATURES = 'Other Features',
  PAUSE_RESUME = 'Pause & Resume',
  PLAYLIST = 'Playlist & Lock Screen',
  PRIORITY_SOUNDS = 'Priority Sounds',
  QUEUE_MANAGEMENT = 'Queue Management',
  SPRITES_CAPTIONS = 'Sprites & Captions',
  VOLUME_LOOPING = 'Volume & Looping'
}

export const ExampleTabRoutes: Record<ExampleTabs, string> = {
  [ExampleTabs.ADVANCED_QUEUE_MANIPULATION]: '/advanced-queue-manipulation',
  [ExampleTabs.AUDIO_DUCKING]: '/audio-ducking',
  [ExampleTabs.AUDIO_INFO]: '/audio-info',
  [ExampleTabs.NOTIFICATIONS]: '/notifications-and-voice',
  [ExampleTabs.OTHER_FEATURES]: '/other-features',
  [ExampleTabs.PAUSE_RESUME]: '/pause-resume',
  [ExampleTabs.PLAYLIST]: '/playlist',
  [ExampleTabs.PRIORITY_SOUNDS]: '/priority-sounds',
  [ExampleTabs.QUEUE_MANAGEMENT]: '/queue-management',
  [ExampleTabs.SPRITES_CAPTIONS]: '/sprites-and-captions',
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

export interface ExampleTabProps {
  currentExampleTab: ExampleTabs;
  examples: Record<string, Example[]>;
  visualizerRefs: MutableRefObject<AudioQueueVisualizerHandle | null>[];
  onFadeOptionChange?: (option: FadeOption) => void;
}
