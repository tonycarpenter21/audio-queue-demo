import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import './AudioQueueVisualizer.css';

interface AudioFile {
  currentTime: number;
  duration: number;
  isLooping?: boolean;
  name: string;
}

interface AudioQueueVisualizerProps {
  channelNumber: number;
  enableReordering?: boolean;
  onMoveUp?: (fromIndex: number, channelNumber: number) => void;
  onMoveDown?: (fromIndex: number, channelNumber: number) => void;
  onRemoveItem?: (fromIndex: number, channelNumber: number) => void;
}

export interface AudioQueueVisualizerHandle {
  addAudioFile: (name: string, duration: number, isLooping?: boolean) => void;
  clearQueue: () => void;
  getNextAudio: () => { name: string; duration: number; isLooping?: boolean } | null;
  isQueueEmpty: () => boolean;
  removeAudioFile: () => void;
  setPlayingState: (playing: boolean) => void;
  updateCurrentFileDuration: (duration: number) => void;
  updateProgress: (currentTime: number) => void;
}

// Helper function to truncate filename while preserving extension
const truncateFilename = (filename: string, maxLength: number = 25): string => {
  if (filename.length <= maxLength) return filename;

  const parts: string[] = filename.split('.');

  if (parts.length === 1) {
    // No extension, just truncate
    return filename.substring(0, maxLength - 3) + '...';
  }

  const extension: string = parts.pop() || '';
  const nameWithoutExt: string = parts.join('.');
  const availableLength: number = maxLength - extension.length - 4; // -4 for "..." + "."

  if (availableLength <= 0) {
    return filename.substring(0, maxLength - 3) + '...';
  }

  return `${nameWithoutExt.substring(0, availableLength)}....${extension}`;
};

const AudioQueueVisualizer = forwardRef(function AudioQueueVisualizer(
  { channelNumber, enableReordering = false, onMoveUp, onMoveDown, onRemoveItem }: AudioQueueVisualizerProps,
  ref
) {
  const [currentPlayingPercentage, setCurrentPlayingPercentage] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<AudioFile[]>([]);

  const addAudioFile = useCallback((name: string, duration: number, isLooping?: boolean) => {
    setQueue((prevQueue) => [...prevQueue, { currentTime: 0, duration, isLooping, name }]);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const getNextAudio = useCallback(() => {
    return queue.length > 0 ? { duration: queue[0].duration, isLooping: queue[0].isLooping, name: queue[0].name } : null;
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

  const updateCurrentFileDuration = useCallback((duration: number) => {
    setQueue((prevQueue) => {
      if (prevQueue.length === 0) return prevQueue;

      const updatedQueue: AudioFile[] = [...prevQueue];
      updatedQueue[0] = { ...updatedQueue[0], duration };
      return updatedQueue;
    });
  }, []);

  useImperativeHandle(ref, () => ({
    addAudioFile,
    clearQueue,
    getNextAudio,
    isQueueEmpty,
    removeAudioFile,
    setPlayingState,
    updateCurrentFileDuration,
    updateProgress
  }));

  return (
    <div>
      <p>Channel {channelNumber} Visual Queue</p>
      <div className="audio-queue-container">
        {queue.map((file, fileIndex) => (
          <div className="audio-file" key={fileIndex}>
            {fileIndex === 0 && isPlaying && (
              <div className="audio-file-progress" style={{ width: `${currentPlayingPercentage * 100}%` }} />
            )}
            <span className={`audio-file-text ${enableReordering && fileIndex > 0 ? 'with-buttons' : ''}`}>
              {file.isLooping && <span>🔁 </span>}
              {truncateFilename(file.name, enableReordering && fileIndex > 0 ? 20 : 25)}
            </span>
            {enableReordering && fileIndex > 0 && (
              <div className="advanced-queue-buttons-container">
                <div className="reorder-buttons-container">
                  <button
                    className="reorder-button reorder-up"
                    disabled={fileIndex === 1}
                    onClick={() => onMoveUp?.(fileIndex, channelNumber)}
                    title="Move up in queue"
                    type="button"
                  >
                    ▲
                  </button>
                  <button
                    className="reorder-button reorder-down"
                    disabled={fileIndex === queue.length - 1}
                    onClick={() => onMoveDown?.(fileIndex, channelNumber)}
                    title="Move down in queue"
                    type="button"
                  >
                    ▼
                  </button>
                </div>
                <button
                  className="reorder-button remove-button"
                  onClick={() => onRemoveItem?.(fileIndex, channelNumber)}
                  title="Remove from queue"
                  type="button"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default AudioQueueVisualizer;
