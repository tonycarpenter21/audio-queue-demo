import React from 'react';
import { displayName } from '../audio/displayName';
import { useChannel } from '../hooks/useChannel';
import './ChannelAudioInfo.css';

const STATUS_LABELS = { paused: '⏸️ Paused', playing: '▶️ Playing', stopped: '⏹️ Stopped' } as const;

interface ChannelAudioInfoProps {
  channelNumber: number;
}

const ChannelAudioInfo: React.FC<ChannelAudioInfoProps> = ({ channelNumber }) => {
  // Live channel state from createChannelStore: no polling, no manual listeners
  const { current: audioInfo, items } = useChannel(channelNumber);
  const status: keyof typeof STATUS_LABELS =
    audioInfo === null ? 'stopped' : audioInfo.isPlaying ? 'playing' : audioInfo.isPaused ? 'paused' : 'stopped';

  const formatTime = (milliseconds: number): string => {
    if (!Number.isFinite(milliseconds) || milliseconds <= 0) return '0:00';

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
          <span className={`status-badge ${status}`}>{STATUS_LABELS[status]}</span>
        </div>

        <div className="info-row">
          <span className="info-label">File:</span>
          <span className="file-name" title={audioInfo ? displayName(audioInfo.fileName) : 'No file'}>
            {audioInfo ? displayName(audioInfo.fileName) : 'No file'}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Progress:</span>
          <div className="progress-container">
            <div className="mini-progress-bar">
              <div className="mini-progress-fill" style={{ width: formatProgress(audioInfo?.progress ?? 0) }} />
            </div>
            <span className="progress-percentage">{formatProgress(audioInfo?.progress ?? 0)}</span>
          </div>
        </div>

        <div className="info-row">
          <span className="info-label">Time:</span>
          <span className="time-display">
            {formatTime(audioInfo?.currentTime ?? 0)} / {formatTime(audioInfo?.duration ?? 0)}
          </span>
        </div>

        <div className="info-row">
          <span className="info-label">Volume:</span>
          <span className="volume-display">{Math.round((audioInfo?.volume ?? 0) * 100)}%</span>
          {audioInfo?.isLooping === true && <span className="loop-badge">🔄</span>}
        </div>

        <div className="info-row">
          <span className="info-label">Items:</span>
          <span className="volume-display">{items.length}</span>
        </div>
      </div>
    </div>
  );
};

export default ChannelAudioInfo;
