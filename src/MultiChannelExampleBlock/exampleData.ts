import { clearVolumeDucking, QueueItem, QueueManipulationResult, setVolumeDucking, togglePauseChannel, VolumeConfig } from 'audioq';
import { longTeleportation } from '../audio/audioFilesAndUtils';
import { showDebugConsole } from '../DebugConsole/DebugConsole';
import { Example, FadeOption } from '../types';
import { ExampleTabs } from '../types';

type HandleAudioAndVisualizer = (
  fileName: string,
  channelNumber: number,
  queueFunction: (url: string, channelNumber: number, options?: Record<string, unknown>) => unknown,
  isLooping?: boolean
) => void;

/** The Audio Ducking tab's settings: music on channel 0 drops to 25% while voice plays on channel 1. */
export const DEMO_DUCKING: VolumeConfig = {
  duckingVolume: 0.25,
  priorityChannel: 1,
  priorityVolume: 1
};

type PauseAction = 'pause' | 'resume' | 'toggle';

const PLAIN_CALLS: Record<PauseAction, string> = {
  pause: 'pauseChannel',
  resume: 'resumeChannel',
  toggle: 'togglePauseChannel'
};
const PLAIN_ALL_CALLS: Record<PauseAction, string> = {
  pause: 'pauseAllChannels',
  resume: 'resumeAllChannels',
  toggle: 'togglePauseAllChannels'
};
const FADE_CALLS: Record<PauseAction, string> = {
  pause: 'pauseWithFade',
  resume: 'resumeWithFade',
  toggle: 'togglePauseWithFade'
};
const FADE_ALL_CALLS: Record<PauseAction, string> = {
  pause: 'pauseAllWithFade',
  resume: 'resumeAllWithFade',
  toggle: 'togglePauseAllWithFade'
};

export function createExamples(
  handleAudioAndVisualizer: HandleAudioAndVisualizer,
  queueAudio: (url: string, channelNumber?: number, options?: Record<string, unknown>) => Promise<unknown>,
  stopCurrentAudioInChannel: (channelNumber?: number) => Promise<void>,
  stopAllAudioInChannel: (channelNumber?: number) => Promise<void>,
  stopAllAudio: () => Promise<void>,
  pauseChannelWithFade: (channelNumber?: number) => Promise<void>,
  resumeChannelWithFade: (channelNumber?: number) => Promise<void>,
  togglePauseChannelWithFade: (channelNumber?: number) => Promise<void>,
  pauseAllChannelsWithFade: () => Promise<void>,
  resumeAllChannelsWithFade: () => Promise<void>,
  togglePauseAllChannelsWithFade: () => Promise<void>,
  queueAudioPriority: (url: string, channelNumber?: number, options?: Record<string, unknown>) => Promise<unknown>,
  getRandomAudioFile: (files: string[]) => string,
  audioFilesVocalExamples: string[],
  audioFilesSoundEffectExamples: string[],
  backgroundMusic: string,
  selectedFadeOption: FadeOption,
  clearQueueAfterCurrent: (channelNumber?: number) => Promise<QueueManipulationResult>,
  getQueueItemInfo: (queuedSlotNumber: number, channelNumber?: number) => QueueItem | null,
  getQueueLength: (channelNumber?: number) => number,
  isDuckingEnabled: boolean,
  setIsDuckingEnabled: (enabled: boolean) => void
): Record<string, Example[]> {
  /**
   * The code shown for a pause, resume or toggle button: plain or with the selected fade, for one
   * channel (the default channel when omitted) or for all channels.
   */
  const getFadeCodeExample = (action: PauseAction, channel?: 0 | 1 | 'all'): string => {
    if (selectedFadeOption === 'None') {
      if (channel === 'all') return `await ${PLAIN_ALL_CALLS[action]}();`;
      return `await ${PLAIN_CALLS[action]}(${channel ?? 0});`;
    }
    const fadeType: string = `FadeType.${selectedFadeOption.charAt(0).toUpperCase() + selectedFadeOption.slice(1)}`;
    // Resuming reuses the fade of the pause, so the examples leave the fade type out.
    if (channel === 'all') {
      return action === 'resume' ? 'await resumeAllWithFade();' : `await ${FADE_ALL_CALLS[action]}(\n  ${fadeType}\n);`;
    }
    if (channel === undefined) {
      return action === 'resume' ? 'await resumeWithFade();' : `await ${FADE_CALLS[action]}(\n  ${fadeType}\n);`;
    }
    return `await ${FADE_CALLS[action]}(\n  ${fadeType}, ${channel}\n);`;
  };

  return {
    [ExampleTabs.ADVANCED_QUEUE_MANIPULATION]: [
      // Channel 0: Basic queue setup for advanced manipulation
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 0, queueAudio);
        },
        buttonText: 'Add Sound To Queue (Channel 0)',
        buttonType: 'default',
        channel: 0,
        codeExample: `await queueAudio(audioFile);`,
        enabledWhen: 'always'
      },
      {
        buttonFunction: (): void => {
          void togglePauseChannelWithFade(0);
        },
        buttonText: 'Toggle Pause (Channel 0)',
        buttonType: 'default',
        channel: 0,
        codeExample: getFadeCodeExample('toggle', 0),
        enabledWhen: 'hasAudio'
      },
      {
        buttonFunction: async (): Promise<void> => {
          const queueLength: number = getQueueLength(0);
          if (queueLength >= 2) {
            await clearQueueAfterCurrent(0);
          }
        },
        buttonText: 'Clear All After Current (Channel 0)',
        buttonType: 'default',
        channel: 0,
        codeExample: `await clearQueueAfterCurrent();`,
        enabledWhen: 'hasAudio',
        minQueueLength: 2
      },
      // Channel 1: Similar setup for advanced manipulation
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesSoundEffectExamples);
          handleAudioAndVisualizer(fileName, 1, queueAudio);
        },
        buttonText: 'Add Sound To Queue (Channel 1)',
        buttonType: 'default',
        channel: 1,
        codeExample: `await queueAudio(soundEffect, 1);`,
        enabledWhen: 'always'
      },
      {
        buttonFunction: (): void => {
          void togglePauseChannelWithFade(1);
        },
        buttonText: 'Toggle Pause (Channel 1)',
        buttonType: 'default',
        channel: 1,
        codeExample: getFadeCodeExample('toggle', 1),
        enabledWhen: 'hasAudio'
      },
      {
        buttonFunction: async (): Promise<void> => {
          const queueLength: number = getQueueLength(1);
          if (queueLength >= 2) {
            await clearQueueAfterCurrent(1);
          }
        },
        buttonText: 'Clear All After Current (Channel 1)',
        buttonType: 'default',
        channel: 1,
        codeExample: `await clearQueueAfterCurrent(1);`,
        enabledWhen: 'hasAudio',
        minQueueLength: 2
      },
      // Utility examples
      {
        buttonFunction: (): void => {
          // eslint-disable-next-line no-console
          console.log('Queue lengths:', { channel0: getQueueLength(0), channel1: getQueueLength(1) });
          // eslint-disable-next-line no-console
          console.log('Next item on each channel:', { channel0: getQueueItemInfo(1, 0), channel1: getQueueItemInfo(1, 1) });
          showDebugConsole();
        },
        buttonText: 'Log Queue Details (Opens The Debug Console)',
        buttonType: 'default',
        channel: 'global',
        codeExample: `// Reading the queue
getQueueLength(0); // items on channel 0
getQueueItemInfo(1, 0); // next item on channel 0

// Rearranging calls return a result:
// { success, error?, updatedQueue? }
const result = await removeQueuedItem(1, 0);
if (!result.success) console.log(result.error);`,
        enabledWhen: 'always'
      }
    ],
    [ExampleTabs.AUDIO_DUCKING]: [
      // Volume ducking toggle button
      {
        buttonFunction: (): void => {
          const newDuckingState: boolean = !isDuckingEnabled;
          setIsDuckingEnabled(newDuckingState);

          if (newDuckingState) {
            setVolumeDucking(DEMO_DUCKING);
          } else {
            clearVolumeDucking();
          }
        },
        buttonText: `${isDuckingEnabled ? '🔇 Disable' : '🔊 Enable'} Volume Ducking (Channel 1 Currently ${isDuckingEnabled ? 'On' : 'Off'})`,
        buttonType: isDuckingEnabled ? 'resume' : 'priority',
        channel: 1,
        codeExample: isDuckingEnabled
          ? `// Currently ON - Disable ducking
clearVolumeDucking();`
          : `// Currently OFF - Enable ducking  
setVolumeDucking({
  // Duck to 25%
  duckingVolume: 0.25,
  // Channel 1 priority
  priorityChannel: 1,
  // Voice at 100%
  priorityVolume: 1.0
});`,
        enabledWhen: 'idle'
      },
      // Channel 0: Background music with looping and pause toggle
      {
        buttonFunction: (): void => {
          handleAudioAndVisualizer(backgroundMusic, 0, (url: string, channel: number) => queueAudio(url, channel, { loop: true }), true);
        },
        buttonText: 'Start Background Music (Channel 0)',
        buttonType: 'default',
        channel: 0,
        codeExample: `// Start background music -
// will auto-duck when channel 1 
// plays if ducking enabled
await queueAudio(backgroundMusic, 0, {
  loop: true
});`,
        enabledWhen: 'idle'
      },
      {
        buttonFunction: (): void => {
          void togglePauseChannelWithFade();
        },
        buttonText: 'Toggle Music Pause (Channel 0)',
        buttonType: 'default',
        channel: 0,
        codeExample: getFadeCodeExample('toggle'),
        enabledWhen: 'hasAudio'
      },
      // Channel 1: Voice/dialogue that automatically ducks the music (if enabled)
      {
        buttonFunction: (): void => {
          // Simply queue audio - ducking happens automatically if enabled!
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 1, queueAudio);
        },
        buttonText: 'Play Voice Audio (Channel 1)',
        buttonType: 'default',
        channel: 1,
        codeExample: `// Just queue voice audio normally -
// Background music will 
// automatically duck/restore
// if volume ducking is enabled
await queueAudio(voiceAudio, 1);

// You can queue multiple voices!
// Ducking stays active until 
// channel 1 is empty
await queueAudio(anotherVoice, 1);
await queueAudio(thirdVoice, 1);`,
        enabledWhen: 'always'
      }
    ],
    [ExampleTabs.AUDIO_INFO]: [
      // Channel 0 examples for audio info
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 0, queueAudio);
        },
        buttonText: 'Add Sound To Queue (Channel 0)',
        buttonType: 'default',
        channel: 0,
        codeExample: `// Add audio to channel 0
await queueAudio(audioFile, 0);

// Get current audio info
const info = getCurrentAudioInfo();
console.log('Current audio:', info);

// Get queue snapshot
const snapshot = getQueueSnapshot();
console.log('Queue:', snapshot);`,
        enabledWhen: 'always'
      },
      {
        buttonFunction: (): void => {
          void togglePauseChannel();
        },
        buttonText: 'Toggle Pause (Channel 0)',
        buttonType: 'default',
        channel: 0,
        codeExample: getFadeCodeExample('toggle'),
        enabledWhen: 'hasAudio'
      },
      // Channel 1 examples for audio info
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesSoundEffectExamples);
          handleAudioAndVisualizer(fileName, 1, queueAudio);
        },
        buttonText: 'Add Sound To Queue (Channel 1)',
        buttonType: 'default',
        channel: 1,
        codeExample: `// Add audio to channel 1
await queueAudio(audioFile, 1);

// Get current audio info
const info = getCurrentAudioInfo(1);
console.log('Current audio:', info);

// Get queue snapshot
const snapshot = getQueueSnapshot(1);
console.log('Queue:', snapshot);
`,
        enabledWhen: 'always'
      },
      {
        buttonFunction: (): void => {
          void togglePauseChannel(1);
        },
        buttonText: 'Toggle Pause (Channel 1)',
        buttonType: 'default',
        channel: 1,
        codeExample: getFadeCodeExample('toggle', 1),
        enabledWhen: 'hasAudio'
      }
    ],
    [ExampleTabs.PAUSE_RESUME]: [
      // First add some basic queue buttons so users can add sounds to test pause/resume
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 0, queueAudio);
        },
        buttonText: 'Add Sound To Queue (Channel 0)',
        buttonType: 'default',
        channel: 0,
        codeExample: 'await queueAudio(audioFile);',
        enabledWhen: 'always'
      },
      {
        // Use background music specifically for Pause & Resume Channel 1
        buttonFunction: (): void => {
          handleAudioAndVisualizer(backgroundMusic, 1, queueAudio);
        },
        buttonText: 'Add Sound To Queue (Channel 1)',
        buttonType: 'default',
        channel: 1,
        codeExample: 'await queueAudio(audioFile, 1);',
        enabledWhen: 'always'
      },
      // Channel 0 pause/resume
      {
        buttonFunction: (): void => {
          void pauseChannelWithFade();
        },
        buttonText: 'Pause Channel 0',
        buttonType: 'pause',
        channel: 0,
        codeExample: getFadeCodeExample('pause'),
        enabledWhen: 'playing'
      },
      {
        buttonFunction: (): void => {
          void resumeChannelWithFade();
        },
        buttonText: 'Resume Channel 0',
        buttonType: 'resume',
        channel: 0,
        codeExample: getFadeCodeExample('resume'),
        enabledWhen: 'paused'
      },
      {
        buttonFunction: (): void => {
          void togglePauseChannelWithFade();
        },
        buttonText: 'Toggle Pause Channel 0',
        buttonType: 'default',
        channel: 0,
        codeExample: getFadeCodeExample('toggle'),
        enabledWhen: 'hasAudio'
      },
      // Channel 1 pause/resume
      {
        buttonFunction: (): void => {
          void pauseChannelWithFade(1);
        },
        buttonText: 'Pause Channel 1',
        buttonType: 'pause',
        channel: 1,
        codeExample: getFadeCodeExample('pause', 1),
        enabledWhen: 'playing'
      },
      {
        buttonFunction: (): void => {
          void resumeChannelWithFade(1);
        },
        buttonText: 'Resume Channel 1',
        buttonType: 'resume',
        channel: 1,
        codeExample: getFadeCodeExample('resume', 1),
        enabledWhen: 'paused'
      },
      {
        buttonFunction: (): void => {
          void togglePauseChannelWithFade(1);
        },
        buttonText: 'Toggle Pause Channel 1',
        buttonType: 'default',
        channel: 1,
        codeExample: getFadeCodeExample('toggle', 1),
        enabledWhen: 'hasAudio'
      },
      // Global pause/resume
      {
        buttonFunction: (): void => {
          void pauseAllChannelsWithFade();
        },
        buttonText: 'Pause All Channels',
        buttonType: 'pause',
        channel: 'global',
        codeExample: getFadeCodeExample('pause', 'all'),
        enabledWhen: 'playing'
      },
      {
        buttonFunction: (): void => {
          void resumeAllChannelsWithFade();
        },
        buttonText: 'Resume All Channels',
        buttonType: 'resume',
        channel: 'global',
        codeExample: getFadeCodeExample('resume', 'all'),
        enabledWhen: 'paused'
      },
      {
        buttonFunction: togglePauseAllChannelsWithFade,
        buttonText: 'Toggle All Channels',
        buttonType: 'default',
        channel: 'global',
        codeExample: getFadeCodeExample('toggle', 'all'),
        enabledWhen: 'hasAudio'
      }
    ],
    [ExampleTabs.PRIORITY_SOUNDS]: [
      // Channel 0 examples
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 0, queueAudio);
        },
        buttonText: 'Add Sound To End Of Queue (Channel 0)',
        buttonType: 'default',
        channel: 0,
        codeExample: 'await queueAudio(audioFile);',
        enabledWhen: 'always'
      },
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 0, queueAudioPriority);
        },
        buttonText: 'Add Priority Sound (Channel 0)',
        buttonType: 'priority',
        channel: 0,
        codeExample: 'await queueAudioPriority(audioFile);',
        enabledWhen: 'always'
      },
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 0, queueAudioPriority);
          void stopCurrentAudioInChannel();
        },
        buttonText: 'Interrupt And Add Priority Sound (Channel 0)',
        buttonType: 'priority',
        channel: 0,
        codeExample: `await queueAudioPriority(audioFile);
await stopCurrentAudioInChannel();`,
        enabledWhen: 'hasAudio'
      },
      // Channel 1 examples
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesSoundEffectExamples);
          handleAudioAndVisualizer(fileName, 1, queueAudio);
        },
        buttonText: 'Add Sound To End Of Queue (Channel 1)',
        buttonType: 'default',
        channel: 1,
        codeExample: 'await queueAudio(audioFile, 1);',
        enabledWhen: 'always'
      },
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesSoundEffectExamples);
          handleAudioAndVisualizer(fileName, 1, queueAudioPriority);
        },
        buttonText: 'Add Priority Sound (Channel 1)',
        buttonType: 'priority',
        channel: 1,
        codeExample: 'await queueAudioPriority(audioFile, 1);',
        enabledWhen: 'always'
      },
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesSoundEffectExamples);
          handleAudioAndVisualizer(fileName, 1, queueAudioPriority);
          void stopCurrentAudioInChannel(1);
        },
        buttonText: 'Interrupt And Add Priority Sound (Channel 1)',
        buttonType: 'priority',
        channel: 1,
        codeExample: `await queueAudioPriority(audioFile, 1);
await stopCurrentAudioInChannel(1);`,
        enabledWhen: 'hasAudio'
      }
    ],
    [ExampleTabs.QUEUE_MANAGEMENT]: [
      // Channel 0 examples
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesVocalExamples);
          handleAudioAndVisualizer(fileName, 0, queueAudio);
        },
        buttonText: 'Add Sound To End Of Queue (Channel 0)',
        buttonType: 'default',
        channel: 0,
        codeExample: 'await queueAudio(audioFile);',
        enabledWhen: 'always'
      },
      {
        buttonFunction: (): Promise<void> => stopCurrentAudioInChannel(),
        buttonText: 'Stop Current Sound (Channel 0)',
        buttonType: 'default',
        channel: 0,
        codeExample: 'await stopCurrentAudioInChannel();',
        enabledWhen: 'hasAudio'
      },
      {
        buttonFunction: (): Promise<void> => stopAllAudioInChannel(),
        buttonText: 'Stop All Sounds In Queue (Channel 0)',
        buttonType: 'default',
        channel: 0,
        codeExample: 'await stopAllAudioInChannel();',
        enabledWhen: 'hasAudio'
      },
      // Channel 1 examples
      {
        buttonFunction: (): void => {
          const fileName: string = getRandomAudioFile(audioFilesSoundEffectExamples);
          handleAudioAndVisualizer(fileName, 1, queueAudio);
        },
        buttonText: 'Add Sound To End Of Queue (Channel 1)',
        buttonType: 'default',
        channel: 1,
        codeExample: 'await queueAudio(audioFile, 1);',
        enabledWhen: 'always'
      },
      {
        buttonFunction: (): Promise<void> => stopCurrentAudioInChannel(1),
        buttonText: 'Stop Current Sound (Channel 1)',
        buttonType: 'default',
        channel: 1,
        codeExample: 'await stopCurrentAudioInChannel(1);',
        enabledWhen: 'hasAudio'
      },
      {
        buttonFunction: (): Promise<void> => stopAllAudioInChannel(1),
        buttonText: 'Stop All Sounds In Queue (Channel 1)',
        buttonType: 'default',
        channel: 1,
        codeExample: 'await stopAllAudioInChannel(1);',
        enabledWhen: 'hasAudio'
      },
      // Global example
      {
        buttonFunction: (): Promise<void> => stopAllAudio(),
        buttonText: 'Stop All Sounds In All Channels',
        buttonType: 'default',
        channel: 'global',
        codeExample: 'await stopAllAudio();',
        enabledWhen: 'hasAudio'
      }
    ],
    [ExampleTabs.VOLUME_LOOPING]: [
      // Add specific looping sounds for volume demonstration
      {
        buttonFunction: (): void => {
          // A long sound (14 s teleportation hum) so there is time to try the volume sliders
          handleAudioAndVisualizer(longTeleportation, 0, (url: string, channel: number) => queueAudio(url, channel, { loop: true }), true); // Pass isLooping = true
        },
        buttonText: 'Start Looping Audio (Channel 0)',
        buttonType: 'default',
        channel: 0,
        codeExample: `await queueAudio(audioFile, 0, {
  loop: true
});`,
        enabledWhen: 'idle'
      },
      {
        buttonFunction: (): Promise<void> => stopAllAudioInChannel(),
        buttonText: 'Stop Channel 0',
        buttonType: 'default',
        channel: 0,
        codeExample: 'await stopAllAudioInChannel();',
        enabledWhen: 'hasAudio'
      },
      // Channel 1 looping audio
      {
        buttonFunction: (): void => {
          // Use background music for Channel 1 volume demonstration
          handleAudioAndVisualizer(backgroundMusic, 1, (url: string, channel: number) => queueAudio(url, channel, { loop: true }), true); // Pass isLooping = true
        },
        buttonText: 'Start Looping Audio (Channel 1)',
        buttonType: 'default',
        channel: 1,
        codeExample: `await queueAudio(audioFile, 1, {
  loop: true
});`,
        enabledWhen: 'idle'
      },
      {
        buttonFunction: (): Promise<void> => stopAllAudioInChannel(1),
        buttonText: 'Stop Channel 1',
        buttonType: 'default',
        channel: 1,
        codeExample: 'await stopAllAudioInChannel(1);',
        enabledWhen: 'hasAudio'
      }
    ]
  };
}
