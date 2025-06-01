import { queueAudio, stopAllAudio, stopAllAudioInChannel, stopCurrentAudioInChannel } from 'audio-channel-queue';

export type AudioQueueFunction = typeof queueAudio | typeof stopCurrentAudioInChannel | typeof stopAllAudioInChannel | typeof stopAllAudio;

export interface VisualizedAudioItem {
  duration: number;
  name: string;
  startTime: number;
}

export const createHandleAudioAndVisualizer = () => {
  return (
    audioQueueFunction: AudioQueueFunction,
    channelNumber: number = 0,
    audioFile: { src: string; name: string } = {
      name: '',
      src: ''
    }
  ) => {
    return (): void => {
      if (audioQueueFunction === queueAudio) {
        // Play audio - the package will handle all sync via events
        const { src } = audioFile;
        queueAudio(src, channelNumber);
      } else if (audioQueueFunction === stopCurrentAudioInChannel) {
        // Stop current audio - package will handle sync via events
        stopCurrentAudioInChannel(channelNumber);
      } else if (audioQueueFunction === stopAllAudioInChannel) {
        // Stop all audio in channel - package will handle sync via events
        stopAllAudioInChannel(channelNumber);
      } else if (audioQueueFunction === stopAllAudio) {
        // Stop all audio - package will handle sync via events
        stopAllAudio();
      }
    };
  };
};
