import { AudioCue, defineSprite, parseWebVtt, SpriteSegment } from 'audioq';
import announcerSpriteUrl from './announcer_sprite.mp3';

/**
 * announcer_sprite.mp3 holds every announcer line in a 2.5 s slot (see
 * scripts/build-announcer-sprite.sh): line N starts at N * 2500 ms. `speechMs` is how long the
 * line speaks, measured with ffmpeg's silencedetect.
 */
const SLOT_MS = 2500;

const ANNOUNCER_LINES = [
  { name: 'blueCaptured', speechMs: 1700, team: 'blue', text: 'Blue team captured the base' },
  { name: 'blueLost', speechMs: 1520, team: 'blue', text: 'Blue team lost the base' },
  { name: 'blueWins', speechMs: 1130, team: 'blue', text: 'Blue team wins!' },
  { name: 'playerJoined', speechMs: 1690, team: 'neutral', text: 'A new player joined the game' },
  { name: 'oneMinute', speechMs: 900, team: 'neutral', text: 'One minute left' },
  { name: 'playerLeft', speechMs: 1390, team: 'neutral', text: 'A player has left the game' },
  { name: 'redCaptured', speechMs: 1820, team: 'red', text: 'Red team captured the base' },
  { name: 'redLost', speechMs: 1550, team: 'red', text: 'Red team lost the base' },
  { name: 'redWins', speechMs: 1190, team: 'red', text: 'Red team wins!' }
] as const;

export type AnnouncerLine = (typeof ANNOUNCER_LINES)[number]['name'];
export type Team = (typeof ANNOUNCER_LINES)[number]['team'];

const TAIL_MS = 200;

const spriteMap = Object.fromEntries(
  ANNOUNCER_LINES.map(({ name, speechMs }, index): [AnnouncerLine, SpriteSegment] => [
    name,
    [index * SLOT_MS, index * SLOT_MS + speechMs + TAIL_MS]
  ])
) as Record<AnnouncerLine, SpriteSegment>;

/** One file, nine sounds. */
export const announcer = defineSprite(announcerSpriteUrl, spriteMap);

export const announcerSpriteSource: string = announcerSpriteUrl;

const pad = (value: number, length: number): string => String(value).padStart(length, '0');
const vttTime = (ms: number): string => `${pad(Math.floor(ms / 60000), 2)}:${pad(Math.floor(ms / 1000) % 60, 2)}.${pad(ms % 1000, 3)}`;

/**
 * The captions as a WebVTT file, like one you would download next to the audio. The cue
 * identifier (the line before the times) carries the team, which parseWebVtt puts in `data`.
 */
export const announcerCaptionsVtt: string = [
  'WEBVTT',
  '',
  ...ANNOUNCER_LINES.flatMap(({ speechMs, team, text }, index) => [
    team,
    `${vttTime(index * SLOT_MS)} --> ${vttTime(index * SLOT_MS + speechMs)}`,
    text,
    ''
  ])
].join('\n');

/** Cues for the whole sprite file: whichever segment plays shows its own caption. */
export const announcerCues: AudioCue[] = parseWebVtt(announcerCaptionsVtt);

export const announcerLineNames: readonly AnnouncerLine[] = announcer.names;
