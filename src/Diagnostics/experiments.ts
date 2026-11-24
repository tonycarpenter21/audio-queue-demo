/**
 * Experiments for diagnosing audio on real devices (iOS especially). Each one is started by a tap,
 * because that tap is part of what is tested: iOS lets an audio element start playing only during
 * a tap or after it has been unlocked, and these runs compare ways of keeping a queue going after
 * the first sound. Everything is measured, not judged by ear: play() results, events, and the
 * playback position against wall-clock time.
 */
import type { QueueConfig } from 'audioq';
import { createAudioQueue, destroyAllChannels, getCurrentAudioInfo, onAudioComplete, queueAudio } from 'audioq/queue';
import { createBeep } from '../audio/beep';

/** What happened to one clip of a sequence. Times are milliseconds since the experiment began. */
export interface ClipRecord {
  clip: string;
  created: number;
  ended?: number;
  error?: string;
  /** How an audioq item finished ('ended', 'error', ...). */
  outcome?: string;
  /** How far it played (ms): 0 for a clip that started but never moved. */
  playedToMs?: number;
  playCalled?: number;
  playing?: number;
  playResult?: string;
}

/** One position sample: the element's position against the time since play() was called. */
export interface PositionSample {
  currentTimeMs: number;
  /** The duration reported at that moment (-1 while unknown). */
  durationMs: number;
  /** audioq's progress (0-1), for the audioq sample. */
  progress?: number;
  paused: boolean;
  readyState: number;
  wallMs: number;
}

export interface ExperimentResult {
  /** Clips of a sequence experiment, in order. */
  clips: ClipRecord[];
  durationMs: number;
  id: string;
  /** audioq's debug log lines (audioq experiments only). */
  log: string[];
  /** Position samples (position experiments only). */
  samples: PositionSample[];
  startedAt: string;
  summary: string;
  title: string;
}

export interface Experiment {
  description: string;
  id: string;
  /** Must start its first sound synchronously: it is called from the tap. */
  run: (clips: readonly string[], longTrack: string) => Promise<ExperimentResult>;
  title: string;
}

const CLIP_TIMEOUT_MS: number = 8000;

const describeError = (error: unknown): string =>
  error instanceof Error ? `${error.name}: ${error.message}` : Object.prototype.toString.call(error);

const elapsed =
  (start: number): (() => number) =>
  (): number =>
    Math.round(performance.now() - start);

/** Waits for an element to end or fail, or gives up. */
const waitForEnd = (element: HTMLAudioElement, record: ClipRecord, now: () => number): Promise<void> =>
  new Promise((resolve) => {
    const done = (): void => {
      clearTimeout(timer);
      element.removeEventListener('ended', onEnded);
      element.removeEventListener('error', onError);
      resolve();
    };
    const onEnded = (): void => {
      record.ended = now();
      done();
    };
    const onError = (): void => {
      record.error = element.error ? `MediaError ${element.error.code}` : 'error event';
      done();
    };
    const timer = setTimeout(() => {
      record.error ??= `no end within ${CLIP_TIMEOUT_MS} ms`;
      done();
    }, CLIP_TIMEOUT_MS);
    element.addEventListener('ended', onEnded);
    element.addEventListener('error', onError);
  });

const summarizeClips = (clips: ClipRecord[]): string => {
  const finished = clips.filter((clip) => (clip.playedToMs ?? 0) > 200).length;
  const stuck = clips.find((clip) => clip.playing !== undefined && (clip.playedToMs ?? 0) <= 200);
  const refused = clips.find((clip) => clip.playResult !== undefined && clip.playResult !== 'resolved');
  return [
    `${finished} of ${clips.length} clips played through`,
    ...(stuck ? [`clip ${clips.indexOf(stuck) + 1} started but did not move (${stuck.playedToMs ?? 0} ms)`] : []),
    ...(refused ? [`first refusal: clip ${clips.indexOf(refused) + 1} (${refused.playResult ?? ''})`] : [])
  ].join('; ');
};

/**
 * Plays clips one after another with plain audio elements. `elementFor` returns the element for
 * clip `index` with its source set. The first play() happens synchronously, inside the tap.
 */
const runSequence = (
  id: string,
  title: string,
  clips: readonly string[],
  elementFor: (index: number, clip: string) => HTMLAudioElement,
  onStarted?: (index: number) => void
): Promise<ExperimentResult> => {
  const startedAt = new Date().toISOString();
  const now = elapsed(performance.now());
  const records: ClipRecord[] = [];

  const playClip = (index: number): Promise<void> => {
    const clip = clips[index];
    if (clip === undefined) return Promise.resolve();
    const record: ClipRecord = { clip: clip.split('/').pop() ?? clip, created: now() };
    records.push(record);
    const element = elementFor(index, clip);
    element.addEventListener(
      'playing',
      () => {
        record.playing ??= now();
        onStarted?.(index);
      },
      { once: true }
    );
    const ended = waitForEnd(element, record, now).then(() => {
      record.playedToMs = Math.round(element.currentTime * 1000);
    });
    record.playCalled = now();
    element.play().then(
      () => (record.playResult = 'resolved'),
      (error: unknown) => (record.playResult = describeError(error))
    );
    return ended.then(() => playClip(index + 1));
  };

  return playClip(0).then(() => ({
    clips: records,
    durationMs: now(),
    id,
    log: [],
    samples: [],
    startedAt,
    summary: summarizeClips(records),
    title
  }));
};

/** Resets an element the way audioq releases one (pause, remove the source, load). */
const resetElement = (element: HTMLAudioElement): void => {
  element.pause();
  element.removeAttribute('src');
  element.load();
};

/** A short silent WAV, for priming elements during the tap. */
const silence = (): string => URL.createObjectURL(createBeep(1, 50));

/** Samples an element's position every 100 ms for a while after play() is called. */
const samplePosition = (element: HTMLAudioElement, durationMs: number): Promise<PositionSample[]> => {
  const start = performance.now();
  const samples: PositionSample[] = [];
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      samples.push({
        currentTimeMs: Math.round(element.currentTime * 1000),
        durationMs: Number.isFinite(element.duration) ? Math.round(element.duration * 1000) : -1,
        paused: element.paused,
        readyState: element.readyState,
        wallMs: Math.round(performance.now() - start)
      });
      if (performance.now() - start >= durationMs) {
        clearInterval(timer);
        resolve(samples);
      }
    }, 100);
  });
};

const summarizeSamples = (samples: PositionSample[]): string => {
  const first = samples.find((sample) => sample.currentTimeMs > 0);
  const jump = samples.reduce((largest, sample, index) => {
    const previous = samples[index - 1];
    return previous ? Math.max(largest, sample.currentTimeMs - previous.currentTimeMs) : largest;
  }, 0);
  // Each distinct duration the browser reported, in order (the demo's target is ES5: no Set spread)
  const durations = samples.map((sample) => sample.durationMs).filter((value, index, all) => all.indexOf(value) === index);
  const moved = first
    ? `position first moved at ${first.wallMs} ms (to ${first.currentTimeMs} ms); largest step between 100 ms samples: ${jump} ms`
    : 'position never moved';
  return `${moved}; durations reported: ${durations.join(' → ')} ms`;
};

/** Queues the clips on one audioq channel from the tap, recording events and audioq's debug log. */
const runAudioqQueue = (id: string, title: string, clips: readonly string[], config: Partial<QueueConfig>): Promise<ExperimentResult> => {
  const startedAt = new Date().toISOString();
  const now = elapsed(performance.now());
  const log: string[] = [];
  const write =
    (level: string) =>
    (...args: unknown[]): void => {
      log.push(`${now()} ms ${level} ${args.map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg))).join(' ')}`);
    };
  const queue = createAudioQueue({ ...config, debug: true, logger: { debug: write('debug'), error: write('error'), warn: write('warn') } });
  const records: ClipRecord[] = [];
  const byId = new Map<number, ClipRecord>();
  onAudioComplete(queue, 0, (info) => {
    const record = byId.get(info.id);
    if (record) record.playedToMs = Math.round(info.playedMs);
  });
  const handles = clips.map((clip) => {
    const record: ClipRecord = { clip: clip.split('/').pop() ?? clip, created: now() };
    records.push(record);
    return queueAudio(queue, clip).then((item) => {
      byId.set(item.id, record);
      void item.started.then((started) => {
        if (started) record.playing = now();
      });
      return item.finished.then((outcome) => {
        record.ended = now();
        record.outcome = outcome;
      });
    });
  });
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, clips.length * CLIP_TIMEOUT_MS));
  return Promise.race([Promise.all(handles).then(() => undefined), timeout]).then(() => {
    void destroyAllChannels(queue);
    return { clips: records, durationMs: now(), id, log, samples: [], startedAt, summary: summarizeClips(records), title };
  });
};

export const EXPERIMENTS: readonly Experiment[] = [
  {
    description: 'The Queue Management case: four clips queued on one channel by this tap.',
    id: 'audioq-queue',
    run: (clips) => runAudioqQueue('audioq-queue', 'audioq queue', clips, {}),
    title: 'audioq queue (current library)'
  },
  {
    description:
      'The same queue with preloading off (prefetchCount: 0). On iOS audioq now never preloads, so there this should match the run above.',
    id: 'audioq-no-prefetch',
    run: (clips) => runAudioqQueue('audioq-no-prefetch', 'audioq queue, no preloading', clips, { prefetchCount: 0 }),
    title: 'audioq queue, preloading off'
  },
  {
    description:
      'What audioq used to do, with plain elements: when a clip starts, the next element is created and preloads (preload = auto). Expected to stall on iOS.',
    id: 'preload-next-auto',
    run: (clips) => {
      const elements: HTMLAudioElement[] = [];
      const prepare = (index: number): HTMLAudioElement => {
        const element = new Audio();
        element.preload = 'auto';
        element.src = clips[index] ?? '';
        elements[index] = element;
        return element;
      };
      return runSequence(
        'preload-next-auto',
        'Next element preloaded during playback (auto)',
        clips,
        (index) => elements[index] ?? prepare(index),
        (index) => {
          if (index + 1 < clips.length) prepare(index + 1);
        }
      );
    },
    title: 'Next element preloaded during playback'
  },
  {
    description: 'The same, but the next element does not preload (preload = none) until it is played.',
    id: 'preload-next-none',
    run: (clips) => {
      const elements: HTMLAudioElement[] = [];
      const prepare = (index: number): HTMLAudioElement => {
        const element = new Audio();
        element.preload = 'none';
        element.src = clips[index] ?? '';
        elements[index] = element;
        return element;
      };
      return runSequence(
        'preload-next-none',
        'Next element created during playback (preload none)',
        clips,
        (index) => elements[index] ?? prepare(index),
        (index) => {
          if (index + 1 < clips.length) prepare(index + 1);
        }
      );
    },
    title: 'Next element created during playback, no preload'
  },
  {
    description: 'A new element per clip, created when the previous clip ends (outside the tap).',
    id: 'new-element-each',
    run: (clips) => runSequence('new-element-each', 'New element per clip', clips, (_, clip) => new Audio(clip)),
    title: 'New element per clip'
  },
  {
    description: 'Every element created (with its source) during the tap; later ones started outside it.',
    id: 'created-in-tap',
    run: (clips) => {
      const elements = clips.map((clip) => new Audio(clip));
      return runSequence('created-in-tap', 'All elements created in the tap', clips, (index) => elements[index] ?? new Audio());
    },
    title: 'All elements created in the tap'
  },
  {
    description: 'One element for every clip: its source is swapped when a clip ends.',
    id: 'one-element',
    run: (clips) => {
      const element = new Audio();
      return runSequence('one-element', 'One element, source swapped', clips, (_, clip) => {
        element.src = clip;
        return element;
      });
    },
    title: 'One element, source swapped'
  },
  {
    description: 'audioq’s current fix: an element that played is reset (pause, remove source, load) and reused.',
    id: 'reset-and-reuse',
    run: (clips) => {
      let previous: HTMLAudioElement | undefined;
      return runSequence('reset-and-reuse', 'Reset an element that played, then reuse it', clips, (_, clip) => {
        const element = previous ?? new Audio();
        if (previous) resetElement(previous);
        element.src = clip;
        previous = element;
        return element;
      });
    },
    title: 'Reset and reuse (current fix)'
  },
  {
    description: 'Howler’s approach: during the tap, create spare elements and call load() on them; later clips use those.',
    id: 'pool-load-in-tap',
    run: (clips) => {
      const pool = clips.slice(1).map(() => {
        const element = new Audio();
        element.load();
        return element;
      });
      return runSequence('pool-load-in-tap', 'Pool unlocked with load() in the tap', clips, (index, clip) => {
        const element = index === 0 ? new Audio() : (pool[index - 1] ?? new Audio());
        element.src = clip;
        return element;
      });
    },
    title: 'Pool unlocked with load() in the tap'
  },
  {
    description: 'During the tap, spare elements play a short silence (then pause); later clips use those.',
    id: 'pool-primed-in-tap',
    run: (clips) => {
      const quiet = silence();
      const pool = clips.slice(1).map(() => {
        const element = new Audio(quiet);
        element.play().then(
          () => element.pause(),
          () => undefined
        );
        return element;
      });
      return runSequence('pool-primed-in-tap', 'Pool primed with silence in the tap', clips, (index, clip) => {
        const element = index === 0 ? new Audio() : (pool[index - 1] ?? new Audio());
        element.src = clip;
        return element;
      });
    },
    title: 'Pool primed with silence in the tap'
  },
  {
    description: 'Position of a plain element during its first 5 seconds, sampled every 100 ms.',
    id: 'position-plain',
    run: (_, longTrack) => {
      const startedAt = new Date().toISOString();
      const element = new Audio(longTrack);
      void element.play().catch(() => undefined);
      return samplePosition(element, 5000).then((samples) => {
        element.pause();
        return {
          clips: [],
          durationMs: 5000,
          id: 'position-plain',
          log: [],
          samples,
          startedAt,
          summary: summarizeSamples(samples),
          title: 'Position: plain element'
        };
      });
    },
    title: 'Position: plain element'
  },
  {
    description: 'The same through audioq (what the visual queue shows), sampled every 100 ms.',
    id: 'position-audioq',
    run: (_, longTrack) => {
      const startedAt = new Date().toISOString();
      const queue = createAudioQueue({ logger: null });
      void queueAudio(queue, longTrack);
      const start = performance.now();
      const samples: PositionSample[] = [];
      return new Promise<ExperimentResult>((resolve) => {
        const timer = setInterval(() => {
          const info = getCurrentAudioInfo(queue, 0);
          samples.push({
            currentTimeMs: Math.round(info?.currentTime ?? 0),
            durationMs: Math.round(info?.duration ?? -1),
            paused: info?.isPaused ?? true,
            progress: info?.progress ?? 0,
            readyState: info?.isLoading === true ? 0 : 4,
            wallMs: Math.round(performance.now() - start)
          });
          if (performance.now() - start >= 5000) {
            clearInterval(timer);
            void destroyAllChannels(queue);
            resolve({
              clips: [],
              durationMs: 5000,
              id: 'position-audioq',
              log: [],
              samples,
              startedAt,
              summary: summarizeSamples(samples),
              title: 'Position: audioq'
            });
          }
        }, 100);
      });
    },
    title: 'Position: audioq'
  }
];
