import {
  AudioMetadata,
  clearVolumeDucking,
  isAudioPreloaded,
  preloadAudio,
  queueAudio,
  seekBy,
  setVolumeDucking,
  shuffleQueue,
  stopAllAudioInChannel,
  stopCurrentAudioInChannel,
  togglePauseChannel
} from 'audioq';
import { announcer, announcerCues, announcerLineNames, AnnouncerLine, announcerSpriteSource } from '../audio/announcerSprite';
import { createBeep } from '../audio/beep';
import backgroundMusic from '../audio/background_music.mp3';
import laserGunFiring from '../audio/laser_gun_firing.mp3';
import laserGunFiringRepeatedly from '../audio/laser_gun_firing_repeatedly.mp3';
import longTeleportation from '../audio/long_teleportation.mp3';
import longTeleportationThree from '../audio/long_teleportation_3.mp3';
import { CROSSFADE_MS, GAP_MS, PlaylistSettings, PlaylistSettingsActions } from '../hooks/usePlaylistSettings';
import { Example, ExampleTabs } from '../types';
import { pickRandom } from '../utils/pick';

const log = (...args: unknown[]): void => {
  // eslint-disable-next-line no-console
  console.log(...args);
};

const artwork: AudioMetadata['artwork'] = [{ sizes: '512x512', src: `${process.env.PUBLIC_URL}/artwork-512.png`, type: 'image/png' }];

const PLAYLIST: { src: string; title: string }[] = [
  { src: backgroundMusic, title: 'Background Music' },
  { src: longTeleportation, title: 'Teleporter Hum' },
  { src: longTeleportationThree, title: 'Teleporter Wind-Down' },
  { src: laserGunFiringRepeatedly, title: 'Laser Volley' }
];

const randomLine = (): AnnouncerLine => pickRandom(announcerLineNames);

const logCompletion = (label: string, finished: Promise<string>): void => {
  void finished.then((outcome) => log(`${label} finished: ${outcome}`));
};

function playlistExamples(settings: PlaylistSettings, actions: PlaylistSettingsActions): Example[] {
  return [
    {
      buttonFunction: (): void => {
        PLAYLIST.forEach(({ src, title }) => {
          void queueAudio(src, 0, { metadata: { album: 'AudioQ Demo', artist: 'AudioQ', artwork, title } });
        });
      },
      buttonText: 'Queue A Playlist (Channel 0)',
      buttonType: 'default',
      channel: 0,
      codeExample: `// Lock screen, notification and
// media keys follow channel 0
connectMediaSession({ channel: 0 });

await queueAudio(track, 0, {
  metadata: {
    artist: 'AudioQ',
    artwork: [{ src: '/art.png' }],
    title: 'Background Music'
  }
});`,
      enabledWhen: 'always'
    },
    {
      buttonFunction: (): void => void togglePauseChannel(0),
      buttonText: 'Toggle Pause (Channel 0)',
      buttonType: 'default',
      channel: 0,
      codeExample: 'await togglePauseChannel(0);',
      enabledWhen: 'hasAudio'
    },
    {
      buttonFunction: (): void => void stopCurrentAudioInChannel(0),
      buttonText: 'Next Track (Channel 0)',
      buttonType: 'default',
      channel: 0,
      codeExample: 'await stopCurrentAudioInChannel(0);',
      enabledWhen: 'hasAudio'
    },
    {
      buttonFunction: (): void => {
        seekBy(0, -10000);
      },
      buttonText: 'Back 10 Seconds (Channel 0)',
      buttonType: 'default',
      channel: 0,
      codeExample: 'seekBy(0, -10000);',
      enabledWhen: 'hasAudio'
    },
    {
      buttonFunction: (): void => {
        seekBy(0, 10000);
      },
      buttonText: 'Forward 10 Seconds (Channel 0)',
      buttonType: 'default',
      channel: 0,
      codeExample: 'seekBy(0, 10000);',
      enabledWhen: 'hasAudio'
    },
    {
      buttonFunction: actions.cycleRate,
      buttonText: `Speed ${settings.rate}x (Channel 0)`,
      buttonType: 'default',
      channel: 0,
      codeExample: `// Pitch is preserved
setPlaybackRate(0, ${settings.rate});`,
      enabledWhen: 'always'
    },
    {
      buttonFunction: actions.cycleRepeat,
      buttonText: `Repeat: ${settings.repeat} (Channel 0)`,
      buttonType: 'default',
      channel: 0,
      codeExample: `// 'off' | 'all' | 'one'
setRepeatMode(0, '${settings.repeat}');`,
      enabledWhen: 'always'
    },
    {
      buttonFunction: (): void => {
        void shuffleQueue(0).then((result) =>
          log(
            'Shuffled:',
            result.updatedQueue?.items.map((item) => item.metadata?.title)
          )
        );
      },
      buttonText: 'Shuffle Upcoming Tracks (Channel 0)',
      buttonType: 'default',
      channel: 0,
      codeExample: `// The current track keeps playing
await shuffleQueue(0);`,
      enabledWhen: 'hasAudio',
      minQueueLength: 3
    },
    {
      buttonFunction: actions.toggleCrossfade,
      buttonText: `Crossfade ${settings.crossfadeMs > 0 ? 'On' : 'Off'} (Channel 0)`,
      buttonType: settings.crossfadeMs > 0 ? 'resume' : 'default',
      channel: 0,
      codeExample: `// Tracks overlap by ${CROSSFADE_MS / 1000} s
setCrossfade(0, ${settings.crossfadeMs});`,
      enabledWhen: 'always'
    },
    {
      buttonFunction: actions.toggleGap,
      buttonText: `Gap Between Tracks ${settings.gapMs > 0 ? 'On' : 'Off'} (Channel 0)`,
      buttonType: settings.gapMs > 0 ? 'resume' : 'default',
      channel: 0,
      codeExample: `// ${GAP_MS / 1000} s of silence between tracks
setChannelGap(0, ${settings.gapMs});`,
      enabledWhen: 'always'
    },
    {
      buttonFunction: (): void => {
        announcer.play(randomLine(), 1).catch((error: unknown) => log('Could not queue:', error));
      },
      buttonText: 'Announcement Over The Music (Channel 1)',
      buttonType: 'priority',
      channel: 1,
      codeExample: `// Music ducks to 30% while
// channel 1 has audio
setVolumeDucking({
  duckingVolume: 0.3,
  priorityChannel: 1,
  priorityVolume: 1
});
await queueAudio(announcement, 1);`,
      enabledWhen: 'always'
    },
    {
      buttonFunction: actions.togglePauseWhenHidden,
      buttonText: `Hold All Sounds While Hidden: ${settings.pauseWhenHidden ? 'On' : 'Off'}`,
      buttonType: settings.pauseWhenHidden ? 'resume' : 'default',
      channel: 'global',
      codeExample: `// On: everything pauses when the
// tab is hidden or the phone locks,
// and resumes when you come back.
// Off: keeps playing; use the
// lock screen controls.
setQueueConfig({
  pauseWhenHidden: ${settings.pauseWhenHidden}
});`,
      enabledWhen: 'always'
    }
  ];
}

function spriteExamples(): Example[] {
  return [
    {
      buttonFunction: (): void => {
        void preloadAudio(announcerSpriteSource).then(([result]) => {
          if (result?.ok === true) log(`Sprite preloaded: ${Math.round(result.bytes / 1024)} KB, now plays from memory`);
          else log('Preload failed, the sprite will stream:', result?.error?.message);
          log('isAudioPreloaded:', isAudioPreloaded(announcerSpriteSource));
        });
      },
      buttonText: 'Preload The Sprite Into Memory (Channel 0)',
      buttonType: 'default',
      channel: 0,
      codeExample: `// Instant starts, works offline, and
// seeks even without Range support
const [result] = await preloadAudio(spriteUrl);
console.log(result.ok, result.bytes);

// Later: free the memory
releasePreloadedAudio(spriteUrl);`,
      enabledWhen: 'always'
    },
    {
      buttonFunction: (): void => {
        const line: AnnouncerLine = randomLine();
        announcer.play(line, 0, { cues: announcerCues }).catch((error: unknown) => log('Could not queue:', error));
      },
      buttonText: 'Play A Random Line From The Sprite (Channel 0)',
      buttonType: 'default',
      channel: 0,
      codeExample: `// One file, nine sounds
const announcer = defineSprite(spriteUrl, {
  blueWins: [5000, 6330],
  oneMinute: [10000, 11100],
  // ...
});

// Captions from a WebVTT file
const cues = parseWebVtt(vttText);
await announcer.play('oneMinute', 0, { cues });`,
      enabledWhen: 'always'
    },
    {
      buttonFunction: (): void => {
        (['oneMinute', 'redCaptured', 'blueWins'] as const).forEach((line) => {
          void announcer.play(line, 0, { cues: announcerCues });
        });
      },
      buttonText: 'Queue Three Lines (Channel 0)',
      buttonType: 'default',
      channel: 0,
      codeExample: `await announcer.play('oneMinute', 0, { cues });
await announcer.play('redCaptured', 0, { cues });
await announcer.play('blueWins', 0, { cues });`,
      enabledWhen: 'always'
    },
    {
      buttonFunction: (): void => void stopAllAudioInChannel(0),
      buttonText: 'Stop Lines (Channel 0)',
      buttonType: 'default',
      channel: 0,
      codeExample: 'await stopAllAudioInChannel(0);',
      enabledWhen: 'hasAudio'
    },
    {
      buttonFunction: (): void => {
        void queueAudio(backgroundMusic, 1, {
          cues: [0, 1, 2, 3].map((beat) => ({ data: { beat }, startMs: 30000 + beat * 1000 })),
          endAt: 34000,
          loop: true,
          metadata: { title: 'Music 0:30-0:34 (loop)' },
          startAt: 30000
        });
      },
      buttonText: 'Loop A 4-Second Segment Of The Music (Channel 1)',
      buttonType: 'default',
      channel: 1,
      codeExample: `// Point cues (no endMs) fire once
// each time playback passes them
await queueAudio(music, 1, {
  cues: [{ startMs: 30000, data: { beat: 0 } }, ...],
  endAt: 34000,
  loop: true,
  startAt: 30000
});`,
      enabledWhen: 'idle'
    },
    {
      buttonFunction: (): void => void stopAllAudioInChannel(1),
      buttonText: 'Stop Segment (Channel 1)',
      buttonType: 'default',
      channel: 1,
      codeExample: 'await stopAllAudioInChannel(1);',
      enabledWhen: 'hasAudio'
    }
  ];
}

function notificationExamples(settings: PlaylistSettings, actions: PlaylistSettingsActions): Example[] {
  return [
    {
      buttonFunction: actions.toggleDebug,
      buttonText: `Debug Log ${settings.debug ? 'On' : 'Off'}`,
      buttonType: settings.debug ? 'resume' : 'default',
      channel: 'global',
      codeExample: `// Logs every event with its channel
// and payload (see the debug console
// at the bottom of the page)
setQueueConfig({ debug: ${settings.debug} });`,
      enabledWhen: 'always'
    },
    {
      buttonFunction: (): void => {
        void queueAudio(laserGunFiring, 0, { dedupeMs: 1000, volume: 0.6 }).then((item) => {
          logCompletion(`Laser #${item.id}`, item.finished);
        });
      },
      buttonText: 'Tap Fast: Laser With 1 s Dedupe (Channel 0)',
      buttonType: 'default',
      channel: 0,
      codeExample: `// Repeats of the same sound within
// 1 s are ignored
const item = await queueAudio(laser, 0, {
  dedupeMs: 1000,
  volume: 0.6
});
console.log(await item.finished);
// 'ended' | 'skipped' | 'stopped' | ...`,
      enabledWhen: 'always'
    },
    {
      buttonFunction: (): void => {
        void queueAudio(createBeep(880, 250), 0, { interrupt: true, metadata: { title: 'Generated beep (880 Hz)' } });
      },
      buttonText: 'Generated Beep From A Blob (Channel 0)',
      buttonType: 'default',
      channel: 0,
      codeExample: `// Blobs and Files work like URLs
// (recordings, text-to-speech,
// file inputs). Object URLs are
// created and revoked for you.
const blob = new Blob([wav], {
  type: 'audio/wav'
});
await queueAudio(blob, 0, {
  interrupt: true
});`,
      enabledWhen: 'always'
    },
    {
      buttonFunction: (): void => {
        const line: AnnouncerLine = randomLine();
        void announcer.play(line, 1, { cues: announcerCues, interrupt: true }).then((item) => logCompletion(line, item.finished));
      },
      buttonText: 'Newest Announcement Wins (Channel 1)',
      buttonType: 'priority',
      channel: 1,
      codeExample: `// Stops what is playing and clears
// the queue, then plays this
await queueAudio(announcement, 1, {
  interrupt: true
});`,
      enabledWhen: 'always'
    },
    {
      buttonFunction: (): void => {
        const line: AnnouncerLine = randomLine();
        void announcer
          .play(line, 1, { cues: announcerCues, maxQueueSize: 2 })
          .catch((error: unknown) => log('Rejected:', error instanceof Error ? error.message : error));
      },
      buttonText: 'Queue Up To 2 Announcements (Channel 1)',
      buttonType: 'default',
      channel: 1,
      codeExample: `// Rejects once 2 are queued
try {
  await queueAudio(announcement, 1, {
    maxQueueSize: 2
  });
} catch (error) {
  console.log('Rejected:', error.message);
}`,
      enabledWhen: 'always'
    }
  ];
}

/** Examples for the tabs that show what is new in AudioQ 3. */
export function createV3Examples(settings: PlaylistSettings, actions: PlaylistSettingsActions): Record<string, Example[]> {
  return {
    [ExampleTabs.NOTIFICATIONS]: notificationExamples(settings, actions),
    [ExampleTabs.PLAYLIST]: playlistExamples(settings, actions),
    [ExampleTabs.SPRITES_CAPTIONS]: spriteExamples()
  };
}

/** Ducking for the Playlist tab, so announcements lower the music. */
export function setPlaylistDucking(enabled: boolean): void {
  if (enabled) setVolumeDucking({ duckingVolume: 0.3, priorityChannel: 1, priorityVolume: 1 });
  else clearVolumeDucking();
}
