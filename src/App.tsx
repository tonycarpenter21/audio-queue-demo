import {
  queueAudio,
  queueAudioPriority,
  stopAllAudio,
  stopAllAudioInChannel,
  stopCurrentAudioInChannel,
  pauseChannel,
  resumeChannel,
  togglePauseChannel,
  pauseAllChannels,
  resumeAllChannels,
  togglePauseAllChannels,
  pauseWithFade,
  resumeWithFade,
  togglePauseWithFade,
  pauseAllWithFade,
  resumeAllWithFade,
  togglePauseAllWithFade,
  onQueueChange,
  onAudioStart,
  onAudioComplete,
  onAudioPause,
  onAudioResume,
  QueueSnapshot,
  AudioCompleteInfo,
  QueueItem,
  Unsubscribe,
  clearQueueAfterCurrent,
  connectMediaSession,
  getCurrentAudioInfo,
  getQueueItemInfo,
  getQueueLength,
  setGlobalVolume,
  clearVolumeDucking
} from 'audioq';
import { type JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import './shared.css';
import { audioFilesSoundEffectExamples, audioFilesVocalExamples, backgroundMusic, getRandomAudioFile } from './audio/audioFilesAndUtils';
import { AudioQueueVisualizerHandle } from './AudioQueueVisualizer/AudioQueueVisualizer';
import { createHandleAudioAndVisualizer, clearLoopingTracker } from './AudioQueueVisualizer/audioQueueVisualizerUtils';
import { displayName } from './audio/displayName';
import BackgroundVisualizer from './BackgroundVisualizer/BackgroundVisualizer';
import Footer from './Footer/Footer';
import Header from './Header/Header';
import { createExamples } from './MultiChannelExampleBlock/exampleData';
import { Example, ExampleTabs, ExampleTabRoutes, FadeOption } from './types';
import AppRoutes from './routes/AppRoutes';
import { usePageTitle } from './hooks/usePageTitle';
import { useAudioQueue } from './context/AudioQueueContext';
import { useAudioQueueActions } from './hooks/useAudioQueueActions';
import { usePlaylistSettings } from './hooks/usePlaylistSettings';
import { createV3Examples } from './MultiChannelExampleBlock/v3Examples';

function App(): JSX.Element {
  const visualizerRef0 = useRef<AudioQueueVisualizerHandle>(null);
  const visualizerRef1 = useRef<AudioQueueVisualizerHandle>(null);

  const visualizerRefs = useMemo(() => [visualizerRef0, visualizerRef1], []);

  const getVisualizer = useCallback(
    (channelNumber: number): AudioQueueVisualizerHandle | null => visualizerRefs[channelNumber]?.current ?? null,
    [visualizerRefs]
  );

  const location = useLocation();
  const navigate = useNavigate();

  // Get state and actions from context
  const { state } = useAudioQueue();
  const { pauseState, selectedFadeOption } = state;
  const { setQueueState, setQueueLength, setPauseState, setFadeOption, resetAllStates } = useAudioQueueActions();

  const [isDuckingEnabled, setIsDuckingEnabled] = useState<boolean>(false);
  const [playlistSettings, playlistActions] = usePlaylistSettings();
  const resetPlaylistSettings = playlistActions.reset;

  // Get current tab from route
  const getCurrentTabFromRoute = useCallback((): ExampleTabs => {
    const route: string = location.pathname;
    const tabEntry = Object.entries(ExampleTabRoutes).find(([, path]) => path === route);
    return tabEntry ? (tabEntry[0] as ExampleTabs) : ExampleTabs.QUEUE_MANAGEMENT;
  }, [location.pathname]);

  const currentExampleTab: ExampleTabs = getCurrentTabFromRoute();

  // Update page title based on current tab
  usePageTitle(currentExampleTab);

  const handleAudioAndVisualizer = createHandleAudioAndVisualizer();

  // Comprehensive cleanup function to ensure all audio stops
  const performFullCleanup = useCallback(async (): Promise<void> => {
    await stopAllAudio();

    visualizerRefs.forEach((ref) => {
      if (ref.current) {
        ref.current.clearQueue();
        ref.current.setPlayingState(false);
      }
    });

    // Reset all state
    resetAllStates();
    setIsDuckingEnabled(false);
    clearVolumeDucking();

    // Reset global volume and the settings the playlist tab changes
    void setGlobalVolume(1);
    resetPlaylistSettings();

    clearLoopingTracker();
  }, [visualizerRefs, resetAllStates, resetPlaylistSettings]);

  // Custom fade option change handler that clears queues on pause/resume tab
  const handleFadeOptionChange = useCallback(
    async (newFadeOption: FadeOption): Promise<void> => {
      setFadeOption(newFadeOption);

      // Clear audio but preserve the fade option when on pause/resume tab
      if (currentExampleTab === ExampleTabs.PAUSE_RESUME) {
        await stopAllAudio();

        // Clear all visualizers
        visualizerRefs.forEach((ref) => {
          if (ref.current) {
            ref.current.clearQueue();
            ref.current.setPlayingState(false);
          }
        });

        // Reset queue and pause states, but NOT the fade option
        setQueueState(0, true);
        setQueueState(1, true);
        setQueueLength(0, 0);
        setQueueLength(1, 0);
        setPauseState(0, false);
        setPauseState(1, false);
        setIsDuckingEnabled(false);
        clearLoopingTracker();
      }
    },
    [currentExampleTab, setFadeOption, visualizerRefs, setQueueState, setQueueLength, setPauseState]
  );

  const pauseChannelWithFade = useCallback(
    async (channelNumber: number = 0): Promise<void> => {
      // Immediately update UI state for responsive feedback
      setPauseState(channelNumber, true);
      if (selectedFadeOption === 'None') {
        void pauseChannel(channelNumber);
      } else {
        await pauseWithFade(selectedFadeOption, channelNumber);
      }
    },
    [selectedFadeOption, setPauseState]
  );

  const resumeChannelWithFade = useCallback(
    async (channelNumber: number = 0): Promise<void> => {
      // Immediately update UI state for responsive feedback
      setPauseState(channelNumber, false);
      if (selectedFadeOption === 'None') {
        void resumeChannel(channelNumber);
      } else {
        await resumeWithFade(selectedFadeOption, channelNumber);
      }
    },
    [selectedFadeOption, setPauseState]
  );

  const togglePauseChannelWithFade = useCallback(
    async (channelNumber: number = 0): Promise<void> => {
      // Determine new state before toggle operation
      const currentlyPaused: boolean = pauseState[channelNumber] ?? false;
      const newPausedState: boolean = !currentlyPaused;

      // Update UI state immediately for responsive feedback
      setPauseState(channelNumber, newPausedState);

      if (selectedFadeOption === 'None') {
        void togglePauseChannel(channelNumber);
      } else {
        await togglePauseWithFade(selectedFadeOption, channelNumber);
      }
    },
    [selectedFadeOption, pauseState, setPauseState]
  );

  const pauseAllChannelsWithFade = useCallback(async (): Promise<void> => {
    // Immediately update UI state for responsive feedback
    setPauseState(0, true);
    setPauseState(1, true);
    if (selectedFadeOption === 'None') {
      void pauseAllChannels();
    } else {
      await pauseAllWithFade(selectedFadeOption);
    }
  }, [selectedFadeOption, setPauseState]);

  const resumeAllChannelsWithFade = useCallback(async (): Promise<void> => {
    // Immediately update UI state for responsive feedback
    setPauseState(0, false);
    setPauseState(1, false);
    if (selectedFadeOption === 'None') {
      void resumeAllChannels();
    } else {
      await resumeAllWithFade();
    }
  }, [selectedFadeOption, setPauseState]);

  const togglePauseAllChannelsWithFade = useCallback(async (): Promise<void> => {
    // Determine if any channel is currently playing (not paused)
    const anyChannelPlaying: boolean = Object.values(pauseState).some((isPaused) => !isPaused);
    // If any channel is playing, pause all. If all are paused, resume all.
    const newPausedState: boolean = anyChannelPlaying;

    // Update UI state immediately for responsive feedback
    setPauseState(0, newPausedState);
    setPauseState(1, newPausedState);

    if (selectedFadeOption === 'None') {
      void togglePauseAllChannels();
    } else {
      await togglePauseAllWithFade(selectedFadeOption);
    }
  }, [selectedFadeOption, pauseState, setPauseState]);

  // Pauses can also come from outside the app (lock screen, phone calls, unplugged headphones),
  // so the buttons follow the library's pause and resume events.
  const handleAudioPause = useCallback((channelNumber: number) => (): void => setPauseState(channelNumber, true), [setPauseState]);
  const handleAudioResume = useCallback((channelNumber: number) => (): void => setPauseState(channelNumber, false), [setPauseState]);

  const handleTabChange = useCallback(
    async (newTab: ExampleTabs) => {
      await performFullCleanup();

      // Navigate to new tab
      void navigate(ExampleTabRoutes[newTab]);
    },
    [navigate, performFullCleanup]
  );

  const handleQueueChange = useCallback(
    (channelNumber: number) =>
      (snapshot: QueueSnapshot): void => {
        const visualizer: AudioQueueVisualizerHandle | null = getVisualizer(channelNumber);
        if (!visualizer) return;

        visualizer.clearQueue();

        snapshot.items.forEach((item: QueueItem) => {
          const title: unknown = item.metadata?.title;
          visualizer.addAudioFile(typeof title === 'string' ? title : displayName(item.fileName), item.duration, item.isLooping);
        });

        const hasItems: boolean = snapshot.totalItems > 0;
        const isPlaying: boolean = snapshot.items[0]?.isCurrentlyPlaying ?? false;

        visualizer.setPlayingState(isPlaying);
        // Update queue state: true = empty, false = has items
        setQueueState(channelNumber, !hasItems);
        // Update queue lengths
        setQueueLength(channelNumber, snapshot.totalItems);
      },
    [getVisualizer, setQueueState, setQueueLength]
  );

  const handleAudioStart = useCallback(
    (channelNumber: number) => (): void => {
      getVisualizer(channelNumber)?.setPlayingState(true);
      setQueueState(channelNumber, false);
    },
    [getVisualizer, setQueueState]
  );

  const handleAudioComplete = useCallback(
    (channelNumber: number) =>
      (info: AudioCompleteInfo): void => {
        const visualizer: AudioQueueVisualizerHandle | null = getVisualizer(channelNumber);

        if (info.remainingInQueue === 0) {
          visualizer?.setPlayingState(false);
          // Set queue as empty (true = empty)
          setQueueState(channelNumber, true);
        }
      },
    [getVisualizer, setQueueState]
  );

  const calculateProgress = useCallback((): void => {
    [0, 1].forEach((channelNumber) => {
      const visualizer: AudioQueueVisualizerHandle | null = getVisualizer(channelNumber);
      const info = getCurrentAudioInfo(channelNumber);
      if (!visualizer || !info || info.duration <= 0) return;
      visualizer.updateProgress(info.progress);
      visualizer.setPlayingState(true);
    });
  }, [getVisualizer]);

  // Show channel 0 on the lock screen and in media notifications, with working buttons
  useEffect(() => connectMediaSession({ channel: 0, seekOffsetMs: 10000 }), []);

  useEffect(() => {
    const channels: number[] = [0, 1];

    // Set up audio event listeners; each on* call returns its own unsubscribe function
    const unsubscribes: Unsubscribe[] = channels.flatMap((channel) => [
      onQueueChange(channel, handleQueueChange(channel)),
      onAudioStart(channel, handleAudioStart(channel)),
      onAudioComplete(channel, handleAudioComplete(channel)),
      onAudioPause(channel, handleAudioPause(channel)),
      onAudioResume(channel, handleAudioResume(channel))
    ]);

    // Start animation loop
    let animationFrameId: number;
    const animationLoop = (): void => {
      calculateProgress();
      animationFrameId = requestAnimationFrame(animationLoop);
    };
    animationFrameId = requestAnimationFrame(animationLoop);

    // Cleanup function
    return (): void => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());

      // Cancel animation frame
      cancelAnimationFrame(animationFrameId);

      // Perform full cleanup on unmount
      void performFullCleanup();
    };
  }, [
    handleQueueChange,
    handleAudioStart,
    handleAudioComplete,
    handleAudioPause,
    handleAudioResume,
    calculateProgress,
    performFullCleanup
  ]);

  const examples: Record<string, Example[]> = {
    ...createV3Examples(playlistSettings, playlistActions),
    ...createExamples(
      handleAudioAndVisualizer,
      queueAudio,
      stopCurrentAudioInChannel,
      stopAllAudioInChannel,
      stopAllAudio,
      pauseChannelWithFade,
      resumeChannelWithFade,
      togglePauseChannelWithFade,
      pauseAllChannelsWithFade,
      resumeAllChannelsWithFade,
      togglePauseAllChannelsWithFade,
      queueAudioPriority,
      getRandomAudioFile,
      audioFilesVocalExamples,
      audioFilesSoundEffectExamples,
      backgroundMusic,
      selectedFadeOption,
      clearQueueAfterCurrent,
      getQueueItemInfo,
      getQueueLength,
      isDuckingEnabled,
      setIsDuckingEnabled
    )
  };

  return (
    <div className="app">
      <BackgroundVisualizer />
      <div className="example-container">
        <Header currentExampleTab={currentExampleTab} onTabChange={(tab) => void handleTabChange(tab)} />
        <AppRoutes
          examples={examples}
          onFadeOptionChange={(option) => void handleFadeOptionChange(option)}
          visualizerRefs={visualizerRefs}
        />
        <Footer />
      </div>
    </div>
  );
}

export default App;
