/**
 * Pause and resume experiments: does resuming continue exactly where the pause was made? Each one
 * plays a short sentence, pauses it after PAUSE_AT_MS, waits, and resumes, recording the position
 * at each step. Whether a word was skipped or repeated can only be heard, so the page also asks.
 *
 * Variants: a plain element; an element routed through Web Audio (as audioq does on iOS when a
 * volume is between 0 and 1) with no seek, with a seek to the position read at resume (what audioq
 * did), and with a seek back to the position saved at the pause; and audioq itself, at full volume
 * and at half volume (routed on iOS).
 */
import {
  createAudioQueue,
  destroyAllChannels,
  getCurrentAudioInfo,
  onAudioComplete,
  pauseChannel,
  queueAudio,
  resumeChannel,
  setChannelVolume
} from 'audioq/queue';
import sentence from '../audio/red_team_lost_base.mp3';
import { Experiment, ExperimentResult, PauseRecord } from './experiments';

/** Pause during "red team", before "lost". */
const PAUSE_AT_MS: number = 700;
const PAUSED_FOR_MS: number = 1500;
const GIVE_UP_MS: number = 6000;

interface Player {
  /** Waits for the end (or gives up) and releases everything. */
  finish: () => Promise<void>;
  pause: () => void;
  /** Current position (ms). */
  position: () => number;
  resume: () => void;
}

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Resolves once `condition` holds, checking every 10 ms, or after `timeoutMs`. */
const waitUntil = (condition: () => boolean, timeoutMs: number): Promise<void> =>
  new Promise((resolve) => {
    const start = performance.now();
    const timer = setInterval(() => {
      if (condition() || performance.now() - start > timeoutMs) {
        clearInterval(timer);
        resolve();
      }
    }, 10);
  });

const signed = (ms: number): string => `${ms >= 0 ? '+' : ''}${ms} ms`;

const runPauseTest = async (id: string, title: string, player: Player): Promise<ExperimentResult> => {
  const startedAt = new Date().toISOString();
  const start = performance.now();
  await waitUntil(() => player.position() >= PAUSE_AT_MS, GIVE_UP_MS);
  const atPause = player.position();
  player.pause();
  await delay(PAUSED_FOR_MS);
  const beforeResume = player.position();
  player.resume();
  const atResume = player.position();
  await delay(100);
  const after100 = player.position();
  await delay(200);
  const after300 = player.position();
  await player.finish();
  const pause: PauseRecord = { after100, after300, atPause, atResume, beforeResume };
  return {
    clips: [],
    durationMs: Math.round(performance.now() - start),
    id,
    log: [],
    pause,
    samples: [],
    startedAt,
    summary:
      `paused at ${atPause} ms; moved ${signed(beforeResume - atPause)} while paused; ` +
      `resumed from ${atResume} ms (${signed(atResume - atPause)} from the pause); ${after300} ms 300 ms later`,
    title
  };
};

/** Resolves when the element ends, or after GIVE_UP_MS. */
const ended = (element: HTMLAudioElement): Promise<void> =>
  Promise.race([new Promise<void>((resolve) => element.addEventListener('ended', () => resolve(), { once: true })), delay(GIVE_UP_MS)]);

/**
 * A plain element (already playing). `beforeResume` runs just before play() on resume, with the
 * position saved at the pause (seconds).
 */
const elementPlayer = (
  element: HTMLAudioElement,
  beforeResume: (element: HTMLAudioElement, pausedAt: number) => void,
  release: () => void = (): void => undefined
): Player => {
  let pausedAt = 0;
  return {
    finish: () =>
      ended(element).then(() => {
        element.pause();
        release();
      }),
    pause: () => {
      pausedAt = element.currentTime;
      element.pause();
    },
    position: () => Math.round(element.currentTime * 1000),
    resume: () => {
      beforeResume(element, pausedAt);
      element.play().catch(() => undefined);
    }
  };
};

/** Routes an element through Web Audio at half volume; returns a function that closes the context. */
const routeAtHalfVolume = (element: HTMLAudioElement): (() => void) => {
  const scope = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const Context = scope.AudioContext ?? scope.webkitAudioContext;
  if (!Context) return (): void => undefined;
  const context = new Context();
  void context.resume();
  const gain = context.createGain();
  gain.gain.value = 0.5;
  context.createMediaElementSource(element).connect(gain).connect(context.destination);
  return (): void => {
    void context.close();
  };
};

/** Starts the sentence on a plain element (from the tap). */
const playSentence = (): HTMLAudioElement => {
  const element = new Audio(sentence);
  element.play().catch(() => undefined);
  return element;
};

const noSeek = (): void => undefined;

/** audioq on a queue of its own; `halfVolume` routes it through Web Audio on iOS. */
const audioqPlayer = (halfVolume: boolean): Player => {
  const queue = createAudioQueue({ logger: null });
  if (halfVolume) void setChannelVolume(queue, 0, 0.5);
  const completed = new Promise<void>((resolve) => onAudioComplete(queue, 0, () => resolve()));
  void queueAudio(queue, sentence);
  return {
    finish: () => Promise.race([completed, delay(GIVE_UP_MS)]).then(() => destroyAllChannels(queue)),
    pause: () => {
      void pauseChannel(queue, 0);
    },
    position: () => Math.round(getCurrentAudioInfo(queue, 0)?.currentTime ?? 0),
    resume: () => {
      void resumeChannel(queue, 0);
    }
  };
};

const ROUTED_NOTE = 'Routed through Web Audio at half volume, as audioq does on iOS for volumes between 0 and 1';

export const PAUSE_EXPERIMENTS: readonly Experiment[] = [
  {
    description: 'Plays “red team lost the base”, pauses after 0.7 s, resumes 1.5 s later. Listen: is every word heard once?',
    id: 'pause-plain',
    run: () => runPauseTest('pause-plain', 'Pause: plain element', elementPlayer(playSentence(), noSeek)),
    title: 'Pause: plain element'
  },
  {
    description: `${ROUTED_NOTE}; resumed with play() only.`,
    id: 'pause-routed',
    run: () => {
      const element = playSentence();
      const release = routeAtHalfVolume(element);
      return runPauseTest('pause-routed', 'Pause: Web Audio, no seek', elementPlayer(element, noSeek, release));
    },
    title: 'Pause: Web Audio, no seek'
  },
  {
    description: `${ROUTED_NOTE}; on resume, seeks to the position the element reports then (what audioq did on iOS).`,
    id: 'pause-routed-reseek',
    run: () => {
      const element = playSentence();
      const release = routeAtHalfVolume(element);
      const reseek = (target: HTMLAudioElement): void => {
        const position = target.currentTime;
        target.currentTime = position;
      };
      return runPauseTest('pause-routed-reseek', 'Pause: Web Audio, seek to position at resume', elementPlayer(element, reseek, release));
    },
    title: 'Pause: Web Audio, seek to position at resume'
  },
  {
    description: `${ROUTED_NOTE}; on resume, seeks back to the position saved when pausing.`,
    id: 'pause-routed-restore',
    run: () => {
      const element = playSentence();
      const release = routeAtHalfVolume(element);
      const restore = (target: HTMLAudioElement, pausedAt: number): void => {
        target.currentTime = pausedAt;
      };
      return runPauseTest('pause-routed-restore', 'Pause: Web Audio, seek to position at pause', elementPlayer(element, restore, release));
    },
    title: 'Pause: Web Audio, seek to position at pause'
  },
  {
    description: 'audioq pauseChannel / resumeChannel at full volume (what the Pause & Resume tab does with no fade).',
    id: 'pause-audioq',
    run: () => runPauseTest('pause-audioq', 'Pause: audioq, full volume', audioqPlayer(false)),
    title: 'Pause: audioq, full volume'
  },
  {
    description: 'The same at channel volume 0.5 (routed through Web Audio on iOS, like a ducked channel).',
    id: 'pause-audioq-routed',
    run: () => runPauseTest('pause-audioq-routed', 'Pause: audioq, half volume', audioqPlayer(true)),
    title: 'Pause: audioq, half volume'
  }
].map((experiment) => ({ ...experiment, askWhatYouHeard: true }));
