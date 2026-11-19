import { Example, ExampleEnabledWhen } from '../types';

export interface OrganizedExamples {
  channel0: Example[];
  channel1: Example[];
  global: Example[];
}

/** Splits a tab's examples into the channel columns and the global row, by their `channel`. */
export function organizeExamplesByChannel(examples: Example[]): OrganizedExamples {
  return {
    channel0: examples.filter((example) => example.channel === 0),
    channel1: examples.filter((example) => example.channel === 1),
    global: examples.filter((example) => example.channel === 'global')
  };
}

/** The state an example's enabled check reads: for one channel, or summed over every channel. */
export interface ChannelActivity {
  /** Audio is queued. */
  hasAudio: boolean;
  /** Audio is queued and not paused. */
  isPlaying: boolean;
  /** Paused. */
  isPaused: boolean;
  /** Items queued. */
  queueLength: number;
}

const RULES: Record<ExampleEnabledWhen, (activity: ChannelActivity) => boolean> = {
  always: () => true,
  hasAudio: (activity) => activity.hasAudio,
  idle: (activity) => !activity.hasAudio,
  paused: (activity) => activity.isPaused,
  playing: (activity) => activity.isPlaying
};

/** Whether an example's button is enabled. */
export function isExampleEnabled(example: Example, activity: ChannelActivity): boolean {
  return RULES[example.enabledWhen](activity) && activity.queueLength >= (example.minQueueLength ?? 0);
}

/** Activity of one channel from the app state. */
export function channelActivity(isQueueEmpty: boolean, isPaused: boolean, queueLength: number): ChannelActivity {
  return { hasAudio: !isQueueEmpty, isPaused, isPlaying: !isQueueEmpty && !isPaused, queueLength };
}

/** Activity of the global row: true when it is true for any channel. */
export function anyChannelActivity(channels: ChannelActivity[]): ChannelActivity {
  return {
    hasAudio: channels.some((channel) => channel.hasAudio),
    isPaused: channels.some((channel) => channel.isPaused),
    isPlaying: channels.some((channel) => channel.isPlaying),
    queueLength: Math.max(0, ...channels.map((channel) => channel.queueLength))
  };
}
