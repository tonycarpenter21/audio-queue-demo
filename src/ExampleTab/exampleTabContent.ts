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
      'Audio ducking lowers other channels while a priority channel plays: here the background music drops to 25% whenever a voice line plays on Channel 1. It is on when you open this tab; turn it off to compare.',
      'Start the background music on Channel 0, then play voice lines on Channel 1 to hear the ducking effect.',
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
  [ExampleTabs.PAUSE_RESUME]: {
    description: [
      'This example demonstrates the new pause and resume functionality for fine-grained audio control.',
      'You can pause individual channels or all channels at once, and resume them later without losing your place in the audio.',
      'Toggle pause provides a convenient way to pause/resume with a single button press.'
    ]
  },
  [ExampleTabs.PLAYBACK]: {
    description: [
      'Queue the playlist on Channel 0, then lock your phone or use your keyboard media keys: connectMediaSession() puts the title and artwork on the lock screen and makes its buttons control the channel.',
      'Skip back and forward and change the speed (the pitch stays the same). The panel shows the position live.',
      'Play an announcement on Channel 1 and the music ducks under it. By default sound keeps playing when you switch apps; turn on "Hold All Sounds While Hidden" to pause instead.'
    ]
  },
  [ExampleTabs.PLAYLIST]: {
    description: [
      'Queue four tracks on Channel 0, then change how the queue plays: repeat one or all, shuffle what is coming up, add a gap of silence or crossfade from one track into the next.',
      'The panel below shows the current track and the history of finished ones (getHistory), with why each one ended and how long it played.'
    ]
  },
  [ExampleTabs.PRIORITY_SOUNDS]: {
    description: [
      'This example demonstrates how to add priority sounds to the audio queue.',
      'Priority sounds will queue after the currently playing sound.',
      'To test this functionality, click the "Add Priority Sound" button to add a priority sound to the queue.'
    ]
  },
  [ExampleTabs.QUEUE_MANAGEMENT]: {
    description: [
      'This example shows how to add and remove audio files from queues. Channel-specific controls let you manage each audio channel independently.',
      'Audio files will never overlap within their given channel. Use different channels when you want audio to play simultaneously.',
      'To test this functionality, click the "Add Sound" buttons to queue audio, then use the stop controls to manage playback.'
    ]
  },
  [ExampleTabs.SPRITES_CAPTIONS]: {
    description: [
      'An audio sprite is one audio file holding many short sounds back to back, like a sprite sheet of images in a game. Here all nine announcer lines are one file: defineSprite() names where each line starts and ends, and play("oneMinute") plays just that part. One download instead of nine, and every sound is ready once it has loaded (preload it to keep it in memory).',
      'The captions come from a WebVTT (.vtt) file: the standard caption format for web video, a text file listing each line with its start and end time. It is not generated from the audio: you write it, or export it from a transcription tool, and ship it next to the audio file. parseWebVtt() turns it into cues, and onAudioCue() reports each caption as it starts and ends.'
    ]
  },
  [ExampleTabs.VISUALIZER]: {
    description: [
      'getChannelAnalyser() returns a standard Web Audio AnalyserNode for a channel, measuring what you actually hear after volume, fades and panning. Read frequency data from it every frame to draw bars, meters or waveforms.',
      'Play music on Channel 0 and lasers or announcements on Channel 1: the panel shows each channel and both together (a plain AnalyserNode that both channel analysers feed).'
    ]
  },
  [ExampleTabs.VOLUME_LOOPING]: {
    description: [
      'Control the volume of individual channels, all channels simultaneously, and global volume using the volume sliders below.',
      'This example uses looping audio files to demonstrate volume control - you can adjust levels while audio is playing.',
      'Start the looping audio, then use pause/resume controls and volume sliders to test different volume levels.'
    ]
  }
};
