import {
  AudioInfo,
  getCurrentAudioInfo,
  getHistory,
  HistoryEntry,
  onAudioComplete,
  onAudioProgress,
  onAudioStart,
  onQueueChange
} from 'audioq';
import { useEffect, useState } from 'react';
import { displayName } from '../audio/displayName';
import { PLAYLIST_CHANNEL } from '../hooks/usePlaylistSettings';
import { setPlaylistDucking } from '../MultiChannelExampleBlock/v3Examples';
import './V3Panels.css';

const formatTime = (ms: number): string => {
  const seconds: number = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

const titleOf = (entry: { fileName: string; metadata?: { title?: unknown } | undefined }): string =>
  typeof entry.metadata?.title === 'string' ? entry.metadata.title : displayName(entry.fileName);

/** Now playing, position and history for the playlist channel, straight from the library. */
function PlaylistPanel(): JSX.Element {
  const [info, setInfo] = useState<AudioInfo | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setPlaylistDucking(true);
    const refresh = (): void => {
      setInfo(getCurrentAudioInfo(PLAYLIST_CHANNEL));
      setHistory(getHistory(PLAYLIST_CHANNEL).slice(-5).reverse());
    };
    refresh();
    const unsubscribes = [
      onAudioProgress(PLAYLIST_CHANNEL, setInfo),
      onAudioStart(PLAYLIST_CHANNEL, refresh),
      onAudioComplete(PLAYLIST_CHANNEL, refresh),
      onQueueChange(PLAYLIST_CHANNEL, refresh)
    ];
    return (): void => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
      setPlaylistDucking(false);
    };
  }, []);

  return (
    <div className="v3-panel content-container">
      <div className="v3-panel-title">🎧 Now Playing (Channel 0)</div>
      {info ? (
        <>
          <div className="v3-now-playing">{titleOf(info)}</div>
          <div className="v3-progress">
            <div className="v3-progress-fill" style={{ width: `${Math.round(info.progress * 100)}%` }} />
          </div>
          <div className="v3-meta">
            {formatTime(info.currentTime)} / {formatTime(info.duration)} · {info.playbackRate}x · {info.isPaused ? 'paused' : 'playing'} ·{' '}
            {info.remainingInQueue} up next
          </div>
        </>
      ) : (
        <div className="v3-meta">Nothing playing. Queue the playlist, then try the lock screen or your media keys.</div>
      )}
      {history.length > 0 && (
        <>
          <div className="v3-panel-subtitle">Recently played: getHistory(0)</div>
          <ul className="v3-history">
            {history.map((entry) => (
              <li key={`${entry.id}-${entry.finishedAt}`}>
                {titleOf(entry)}{' '}
                <span className="v3-meta">
                  ({entry.reason}, {formatTime(entry.playedMs)})
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default PlaylistPanel;
