import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { FadeOption } from '../types';

// State interface
interface AudioQueueState {
  pauseState: {
    [channelNumber: number]: boolean;
  };
  queueLengths: {
    [channelNumber: number]: number;
  };
  queueState: {
    [channelNumber: number]: boolean;
  };
  selectedFadeOption: FadeOption;
}

// Action types
type AudioQueueAction =
  | { type: 'SET_QUEUE_STATE'; channelNumber: number; isEmpty: boolean }
  | { type: 'SET_QUEUE_LENGTH'; channelNumber: number; length: number }
  | { type: 'SET_PAUSE_STATE'; channelNumber: number; isPaused: boolean }
  | { type: 'SET_FADE_OPTION'; fadeOption: FadeOption }
  | { type: 'RESET_ALL_STATES' };

// Initial state
const initialState: AudioQueueState = {
  pauseState: { 0: false, 1: false },
  queueLengths: { 0: 0, 1: 0 },
  queueState: { 0: true, 1: true },
  selectedFadeOption: 'None'
};

// Reducer
function audioQueueReducer(state: AudioQueueState, action: AudioQueueAction): AudioQueueState {
  switch (action.type) {
    case 'RESET_ALL_STATES':
      return initialState;

    case 'SET_QUEUE_STATE':
      return {
        ...state,
        queueState: {
          ...state.queueState,
          [action.channelNumber]: action.isEmpty
        }
      };

    case 'SET_FADE_OPTION':
      return {
        ...state,
        selectedFadeOption: action.fadeOption
      };

    case 'SET_PAUSE_STATE':
      return {
        ...state,
        pauseState: {
          ...state.pauseState,
          [action.channelNumber]: action.isPaused
        }
      };

    case 'SET_QUEUE_LENGTH':
      return {
        ...state,
        queueLengths: {
          ...state.queueLengths,
          [action.channelNumber]: action.length
        }
      };

    default:
      return state;
  }
}

interface AudioQueueContextValue {
  state: AudioQueueState;
  dispatch: React.Dispatch<AudioQueueAction>;
}

const AudioQueueContext = createContext<AudioQueueContextValue | undefined>(undefined);

interface AudioQueueProviderProps {
  children: ReactNode;
}

export function AudioQueueProvider({ children }: AudioQueueProviderProps): JSX.Element {
  const [state, dispatch] = useReducer(audioQueueReducer, initialState);

  return <AudioQueueContext.Provider value={{ dispatch, state }}>{children}</AudioQueueContext.Provider>;
}

export function useAudioQueue(): AudioQueueContextValue {
  const context = useContext(AudioQueueContext);
  if (!context) {
    throw new Error('useAudioQueue must be used within an AudioQueueProvider');
  }
  return context;
}
