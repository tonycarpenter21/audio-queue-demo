import React, { useCallback, useEffect, useState } from 'react';
import {
  getCurrentAudioInfo,
  getQueueSnapshot,
  onAudioProgress,
  offAudioProgress,
  cleanWebpackFilename,
  QueueSnapshot
} from 'audio-channel-queue';
import './ChannelAudioInfo.css';

// Using types from audio-channel-queue package
interface AudioInfo {
  currentTime: number;
  duration: number;
  fileName: string;
  isLooping: boolean;
  isPaused: boolean;
  isPlaying: boolean;
  progress: number;
  src: string;
  volume: number;
}

interface ChannelAudioInfoProps {
  channelNumber: number;
}

const ChannelAudioInfo: React.FC<ChannelAudioInfoProps> = ({ channelNumber }) => {
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null);
  const [queueInfo, setQueueInfo] = useState<QueueSnapshot | null>(null);

  const updateAudioInfo = useCallback((): void => {
    // Get current audio info for this channel
    const info: AudioInfo | null = getCurrentAudioInfo(channelNumber);
    setAudioInfo(info);

    // Get queue snapshot for this channel
    const queue: QueueSnapshot | null = getQueueSnapshot(channelNumber);
    setQueueInfo(queue);
  }, [channelNumber]);

  // Set up progress listener for real-time updates
  useEffect(() => {
    const handleProgress = (info: AudioInfo): void => {
      setAudioInfo(info);
      updateAudioInfo();
    };

    // Subscribe to progress updates
    onAudioProgress(channelNumber, handleProgress);

    // Initial update
    updateAudioInfo();

    // Set up interval for regular updates (fallback)
    const interval: NodeJS.Timeout = setInterval(updateAudioInfo, 1000);

    return (): void => {
      // Clean up listener and interval
      offAudioProgress(channelNumber);
      clearInterval(interval);
    };
  }, [channelNumber, updateAudioInfo]);

  const formatTime = (milliseconds: number): string => {
    if (!milliseconds || milliseconds === 0) return '0:00';

    const totalSeconds: number = Math.floor(milliseconds / 1000);
    const minutes: number = Math.floor(totalSeconds / 60);
    const seconds: number = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatProgress = (progress: number): string => {
    return `${Math.round(progress * 100)}%`;
  };

  return (
    <div className="channel-audio-info">
      <div className="info-header">📊 Audio Info</div>

      <div className="current-audio">
        <div className="info-row">
          <span className="info-label">Status:</span>
          <span className={`status-badge ${audioInfo?.isPlaying ? 'playing' : audioInfo?.isPaused ? 'paused' : 'stopped'}`}>
            {audioInfo?.isPlaying ? '▶️ Playing' : audioInfo?.isPaused ? '⏸️ Paused' : '⏹️ Stopped'}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">File:</span>
          <span className="file-name" title={audioInfo ? cleanWebpackFilename(audioInfo.fileName) : 'No file'}>
            {audioInfo ? cleanWebpackFilename(audioInfo.fileName) : 'No file'}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Progress:</span>
          <div className="progress-container">
            <div className="mini-progress-bar">
              <div className="mini-progress-fill" style={{ width: formatProgress(audioInfo?.progress || 0) }} />
            </div>
            <span className="progress-percentage">{formatProgress(audioInfo?.progress || 0)}</span>
          </div>
        </div>

        <div className="info-row">
          <span className="info-label">Time:</span>
          <span className="time-display">
            {formatTime(audioInfo?.currentTime || 0)} / {formatTime(audioInfo?.duration || 0)}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Volume:</span>
          <span className="volume-display">{Math.round((audioInfo?.volume || 0) * 100)}%</span>
          {audioInfo?.isLooping && <span className="loop-badge">🔄</span>}
        </div>

        <div className="info-row">
          <span className="info-label">Items:</span>
          <span className="volume-display">{queueInfo?.totalItems || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default ChannelAudioInfo;
