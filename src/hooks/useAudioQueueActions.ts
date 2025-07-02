import { useCallback } from 'react';
import { useAudioQueue } from '../context/AudioQueueContext';
import { FadeOption } from '../types';

export function useAudioQueueActions(): {
  resetAllStates: () => void;
  setFadeOption: (fadeOption: FadeOption) => void;
  setPauseState: (channelNumber: number, isPaused: boolean) => void;
  setQueueLength: (channelNumber: number, length: number) => void;
  setQueueState: (channelNumber: number, isEmpty: boolean) => void;
} {
  const { dispatch } = useAudioQueue();

  const resetAllStates = useCallback(() => {
    dispatch({ type: 'RESET_ALL_STATES' });
  }, [dispatch]);

  const setFadeOption = useCallback(
    (fadeOption: FadeOption) => {
      dispatch({ fadeOption, type: 'SET_FADE_OPTION' });
    },
    [dispatch]
  );

  const setPauseState = useCallback(
    (channelNumber: number, isPaused: boolean) => {
      dispatch({ channelNumber, isPaused, type: 'SET_PAUSE_STATE' });
    },
    [dispatch]
  );

  const setQueueLength = useCallback(
    (channelNumber: number, length: number) => {
      dispatch({ channelNumber, length, type: 'SET_QUEUE_LENGTH' });
    },
    [dispatch]
  );

  const setQueueState = useCallback(
    (channelNumber: number, isEmpty: boolean) => {
      dispatch({ channelNumber, isEmpty, type: 'SET_QUEUE_STATE' });
    },
    [dispatch]
  );

  return {
    resetAllStates,
    setFadeOption,
    setPauseState,
    setQueueLength,
    setQueueState
  };
}
