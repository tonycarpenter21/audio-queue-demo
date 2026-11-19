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

const randomLine = (): AnnouncerLine => announcerLineNames[Math.floor(Math.random() * announcerLineNames.length)];

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
      isDisabledWhenQueueIsEmpty: false
    },
    {
      buttonFunction: (): void => void togglePauseChannel(0),
      buttonText: 'Toggle Pause (Channel 0)',
      buttonType: 'default',
      codeExample: 'await togglePauseChannel(0);',
      isDisabledWhenQueueIsEmpty: true
    },
    {
      buttonFunction: (): void => void stopCurrentAudioInChannel(0),
      buttonText: 'Next Track (Channel 0)',
      buttonType: 'default',
      codeExample: 'await stopCurrentAudioInChannel(0);',
      isDisabledWhenQueueIsEmpty: true
    },
    {
      buttonFunction: (): void => {
        seekBy(0, -10000);
      },
      buttonText: 'Back 10 Seconds (Channel 0)',
      buttonType: 'default',
      codeExample: 'seekBy(0, -10000);',
      isDisabledWhenQueueIsEmpty: true
    },
    {
      buttonFunction: (): void => {
        seekBy(0, 10000);
      },
      buttonText: 'Forward 10 Seconds (Channel 0)',
      buttonType: 'default',
      codeExample: 'seekBy(0, 10000);',
      isDisabledWhenQueueIsEmpty: true
    },
    {
      buttonFunction: actions.cycleRate,
      buttonText: `Speed ${settings.rate}x (Channel 0)`,
      buttonType: 'default',
      codeExample: `// Pitch is preserved
setPlaybackRate(0, ${settings.rate});`,
      isDisabledWhenQueueIsEmpty: false
    },
    {
      buttonFunction: actions.cycleRepeat,
      buttonText: `Repeat: ${settings.repeat} (Channel 0)`,
      buttonType: 'default',
      codeExample: `// 'off' | 'all' | 'one'
setRepeatMode(0, '${settings.repeat}');`,
      isDisabledWhenQueueIsEmpty: false
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
      codeExample: `// The current track keeps playing
await shuffleQueue(0);`,
      isDisabledWhenQueueIsEmpty: true,
      minQueueLength: 3
    },
    {
      buttonFunction: actions.toggleCrossfade,
      buttonText: `Crossfade ${settings.crossfadeMs ? 'On' : 'Off'} (Channel 0)`,
      buttonType: settings.crossfadeMs ? 'resume' : 'default',
      codeExample: `// Tracks overlap by ${CROSSFADE_MS / 1000} s
setCrossfade(0, ${settings.crossfadeMs});`,
      isDisabledWhenQueueIsEmpty: false
    },
    {
      buttonFunction: actions.toggleGap,
      buttonText: `Gap Between Tracks ${settings.gapMs ? 'On' : 'Off'} (Channel 0)`,
      buttonType: settings.gapMs ? 'resume' : 'default',
      codeExample: `// ${GAP_MS / 1000} s of silence between tracks
setChannelGap(0, ${settings.gapMs});`,
      isDisabledWhenQueueIsEmpty: false
    },
    {
      buttonFunction: (): void => {
        announcer.play(randomLine(), 1).catch((error: unknown) => log('Could not queue:', error));
      },
      buttonText: 'Announcement Over The Music (Channel 1)',
      buttonType: 'priority',
      codeExample: `// Music ducks to 30% while
// channel 1 has audio
setVolumeDucking({
  duckingVolume: 0.3,
  priorityChannel: 1,
  priorityVolume: 1
});
await queueAudio(announcement, 1);`,
      isDisabledWhenQueueIsEmpty: false
    },
    {
      buttonFunction: actions.togglePauseWhenHidden,
      buttonText: `Hold All Sounds While Hidden: ${settings.pauseWhenHidden ? 'On' : 'Off'}`,
      buttonType: settings.pauseWhenHidden ? 'resume' : 'default',
      codeExample: `// On: everything pauses when the
// tab is hidden or the phone locks,
// and resumes when you come back.
// Off: keeps playing; use the
// lock screen controls.
setQueueConfig({
  pauseWhenHidden: ${settings.pauseWhenHidden}
});`,
      isDisabledWhenQueueIsEmpty: false
    }
  ];
}

function spriteExamples(): Example[] {
  return [
    {
      buttonFunction: (): void => {
        void preloadAudio(announcerSpriteSource).then(([result]) => {
          if (result?.ok) log(`Sprite preloaded: ${Math.round(result.bytes / 1024)} KB, now plays from memory`);
          else log('Preload failed, the sprite will stream:', result?.error?.message);
          log('isAudioPreloaded:', isAudioPreloaded(announcerSpriteSource));
        });
      },
      buttonText: 'Preload The Sprite Into Memory (Channel 0)',
      buttonType: 'default',
      codeExample: `// Instant starts, works offline, and
// seeks even without Range support
const [result] = await preloadAudio(spriteUrl);
console.log(result.ok, result.bytes);

// Later: free the memory
releasePreloadedAudio(spriteUrl);`,
      isDisabledWhenQueueIsEmpty: false
    },
    {
      buttonFunction: (): void => {
        const line: AnnouncerLine = randomLine();
        announcer.play(line, 0, { cues: announcerCues }).catch((error: unknown) => log('Could not queue:', error));
      },
      buttonText: 'Play A Random Line From The Sprite (Channel 0)',
      buttonType: 'default',
      codeExample: `// One file, nine sounds
const announcer = defineSprite(spriteUrl, {
  blueWins: [5000, 6330],
  oneMinute: [10000, 11100],
  // ...
});

// Captions from a WebVTT file
const cues = parseWebVtt(vttText);
await announcer.play('oneMinute', 0, { cues });`,
      isDisabledWhenQueueIsEmpty: false
    },
    {
      buttonFunction: (): void => {
        (['oneMinute', 'redCaptured', 'blueWins'] as const).forEach((line) => {
          void announcer.play(line, 0, { cues: announcerCues });
        });
      },
      buttonText: 'Queue Three Lines (Channel 0)',
      buttonType: 'default',
      codeExample: `await announcer.play('oneMinute', 0, { cues });
await announcer.play('redCaptured', 0, { cues });
await announcer.play('blueWins', 0, { cues });`,
      isDisabledWhenQueueIsEmpty: false
    },
    {
      buttonFunction: (): void => void stopAllAudioInChannel(0),
      buttonText: 'Stop Lines (Channel 0)',
      buttonType: 'default',
      codeExample: 'await stopAllAudioInChannel(0);',
      isDisabledWhenQueueIsEmpty: true
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
      codeExample: `// Point cues (no endMs) fire once
// each time playback passes them
await queueAudio(music, 1, {
  cues: [{ startMs: 30000, data: { beat: 0 } }, ...],
  endAt: 34000,
  loop: true,
  startAt: 30000
});`,
      isDisabledWhenChannelPlaying: true,
      isDisabledWhenQueueIsEmpty: false
    },
    {
      buttonFunction: (): void => void stopAllAudioInChannel(1),
      buttonText: 'Stop Segment (Channel 1)',
      buttonType: 'default',
      codeExample: 'await stopAllAudioInChannel(1);',
      isDisabledWhenQueueIsEmpty: true
    }
  ];
}

function notificationExamples(): Example[] {
  return [
    {
      buttonFunction: (): void => {
        void queueAudio(laserGunFiring, 0, { dedupeMs: 1000, volume: 0.6 }).then((item) => {
          logCompletion(`Laser #${item.id}`, item.finished);
        });
      },
      buttonText: 'Tap Fast: Laser With 1 s Dedupe (Channel 0)',
      buttonType: 'default',
      codeExample: `// Repeats of the same sound within
// 1 s are ignored
const item = await queueAudio(laser, 0, {
  dedupeMs: 1000,
  volume: 0.6
});
console.log(await item.finished);
// 'ended' | 'skipped' | 'stopped' | ...`,
      isDisabledWhenQueueIsEmpty: false
    },
    {
      buttonFunction: (): void => {
        void queueAudio(createBeep(880, 250), 0, { interrupt: true, metadata: { title: 'Generated beep (880 Hz)' } });
      },
      buttonText: 'Generated Beep From A Blob (Channel 0)',
      buttonType: 'default',
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
      isDisabledWhenQueueIsEmpty: false
    },
    {
      buttonFunction: (): void => {
        const line: AnnouncerLine = randomLine();
        void announcer.play(line, 1, { cues: announcerCues, interrupt: true }).then((item) => logCompletion(line, item.finished));
      },
      buttonText: 'Newest Announcement Wins (Channel 1)',
      buttonType: 'priority',
      codeExample: `// Stops what is playing and clears
// the queue, then plays this
await queueAudio(announcement, 1, {
  interrupt: true
});`,
      isDisabledWhenQueueIsEmpty: false
    },
    {
      buttonFunction: (): void => {
        const line: AnnouncerLine = randomLine();
        void announcer.play(line, 1, { cues: announcerCues, maxQueueSize: 2 }).catch((error: Error) => log('Rejected:', error.message));
      },
      buttonText: 'Queue Up To 2 Announcements (Channel 1)',
      buttonType: 'default',
      codeExample: `// Rejects once 2 are queued
try {
  await queueAudio(announcement, 1, {
    maxQueueSize: 2
  });
} catch (error) {
  console.log('Rejected:', error.message);
}`,
      isDisabledWhenQueueIsEmpty: false
    }
  ];
}

/** Examples for the tabs that show what is new in AudioQ 3. */
export function createV3Examples(settings: PlaylistSettings, actions: PlaylistSettingsActions): Record<string, Example[]> {
  return {
    [ExampleTabs.PLAYLIST]: playlistExamples(settings, actions),
    [ExampleTabs.SPRITES_CAPTIONS]: spriteExamples(),
    [ExampleTabs.NOTIFICATIONS]: notificationExamples()
  };
}

/** Ducking for the Playlist tab, so announcements lower the music. */
export function setPlaylistDucking(enabled: boolean): void {
  if (enabled) setVolumeDucking({ duckingVolume: 0.3, priorityChannel: 1, priorityVolume: 1 });
  else clearVolumeDucking();
}
