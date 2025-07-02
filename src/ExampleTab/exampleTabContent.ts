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
      'The music volume will automatically restore to full volume when the sound effect completes.',
      'This technique is commonly used in games and interactive applications for better audio clarity.'
    ]
  },
  [ExampleTabs.AUDIO_INFO]: {
    description: [
      'This example demonstrates how to display real-time audio information and queue status using the audio info functions.',
      'The widget below shows live updates of current audio, progress, queue status, and channel information.',
      'Add audio to either channel using the buttons below to see the information update in real-time.',
      'Try different audio files, pause/resume, and queue multiple items to see how the info changes.'
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
      'Control the volume of individual channels or all channels simultaneously using the volume sliders below.',
      'This example uses looping audio files to demonstrate volume control - you can adjust levels while audio is playing.',
      'Start the looping audio, then use pause/resume controls and volume sliders to test different volume levels.',
      'Volume settings are persistent and affect all audio played on that channel.'
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
