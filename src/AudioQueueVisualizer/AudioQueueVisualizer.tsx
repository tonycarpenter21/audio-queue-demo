import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import './AudioQueueVisualizer.css';

interface AudioFile {
  currentTime: number;
  duration: number;
  name: string;
}

interface AudioQueueVisualizerProps {
  channelNumber: number;
}

export interface AudioQueueVisualizerHandle {
  addAudioFile: (name: string, duration: number) => void;
  clearQueue: () => void;
  getNextAudio: () => { name: string; duration: number } | null;
  isQueueEmpty: () => boolean;
  removeAudioFile: () => void;
  setPlayingState: (playing: boolean) => void;
  updateProgress: (currentTime: number) => void;
}

const AudioQueueVisualizer = forwardRef(function AudioQueueVisualizer({ channelNumber }: AudioQueueVisualizerProps, ref) {
  const [currentPlayingPercentage, setCurrentPlayingPercentage] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<AudioFile[]>([]);

  const addAudioFile = useCallback((name: string, duration: number) => {
    setQueue((prevQueue) => [...prevQueue, { currentTime: 0, duration, name }]);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const getNextAudio = useCallback(() => {
    return queue.length > 0 ? { duration: queue[0].duration, name: queue[0].name } : null;
  }, [queue]);

  const isQueueEmpty = useCallback(() => {
    return queue.length === 0;
  }, [queue]);

  const removeAudioFile = useCallback(() => {
    setQueue((prevQueue) => prevQueue.slice(1));
  }, []);

  const setPlayingState = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  const updateProgress = (currentPercent: number): void => {
    setCurrentPlayingPercentage(currentPercent);
  };

  useImperativeHandle(ref, () => ({
    addAudioFile,
    clearQueue,
    getNextAudio,
    isQueueEmpty,
    removeAudioFile,
    setPlayingState,
    updateProgress
  }));

  return (
    <div>
      <p>Visual Queue</p>
      <p>Channel Number: {channelNumber}</p>
      <div className="audio-queue-container">
        {queue.map((file, fileIndex) => (
          <div className="audio-file" key={fileIndex}>
            {fileIndex === 0 && isPlaying && (
              <div className="audio-file-progress" style={{ width: `${currentPlayingPercentage * 100}%` }} />
            )}
            <span className="audio-file-text">{file.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default AudioQueueVisualizer;
