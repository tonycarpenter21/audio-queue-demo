import { getHistory } from 'audioq';
import { type JSX, useEffect } from 'react';
import { displayName } from '../audio/displayName';
import { useChannel } from '../hooks/useChannel';
import { PLAYLIST_CHANNEL } from '../hooks/usePlaylistSettings';
import { setPlaylistDucking } from '../MultiChannelExampleBlock/v3Examples';
import SpectrumBars from './SpectrumBars';
import './V3Panels.css';

const formatTime = (ms: number): string => {
  const seconds: number = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

const titleOf = (entry: { fileName: string; metadata?: { title?: unknown } | undefined }): string =>
  typeof entry.metadata?.title === 'string' ? entry.metadata.title : displayName(entry.fileName);

interface PlaylistPanelProps {
  /** playlist: with the history of finished tracks. playback: with the spectrum, and ducking for announcements. */
  variant: 'playback' | 'playlist';
}

/** Now playing and position for the playlist channel, plus history or a spectrum. */
function PlaylistPanel({ variant }: PlaylistPanelProps): JSX.Element {
  const { current: info } = useChannel(PLAYLIST_CHANNEL);
  // At most 20 entries (historySize), so reading it on each render is cheap
  const history = getHistory(PLAYLIST_CHANNEL).slice(-5).reverse();

  useEffect(() => {
    if (variant !== 'playback') return undefined;
    setPlaylistDucking(true);
    return (): void => setPlaylistDucking(false);
  }, [variant]);

  return (
    <div className="v3-panel content-container">
      <div className="v3-panel-title">🎧 Now Playing (Channel 0)</div>
      {info ? (
        <>
          <div className="v3-now-playing">{titleOf(info)}</div>
          {variant === 'playback' && <SpectrumBars channelNumber={PLAYLIST_CHANNEL} />}
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
      {variant === 'playlist' && history.length > 0 && (
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
