import { RepeatMode, setChannelGap, setCrossfade, setPlaybackRate, setQueueConfig, setRepeatMode } from 'audioq';
import { useCallback, useState } from 'react';
import { nextInCycle as next } from '../utils/pick';

const RATES: number[] = [1, 1.5, 2, 0.75];
const REPEAT_MODES: RepeatMode[] = ['off', 'all', 'one'];
export const PLAYLIST_CHANNEL: number = 0;
export const CROSSFADE_MS: number = 3000;
export const GAP_MS: number = 1500;

export interface PlaylistSettings {
  crossfadeMs: number;
  debug: boolean;
  gapMs: number;
  pauseWhenHidden: boolean;
  rate: number;
  repeat: RepeatMode;
}

export interface PlaylistSettingsActions {
  cycleRate: () => void;
  cycleRepeat: () => void;
  reset: () => void;
  togglePauseWhenHidden: () => void;
  toggleDebug: () => void;
  toggleCrossfade: () => void;
  toggleGap: () => void;
}

const DEFAULTS: PlaylistSettings = { crossfadeMs: 0, debug: false, gapMs: 0, pauseWhenHidden: false, rate: 1, repeat: 'off' };

/** Settings the new-feature tabs change, mirrored in React state so the buttons can show them. */
export function usePlaylistSettings(): [PlaylistSettings, PlaylistSettingsActions] {
  const [settings, setSettings] = useState<PlaylistSettings>(DEFAULTS);

  const cycleRate = useCallback((): void => {
    setSettings((current) => {
      const rate: number = next(RATES, current.rate);
      setPlaybackRate(PLAYLIST_CHANNEL, rate);
      return { ...current, rate };
    });
  }, []);

  const cycleRepeat = useCallback((): void => {
    setSettings((current) => {
      const repeat: RepeatMode = next(REPEAT_MODES, current.repeat);
      setRepeatMode(PLAYLIST_CHANNEL, repeat);
      return { ...current, repeat };
    });
  }, []);

  const toggleCrossfade = useCallback((): void => {
    setSettings((current) => {
      const crossfadeMs: number = current.crossfadeMs > 0 ? 0 : CROSSFADE_MS;
      setCrossfade(PLAYLIST_CHANNEL, crossfadeMs);
      return { ...current, crossfadeMs };
    });
  }, []);

  const toggleGap = useCallback((): void => {
    setSettings((current) => {
      const gapMs: number = current.gapMs > 0 ? 0 : GAP_MS;
      setChannelGap(PLAYLIST_CHANNEL, gapMs);
      return { ...current, gapMs };
    });
  }, []);

  const togglePauseWhenHidden = useCallback((): void => {
    setSettings((current) => {
      const pauseWhenHidden: boolean = !current.pauseWhenHidden;
      setQueueConfig({ pauseWhenHidden });
      return { ...current, pauseWhenHidden };
    });
  }, []);

  const toggleDebug = useCallback((): void => {
    setSettings((current) => {
      const debug: boolean = !current.debug;
      setQueueConfig({ debug });
      return { ...current, debug };
    });
  }, []);

  const reset = useCallback((): void => {
    setPlaybackRate(PLAYLIST_CHANNEL, DEFAULTS.rate);
    setRepeatMode(PLAYLIST_CHANNEL, DEFAULTS.repeat);
    setCrossfade(PLAYLIST_CHANNEL, DEFAULTS.crossfadeMs);
    setChannelGap(PLAYLIST_CHANNEL, DEFAULTS.gapMs);
    setQueueConfig({ debug: DEFAULTS.debug, pauseWhenHidden: DEFAULTS.pauseWhenHidden });
    setSettings(DEFAULTS);
  }, []);

  return [settings, { cycleRate, cycleRepeat, reset, toggleCrossfade, toggleDebug, toggleGap, togglePauseWhenHidden }];
}
