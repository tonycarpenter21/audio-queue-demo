import { AudioQueueVisualizerHandle } from './AudioQueueVisualizer';
import { queueAudio, stopAllAudio, stopAllAudioInChannel, stopCurrentAudioInChannel } from './../audio';

type AudioQueueFunction = 
  | ((src: string, channelNumber?: number) => Promise<void>) 
  | ((channelNumber?: number) => void);

export interface VisualizedAudioItem {
  name: string;
  duration: number;
  startTime: number;
}

const playNextInQueue = (
  channelNumber: number,
  visualizerRef0: React.RefObject<AudioQueueVisualizerHandle>,
  visualizerRef1: React.RefObject<AudioQueueVisualizerHandle>,
  setCurrentlyPlaying: React.Dispatch<React.SetStateAction<{[channelNumber: number]: VisualizedAudioItem | null}>>,
  setQueueState: React.Dispatch<React.SetStateAction<{[channelNumber: number]: boolean}>>
) => {
  const visualizer = channelNumber === 0 ? visualizerRef0 : visualizerRef1;
  visualizer.current?.removeAudioFile();
  setCurrentlyPlaying(prevPlaying => ({ ...prevPlaying, [channelNumber]: null }));
  visualizer.current?.setPlayingState(false);

  // Check if the queue is empty after removing the current audio
  if (visualizer.current?.isQueueEmpty()) {
    setQueueState(prev => ({ ...prev, [channelNumber]: true }));
  } else {
    // If there are more items in the queue, play the next one
    const nextAudio = visualizer.current?.getNextAudio();
    if (nextAudio) {
      const newItem: VisualizedAudioItem = { 
        name: nextAudio.name, 
        duration: nextAudio.duration, 
        startTime: Date.now() 
      };
      setCurrentlyPlaying(prev => ({ ...prev, [channelNumber]: newItem }));
      visualizer.current?.setPlayingState(true);
      setTimeout(() => playNextInQueue(channelNumber, visualizerRef0, visualizerRef1, setCurrentlyPlaying, setQueueState), nextAudio.duration);
    }
  }
};

export const createHandleAudioAndVisualizer = (
  visualizerRef0: React.RefObject<AudioQueueVisualizerHandle>,
  visualizerRef1: React.RefObject<AudioQueueVisualizerHandle>,
  currentlyPlaying: {[channelNumber: number]: VisualizedAudioItem | null},
  setCurrentlyPlaying: React.Dispatch<React.SetStateAction<{[channelNumber: number]: VisualizedAudioItem | null}>>,
  setQueueState: React.Dispatch<React.SetStateAction<{[channelNumber: number]: boolean}>>
) => {
  return (
    audioQueueFunction: AudioQueueFunction,
    channelNumber: number = 0,
    audioFile: { src: string; name: string; duration: number } = {src: '', name: '', duration: 0}
  ) => {
    return () => {
      const visualizer = channelNumber === 0 ? visualizerRef0 : visualizerRef1;
      if (audioQueueFunction === queueAudio) {
        // Play audio
        const { duration, name, src } = audioFile;
        audioQueueFunction(src, channelNumber);
        
        // Update visual queue
        const newItem: VisualizedAudioItem = { name, duration, startTime: Date.now() };
        visualizer.current?.addAudioFile(name, duration);
        setQueueState(prev => ({ ...prev, [channelNumber]: false }));
        if (!currentlyPlaying[channelNumber]) {
          setCurrentlyPlaying(prev => ({ ...prev, [channelNumber]: newItem }));
          visualizer.current?.setPlayingState(true);
          setTimeout(() => playNextInQueue(channelNumber, visualizerRef0, visualizerRef1, setCurrentlyPlaying, setQueueState), duration);
        }
      } else if (audioQueueFunction === stopCurrentAudioInChannel) {
        // Play audio
        audioQueueFunction(channelNumber);

        // Update visual queue
        playNextInQueue(channelNumber, visualizerRef0, visualizerRef1, setCurrentlyPlaying, setQueueState);
      } else if (audioQueueFunction === stopAllAudioInChannel) {
        // Play audio
        audioQueueFunction(channelNumber);

        // Update visual queue
        setCurrentlyPlaying(prev => ({ ...prev, [channelNumber]: null }));
        setQueueState(prev => ({ ...prev, [channelNumber]: true }));
        visualizer.current?.clearQueue();
        visualizer.current?.setPlayingState(false);
      } else if (audioQueueFunction === stopAllAudio) {
        // Play audio
        audioQueueFunction();

        // Update visual queue
        [0, 1].forEach((channelNumber) => {
          setCurrentlyPlaying(prev => ({ ...prev, [channelNumber]: null }));
          setQueueState(prev => ({ ...prev, [channelNumber]: true }));
          const visualizer = channelNumber === 0 ? visualizerRef0 : visualizerRef1;
          visualizer.current?.clearQueue();
          visualizer.current?.setPlayingState(false);
        });
      }
    };
  };
};