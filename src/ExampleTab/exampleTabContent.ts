import { ExampleTabs } from '../types';

interface TabContentDescription {
  description: string[];
}

export const tabContentDescriptions: Record<ExampleTabs, TabContentDescription> = {
  [ExampleTabs.ADVANCED_QUEUE_MANIPULATION]: {
    description: [
      'This example demonstrates advanced queue manipulation features for precise control over audio playback order.',
      'Add multiple sounds to each channel, then use the manipulation buttons to reorder, remove, or clear queue items in real-time.',
      'Pausing the queue after adding items will make it easier to understand the queue manipulation functions.',
      'Queue items are indexed from 0 (currently playing) - you can only manipulate queued items (index 1+), not the currently playing audio.',
      'All manipulation functions return success/error results and provide updated queue snapshots for debugging and validation.',
      'More advanced functionality is available via the package such as getQueueItemInfo(),getQueueLength(), and swapQueueItems().'
    ]
  },
  [ExampleTabs.AUDIO_DUCKING]: {
    description: [
      'This example demonstrates automatic audio ducking - when sound effects play, background music volume automatically reduces to 50%.',
      'Start the background music on Channel 0, then play sound effects on Channel 1 to hear the ducking effect.',
      'The music volume will automatically restore to full volume when the sound effect completes.'
    ]
  },
  [ExampleTabs.AUDIO_INFO]: {
    description: [
      'This example demonstrates how to display real-time audio information and queue status using the audio info functions.',
      'The widget below shows live updates of current audio, progress, queue status, and channel information.',
      'Add audio to either channel using the buttons below to see the information update in real-time.'
    ]
  },
  [ExampleTabs.QUEUE_MANAGEMENT]: {
    description: [
      'This example shows how to add and remove audio files from queues. Channel-specific controls let you manage each audio channel independently.',
      'Audio files will never overlap within their given channel. Use different channels when you want audio to play simultaneously.',
      'To test this functionality, click the "Add Sound" buttons to queue audio, then use the stop controls to manage playback.'
    ]
  },
  [ExampleTabs.PAUSE_RESUME]: {
    description: [
      'This example demonstrates the new pause and resume functionality for fine-grained audio control.',
      'You can pause individual channels or all channels at once, and resume them later without losing your place in the audio.',
      'Toggle pause provides a convenient way to pause/resume with a single button press.'
    ]
  },
  [ExampleTabs.VOLUME_LOOPING]: {
    description: [
      'Control the volume of individual channels, all channels simultaneously, and global volume using the volume sliders below.',
      'This example uses looping audio files to demonstrate volume control - you can adjust levels while audio is playing.',
      'Start the looping audio, then use pause/resume controls and volume sliders to test different volume levels.'
    ]
  },
  [ExampleTabs.PLAYLIST]: {
    description: [
      'Queue the playlist on Channel 0, then lock your phone or use your keyboard media keys: connectMediaSession() puts the title and artwork on the lock screen and makes its buttons control the channel.',
      'Seek, change the speed, repeat, shuffle, add a gap or crossfade between tracks. The panel below reads position and history straight from the library.',
      'Play an announcement on Channel 1 and the music ducks under it. By default sound keeps playing when you switch apps; turn on "Hold All Sounds While Hidden" to pause instead.'
    ]
  },
  [ExampleTabs.SPRITES_CAPTIONS]: {
    description: [
      'All nine announcer lines live in one file. defineSprite() names the segments, so one download serves every sound.',
      'The captions come from a WebVTT file converted with parseWebVtt(). Cues are timed against the whole file, so each segment shows its own caption.',
      'Channel 1 loops four seconds of the music with startAt/endAt, and point cues flash on every beat.'
    ]
  },
  [ExampleTabs.NOTIFICATIONS]: {
    description: [
      'Patterns for notification sounds and voice: tap the laser button quickly and repeats within a second are ignored (dedupeMs).',
      'Blobs play like URLs; the beep is generated in the browser as a WAV file. interrupt: true makes the newest sound replace whatever is playing.',
      'maxQueueSize caps one call: once two announcements are queued, the next is rejected (see the debug console).'
    ]
  },
  [ExampleTabs.OTHER_FEATURES]: {
    description: [] // No description for this tab
  },
  [ExampleTabs.PRIORITY_SOUNDS]: {
    description: [
      'This example demonstrates how to add priority sounds to the audio queue.',
      'Priority sounds will queue after the currently playing sound.',
      'To test this functionality, click the "Add Priority Sound" button to add a priority sound to the queue.'
    ]
  }
};
