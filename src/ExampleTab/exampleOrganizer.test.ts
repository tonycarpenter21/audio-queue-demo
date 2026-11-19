import { createExamples } from '../MultiChannelExampleBlock/exampleData';
import { createV3Examples } from '../MultiChannelExampleBlock/v3Examples';
import { Example, ExampleEnabledWhen, ExampleTabs } from '../types';
import { anyChannelActivity, channelActivity, isExampleEnabled, organizeExamplesByChannel } from './exampleOrganizer';

const noop = (): void => undefined;
const asyncNoop = (): Promise<void> => Promise.resolve();

/** Every example the app renders, by tab. */
const allExamples = (): Record<string, Example[]> => {
  const settings = { crossfadeMs: 0, gapMs: 0, pauseWhenHidden: false, rate: 1, repeat: 'off' as const };
  const actions = {
    cycleRate: noop,
    cycleRepeat: noop,
    reset: noop,
    toggleCrossfade: noop,
    toggleGap: noop,
    togglePauseWhenHidden: noop
  };
  return {
    ...createV3Examples(settings, actions),
    ...createExamples(
      noop,
      asyncNoop,
      asyncNoop,
      asyncNoop,
      asyncNoop,
      asyncNoop,
      asyncNoop,
      asyncNoop,
      asyncNoop,
      asyncNoop,
      asyncNoop,
      asyncNoop,
      () => 'a.mp3',
      ['a.mp3'],
      ['b.mp3'],
      'music.mp3',
      'None',
      () => Promise.resolve({ success: true }),
      () => null,
      () => 0,
      false,
      noop
    )
  };
};

const example = (enabledWhen: ExampleEnabledWhen, minQueueLength?: number): Example => ({
  buttonFunction: noop,
  buttonText: 'x',
  channel: 0,
  codeExample: '',
  enabledWhen,
  ...(minQueueLength === undefined ? {} : { minQueueLength })
});

describe('organizeExamplesByChannel', () => {
  test.each(Object.entries(allExamples()))('%s: every example is shown exactly once', (_tab, examples) => {
    const { channel0, channel1, global } = organizeExamplesByChannel(examples);
    expect(channel0.length + channel1.length + global.length).toBe(examples.length);
  });

  test.each(Object.entries(allExamples()))('%s: button labels are unique within a section (they are React keys)', (_tab, examples) => {
    const { channel0, channel1, global } = organizeExamplesByChannel(examples);
    for (const section of [channel0, channel1, global]) {
      const labels = section.map((item) => item.buttonText);
      expect(new Set(labels).size).toBe(labels.length);
    }
  });

  test('every tab except the dropdown has examples', () => {
    const examples = allExamples();
    Object.values(ExampleTabs)
      .filter((tab) => tab !== ExampleTabs.OTHER_FEATURES)
      .forEach((tab) => expect(examples[tab]?.length ?? 0).toBeGreaterThan(0));
  });
});

describe('isExampleEnabled', () => {
  const empty = channelActivity(true, false, 0);
  const playing = channelActivity(false, false, 2);
  const paused = channelActivity(false, true, 2);

  test.each<[ExampleEnabledWhen, boolean, boolean, boolean]>([
    ['always', true, true, true],
    ['hasAudio', false, true, true],
    ['idle', true, false, false],
    ['playing', false, true, false],
    ['paused', false, false, true]
  ])('%s: empty %p, playing %p, paused %p', (enabledWhen, whenEmpty, whenPlaying, whenPaused) => {
    expect(isExampleEnabled(example(enabledWhen), empty)).toBe(whenEmpty);
    expect(isExampleEnabled(example(enabledWhen), playing)).toBe(whenPlaying);
    expect(isExampleEnabled(example(enabledWhen), paused)).toBe(whenPaused);
  });

  test('minQueueLength also applies', () => {
    expect(isExampleEnabled(example('hasAudio', 3), playing)).toBe(false);
    expect(isExampleEnabled(example('hasAudio', 2), playing)).toBe(true);
  });

  test('the global row is enabled when any channel qualifies', () => {
    const activity = anyChannelActivity([empty, paused]);
    expect(isExampleEnabled(example('paused'), activity)).toBe(true);
    expect(isExampleEnabled(example('playing'), activity)).toBe(false);
    expect(isExampleEnabled(example('hasAudio'), activity)).toBe(true);
    expect(isExampleEnabled(example('idle'), anyChannelActivity([empty, empty]))).toBe(true);
  });
});
