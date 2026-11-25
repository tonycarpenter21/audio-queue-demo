/**
 * Pause and resume experiments: does resuming continue exactly where the pause was made? Each one
 * plays a short sentence, pauses it after PAUSE_AT_MS, waits, and resumes, recording the position
 * at each step. Whether a word was skipped or repeated can only be heard, so the page also asks.
 *
 * What round 1 on an iPhone showed: a plain element jumps ~600 ms forward in the first 100 ms
 * after play() (words skipped), and an element routed through Web Audio replays old buffered audio
 * (words repeated) whether or not it seeks first. These variants try ways around both: seeking
 * back to the paused position, reloading the same element, and switching to a fresh element.
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
      `resumed from ${atResume} ms (${signed(atResume - atPause)} from the pause); ` +
      `first 100 ms after resuming moved ${signed(after100 - atResume)} (about +100 ms is right); ${after300} ms 300 ms later`,
    title
  };
};

/** Resolves when the element ends, or after GIVE_UP_MS. */
const ended = (element: () => HTMLAudioElement): Promise<void> =>
  new Promise((resolve) => {
    const start = performance.now();
    const timer = setInterval(() => {
      if (element().ended || performance.now() - start > GIVE_UP_MS) {
        clearInterval(timer);
        resolve();
      }
    }, 50);
  });

/** Web Audio routing at half volume, as audioq does on iOS for volumes between 0 and 1. */
interface Route {
  /** Routes an element (each element can be routed once). */
  attach: (element: HTMLAudioElement) => void;
  close: () => void;
}

const createRoute = (): Route => {
  const scope = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const Context = scope.AudioContext ?? scope.webkitAudioContext;
  if (!Context) return { attach: (): void => undefined, close: (): void => undefined };
  const context = new Context();
  void context.resume();
  const gain = context.createGain();
  gain.gain.value = 0.5;
  gain.connect(context.destination);
  return {
    attach: (element): void => {
      context.createMediaElementSource(element).connect(gain);
    },
    close: (): void => {
      void context.close();
    }
  };
};

/** Sets the position now if the element knows its duration, otherwise as soon as it does. */
const seekWhenReady = (element: HTMLAudioElement, seconds: number): void => {
  if (element.readyState >= 1) element.currentTime = seconds;
  else element.addEventListener('loadedmetadata', () => (element.currentTime = seconds), { once: true });
};

/**
 * How to resume: gets the paused element and the position saved at the pause (seconds), and
 * returns the element to play (the same one or a new one).
 */
type ResumeStrategy = (element: HTMLAudioElement, pausedAt: number, route: Route | undefined) => HTMLAudioElement;

const playAgain: ResumeStrategy = (element) => element;

const seekBack: ResumeStrategy = (element, pausedAt) => {
  element.currentTime = pausedAt;
  return element;
};

/** Reloads the same element (it keeps being allowed to play), then seeks back. */
const reload: ResumeStrategy = (element, pausedAt) => {
  const source = element.src;
  element.src = source;
  element.load();
  seekWhenReady(element, pausedAt);
  return element;
};

/**
 * Reloads, then seeks a little past the pause: iOS lets the last few tens of milliseconds sent to
 * the speaker finish after pause(), so resuming exactly at the paused position repeats them.
 */
const reloadAfter =
  (offsetMs: number): ResumeStrategy =>
  (element, pausedAt) => {
    element.load();
    seekWhenReady(element, pausedAt + offsetMs / 1000);
    return element;
  };

/** Moves to a new element (routed too, if the old one was) positioned at the pause. */
const freshElement: ResumeStrategy = (element, pausedAt, route) => {
  const next = new Audio(element.src);
  route?.attach(next);
  seekWhenReady(next, pausedAt);
  element.removeAttribute('src');
  element.load();
  return next;
};

/** Plays the sentence on a plain element from the tap, optionally routed, resuming with `strategy`. */
const elementPlayer = (strategy: ResumeStrategy, routed: boolean): Player => {
  let element = new Audio(sentence);
  const route = routed ? createRoute() : undefined;
  route?.attach(element);
  element.play().catch(() => undefined);
  let pausedAt = 0;
  return {
    finish: () =>
      ended(() => element).then(() => {
        element.pause();
        route?.close();
      }),
    pause: () => {
      pausedAt = element.currentTime;
      element.pause();
    },
    position: () => Math.round(element.currentTime * 1000),
    resume: () => {
      element = strategy(element, pausedAt, route);
      element.play().catch(() => undefined);
    }
  };
};

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

interface PauseVariant {
  description: string;
  id: string;
  player: () => Player;
  title: string;
}

const LISTEN = 'Plays “red team lost the base”, pauses after 0.7 s, resumes 1.5 s later.';

const VARIANTS: readonly PauseVariant[] = [
  {
    description: `${LISTEN} Full volume, resumed with play() (round 1: words skipped).`,
    id: 'pause-plain',
    player: () => elementPlayer(playAgain, false),
    title: 'Full volume: play() only'
  },
  {
    description: 'Full volume; on resume, seek back to the position saved at the pause, then play().',
    id: 'pause-plain-seek',
    player: () => elementPlayer(seekBack, false),
    title: 'Full volume: seek back'
  },
  {
    description: 'Full volume; on resume, reload the same element and seek back to the pause.',
    id: 'pause-plain-reload',
    player: () => elementPlayer(reload, false),
    title: 'Full volume: reload, seek back'
  },
  {
    description: 'Full volume; on resume, continue on a new element from the pause position.',
    id: 'pause-plain-fresh',
    player: () => elementPlayer(freshElement, false),
    title: 'Full volume: fresh element'
  },
  {
    description: 'Half volume through Web Audio, resumed with play() (round 1: words repeated).',
    id: 'pause-routed',
    player: () => elementPlayer(playAgain, true),
    title: 'Web Audio: play() only'
  },
  {
    description: 'Half volume through Web Audio; on resume, reload the same element and seek back.',
    id: 'pause-routed-reload',
    player: () => elementPlayer(reload, true),
    title: 'Web Audio: reload, seek back'
  },
  {
    description: 'Half volume through Web Audio; on resume, continue on a new routed element from the pause position.',
    id: 'pause-routed-fresh',
    player: () => elementPlayer(freshElement, true),
    title: 'Web Audio: fresh element'
  },
  {
    description:
      'Calibration, full volume: reload and resume 0 ms after the paused position. Pick the one where nothing repeats and nothing is missing.',
    id: 'pause-calibrate-0',
    player: () => elementPlayer(reloadAfter(0), false),
    title: 'Calibrate: resume +0 ms'
  },
  {
    description:
      'Calibration, full volume: reload and resume 40 ms after the paused position. Pick the one where nothing repeats and nothing is missing.',
    id: 'pause-calibrate-40',
    player: () => elementPlayer(reloadAfter(40), false),
    title: 'Calibrate: resume +40 ms'
  },
  {
    description:
      'Calibration, full volume: reload and resume 80 ms after the paused position. Pick the one where nothing repeats and nothing is missing.',
    id: 'pause-calibrate-80',
    player: () => elementPlayer(reloadAfter(80), false),
    title: 'Calibrate: resume +80 ms'
  },
  {
    description:
      'Calibration, full volume: reload and resume 120 ms after the paused position. Pick the one where nothing repeats and nothing is missing.',
    id: 'pause-calibrate-120',
    player: () => elementPlayer(reloadAfter(120), false),
    title: 'Calibrate: resume +120 ms'
  },
  {
    description:
      'Calibration, full volume: reload and resume 160 ms after the paused position. Pick the one where nothing repeats and nothing is missing.',
    id: 'pause-calibrate-160',
    player: () => elementPlayer(reloadAfter(160), false),
    title: 'Calibrate: resume +160 ms'
  },
  {
    description: 'audioq pauseChannel / resumeChannel at full volume (the Pause & Resume tab with no fade).',
    id: 'pause-audioq',
    player: () => audioqPlayer(false),
    title: 'audioq, full volume'
  },
  {
    description: 'audioq at channel volume 0.5 (routed through Web Audio on iOS, like a ducked channel).',
    id: 'pause-audioq-routed',
    player: () => audioqPlayer(true),
    title: 'audioq, half volume'
  }
];

export const PAUSE_EXPERIMENTS: readonly Experiment[] = VARIANTS.map((variant) => ({
  askWhatYouHeard: true,
  description: variant.description,
  id: variant.id,
  // The player is created inside the tap, so its first sound starts there.
  run: () => runPauseTest(variant.id, `Pause: ${variant.title}`, variant.player()),
  title: `Pause: ${variant.title}`
}));
