import { extractFileName } from 'audioq';

// Track looping audio files per channel
const loopingAudioTracker: { [channelNumber: number]: Set<string> } = {};

export const createHandleAudioAndVisualizer = () => {
  return (
    fileName: string,
    channelNumber: number,
    queueFunction: (url: string, channelNumber: number, options?: Record<string, unknown>) => void,
    isLooping: boolean = false
  ): void => {
    // Extract the base filename for consistency with our loop tracking system
    const baseFileName: string = extractFileName(fileName);

    if (isLooping) {
      // Add to loop tracking
      if (!loopingAudioTracker[channelNumber]) {
        loopingAudioTracker[channelNumber] = new Set<string>();
      }
      loopingAudioTracker[channelNumber].add(baseFileName);
    } else {
      // Remove from loop tracking (only if the Set exists)
      if (loopingAudioTracker[channelNumber]) {
        loopingAudioTracker[channelNumber].delete(baseFileName);
      }
    }

    // The queue function handles the actual audio queueing
    // The visualizer will be updated automatically via the onQueueChange events
    queueFunction(fileName, channelNumber, isLooping ? { loop: true } : {});
  };
};

// Helper function to check if an audio file is looping
export const isAudioFileLooping = (fileName: string, channelNumber: number): boolean => {
  const baseFileName: string = extractFileName(fileName);
  const isLooping: boolean = loopingAudioTracker[channelNumber]?.has(baseFileName) || false;
  return isLooping;
};

// Helper function to clear looping tracker for a channel
export const clearLoopingTracker = (channelNumber?: number): void => {
  if (channelNumber !== undefined) {
    loopingAudioTracker[channelNumber] = new Set();
  } else {
    // Clear all channels
    Object.keys(loopingAudioTracker).forEach((channel) => {
      loopingAudioTracker[parseInt(channel)] = new Set();
    });
  }
};
