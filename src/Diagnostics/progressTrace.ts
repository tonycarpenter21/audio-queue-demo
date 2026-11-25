/**
 * Records what the progress bars on the main page show, frame by frame, while a sound plays on
 * channel 0. Turned on by opening the demo with `?trace` (the diagnostics page links to it); the
 * trace is sent to the computer running `npm run phone`.
 */
import { getCurrentAudioInfo } from 'audioq';
import { postReport } from './report';

/** One animation frame. Widths are percentages of each bar's track, or null when not shown. */
export interface TraceFrame {
  /** audioq's position and duration for channel 0 (ms) and its progress (0-1). */
  currentTimeMs: number;
  durationMs: number;
  /** Time since the previous frame (ms): long gaps mean the page was too busy to draw. */
  frameGapMs: number;
  progress: number;
  t: number;
  widths: Record<string, number | null>;
}

const TRACE_MS: number = 4000;

/** The progress bars on the main page, by name. */
const BARS: Record<string, string> = {
  channelInfo: '.mini-progress-fill',
  panel: '.v3-progress-fill',
  visualQueue: '.audio-file-progress'
};

let tracing = false;

/** Read once at startup: the app's redirects (/ to /queue-management) drop the query string. */
const requestedAtStartup: boolean = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('trace');

/** Whether the page was opened with `?trace`. */
export const traceRequested = (): boolean => requestedAtStartup;

/** Width of an element as a percentage of its parent, rounded to 0.1. */
const widthOf = (selector: string): number | null => {
  const bar = document.querySelector(selector);
  const track = bar?.parentElement?.getBoundingClientRect().width ?? 0;
  if (!bar || track === 0) return null;
  return Math.round((bar.getBoundingClientRect().width / track) * 1000) / 10;
};

/** Shows a short message at the top of the page (a trace has no React state of its own). */
const announce = (message: string): void => {
  const note = document.createElement('div');
  note.textContent = message;
  note.style.cssText = 'position:fixed;top:8px;left:8px;right:8px;z-index:9999;padding:8px;background:#222;color:#fff;font:14px sans-serif';
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 6000);
};

/** Records frames for a few seconds from now, then sends them. Ignored while a trace is running. */
export const traceProgressBars = (label: string): void => {
  if (tracing) return;
  tracing = true;
  const frames: TraceFrame[] = [];
  const start = performance.now();
  let previous = start;
  const frame = (now: number): void => {
    const info = getCurrentAudioInfo(0);
    frames.push({
      currentTimeMs: Math.round(info?.currentTime ?? -1),
      durationMs: Math.round(info?.duration ?? -1),
      frameGapMs: Math.round(now - previous),
      progress: Math.round((info?.progress ?? -1) * 1000) / 1000,
      t: Math.round(now - start),
      widths: Object.fromEntries(Object.entries(BARS).map(([name, selector]) => [name, widthOf(selector)]))
    });
    previous = now;
    if (now - start < TRACE_MS) {
      requestAnimationFrame(frame);
      return;
    }
    tracing = false;
    void postReport({ frames, kind: 'progress-trace', label }).then((saved) => announce(saved?.message ?? 'Trace done'));
  };
  requestAnimationFrame(frame);
};
