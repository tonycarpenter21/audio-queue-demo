import { FadeType } from 'audioq';
import { MutableRefObject } from 'react';
import { AudioQueueVisualizerHandle } from './AudioQueueVisualizer/AudioQueueVisualizer';

export enum ExampleTabs {
  ADVANCED_QUEUE_MANIPULATION = 'Advanced Queue Manipulation',
  AUDIO_DUCKING = 'Audio Ducking',
  AUDIO_INFO = 'Audio Info',
  NOTIFICATIONS = 'Notifications & Voice',
  OTHER_FEATURES = 'More Examples',
  PAUSE_RESUME = 'Pause & Resume',
  PLAYBACK = 'Playback & Lock Screen',
  PLAYLIST = 'Playlist',
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
  [ExampleTabs.PLAYBACK]: '/playback-and-lock-screen',
  [ExampleTabs.PLAYLIST]: '/playlist',
  [ExampleTabs.PRIORITY_SOUNDS]: '/priority-sounds',
  [ExampleTabs.QUEUE_MANAGEMENT]: '/queue-management',
  [ExampleTabs.SPRITES_CAPTIONS]: '/sprites-and-captions',
  [ExampleTabs.VOLUME_LOOPING]: '/volume-and-looping'
};

export type FadeOption = 'None' | FadeType;

/** Where an example's button is shown: a channel's column, or the global row. */
export type ExampleChannel = 0 | 1 | 'global';

/**
 * When an example's button is enabled. For the global row, "the channel" means any channel.
 * - always: never disabled
 * - hasAudio: the channel has audio queued
 * - idle: the channel has nothing queued (start buttons that must not stack)
 * - playing: the channel has audio and is not paused (pause buttons)
 * - paused: the channel is paused (resume buttons)
 */
export type ExampleEnabledWhen = 'always' | 'hasAudio' | 'idle' | 'playing' | 'paused';

export interface Example {
  buttonFunction: () => void | Promise<void>;
  buttonText: string;
  buttonType?: 'default' | 'priority' | 'pause' | 'resume';
  channel: ExampleChannel;
  codeExample: string;
  enabledWhen: ExampleEnabledWhen;
  /** Also requires at least this many items in the channel's queue. */
  minQueueLength?: number;
}

export interface ExampleTabProps {
  currentExampleTab: ExampleTabs;
  examples: Record<string, Example[]>;
  visualizerRefs: MutableRefObject<AudioQueueVisualizerHandle | null>[];
  onFadeOptionChange?: (option: FadeOption) => void;
}
