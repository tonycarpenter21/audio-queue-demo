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
  offQueueChange,
  onAudioStart,
  offAudioStart,
  onAudioComplete,
  offAudioComplete,
  onAudioPause,
  onAudioResume,
  offAudioPause,
  offAudioResume,
  QueueSnapshot,
  AudioStartInfo,
  AudioCompleteInfo,
  QueueItem,
  cleanWebpackFilename,
  clearQueueAfterCurrent,
  getQueueItemInfo,
  getQueueLength,
  setGlobalVolume
} from 'audio-channel-queue';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import './shared.css';
import { audioFilesSoundEffectExamples, audioFilesVocalExamples, backgroundMusic, getRandomAudioFile } from './audio/audioFilesAndUtils';
import { AudioQueueVisualizerHandle } from './AudioQueueVisualizer/AudioQueueVisualizer';
import { createHandleAudioAndVisualizer, isAudioFileLooping, clearLoopingTracker } from './AudioQueueVisualizer/audioQueueVisualizerUtils';
import BackgroundVisualizer from './BackgroundVisualizer/BackgroundVisualizer';
import Footer from './Footer/Footer';
import Header from './Header/Header';
import { createExamples } from './MultiChannelExampleBlock/exampleData';
import { Example, ExampleTabs, ExampleTabRoutes, FadeOption } from './types';
import AppRoutes from './routes/AppRoutes';
import { usePageTitle } from './hooks/usePageTitle';
import { useAudioQueue } from './context/AudioQueueContext';
import { useAudioQueueActions } from './hooks/useAudioQueueActions';

interface ProgressTracking {
  duration: number;
  isPlaying: boolean;
  pausedAt?: number;
  startTime: number;
}

function App(): JSX.Element {
  const visualizerRef0 = useRef<AudioQueueVisualizerHandle>(null);
  const visualizerRef1 = useRef<AudioQueueVisualizerHandle>(null);
  const progressTrackingRef = useRef<{ [channelNumber: number]: ProgressTracking }>({});

  const visualizerRefs = useMemo(() => [visualizerRef0, visualizerRef1], []);

  const getVisualizer = useCallback(
    (channelNumber: number): AudioQueueVisualizerHandle | null => visualizerRefs[channelNumber].current,
    [visualizerRefs]
  );

  const location = useLocation();
  const navigate = useNavigate();

  // Get state and actions from context
  const { state } = useAudioQueue();
  const { pauseState, selectedFadeOption } = state;
  const { setQueueState, setQueueLength, setPauseState, setFadeOption, resetAllStates } = useAudioQueueActions();

  const [isDuckingEnabled, setIsDuckingEnabled] = useState<boolean>(false);

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

    // Reset global volume to 1
    setGlobalVolume(1);

    // Clear progress tracking
    progressTrackingRef.current = {};
    clearLoopingTracker();
  }, [visualizerRefs, resetAllStates]);

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

        // Clear progress tracking
        progressTrackingRef.current = {};
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
        pauseChannel(channelNumber);
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
        resumeChannel(channelNumber);
      } else {
        await resumeWithFade(selectedFadeOption, channelNumber);
      }
    },
    [selectedFadeOption, setPauseState]
  );

  const togglePauseChannelWithFade = useCallback(
    async (channelNumber: number = 0): Promise<void> => {
      // Determine new state before toggle operation
      const currentlyPaused: boolean = pauseState[channelNumber] || false;
      const newPausedState: boolean = !currentlyPaused;

      // Update UI state immediately for responsive feedback
      setPauseState(channelNumber, newPausedState);

      if (selectedFadeOption === 'None') {
        togglePauseChannel(channelNumber);
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
      pauseAllChannels();
    } else {
      await pauseAllWithFade(selectedFadeOption);
    }
  }, [selectedFadeOption, setPauseState]);

  const resumeAllChannelsWithFade = useCallback(async (): Promise<void> => {
    // Immediately update UI state for responsive feedback
    setPauseState(0, false);
    setPauseState(1, false);
    if (selectedFadeOption === 'None') {
      resumeAllChannels();
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
      togglePauseAllChannels();
    } else {
      await togglePauseAllWithFade(selectedFadeOption);
    }
  }, [selectedFadeOption, pauseState, setPauseState]);

  const handleAudioPause = useCallback(
    (channelNumber: number) => (): void => {
      const trackingInfo: ProgressTracking | undefined = progressTrackingRef.current[channelNumber];
      if (trackingInfo && trackingInfo.isPlaying) {
        // Record the pause time to preserve progress
        trackingInfo.isPlaying = false;
        trackingInfo.pausedAt = Date.now();
      }
    },
    []
  );

  const handleAudioResume = useCallback(
    (channelNumber: number) => (): void => {
      const trackingInfo: ProgressTracking | undefined = progressTrackingRef.current[channelNumber];
      if (trackingInfo && !trackingInfo.isPlaying && trackingInfo.pausedAt) {
        // Adjust start time to account for pause duration
        const pauseDuration: number = Date.now() - trackingInfo.pausedAt;
        trackingInfo.startTime += pauseDuration;
        trackingInfo.isPlaying = true;
        delete trackingInfo.pausedAt;
      }
    },
    []
  );

  const handleTabChange = useCallback(
    async (newTab: ExampleTabs) => {
      await performFullCleanup();

      // Navigate to new tab
      navigate(ExampleTabRoutes[newTab]);
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
          const cleanFileName: string = cleanWebpackFilename(item.fileName);
          // Check if this audio file is being tracked as looping
          const isLooping: boolean = isAudioFileLooping(item.fileName, channelNumber);
          visualizer.addAudioFile(cleanFileName, item.duration, isLooping);
        });

        const hasItems: boolean = snapshot.totalItems > 0;
        const isPlaying: boolean = snapshot.items[0]?.isCurrentlyPlaying || false;

        visualizer.setPlayingState(isPlaying);
        // Update queue state: true = empty, false = has items
        setQueueState(channelNumber, !hasItems);
        // Update queue lengths
        setQueueLength(channelNumber, snapshot.totalItems);
      },
    [getVisualizer, setQueueState, setQueueLength]
  );

  const handleAudioStart = useCallback(
    (channelNumber: number) =>
      (info: AudioStartInfo): void => {
        const visualizer: AudioQueueVisualizerHandle | null = getVisualizer(channelNumber);

        progressTrackingRef.current[channelNumber] = {
          duration: info.duration,
          isPlaying: true,
          startTime: Date.now()
          // pausedAt is undefined initially
        };

        visualizer?.setPlayingState(true);
        setQueueState(channelNumber, false);
      },
    [getVisualizer, setQueueState]
  );

  const handleAudioComplete = useCallback(
    (channelNumber: number) =>
      (info: AudioCompleteInfo): void => {
        const visualizer: AudioQueueVisualizerHandle | null = getVisualizer(channelNumber);

        delete progressTrackingRef.current[channelNumber];

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
      const trackingInfo: ProgressTracking | undefined = progressTrackingRef.current[channelNumber];
      const visualizer: AudioQueueVisualizerHandle | null = getVisualizer(channelNumber);

      if (trackingInfo && visualizer && trackingInfo.duration > 0) {
        let progress: number;

        if (trackingInfo.isPlaying) {
          // Currently playing - calculate normal progress
          const elapsed: number = Date.now() - trackingInfo.startTime;
          progress = elapsed / trackingInfo.duration;

          // For looping audio, restart progress when it exceeds 100%
          if (progress >= 1.0) {
            // Check if the current audio is looping
            const nextAudio: { isLooping?: boolean } | null = visualizer.getNextAudio();
            if (nextAudio?.isLooping) {
              // Reset the start time to create a seamless loop animation
              progressTrackingRef.current[channelNumber].startTime = Date.now() - (elapsed % trackingInfo.duration);
              progress = (elapsed % trackingInfo.duration) / trackingInfo.duration;
            } else {
              progress = 1.0;
            }
          }
        } else if (trackingInfo.pausedAt) {
          // Currently paused - freeze progress at pause point
          const elapsed: number = trackingInfo.pausedAt - trackingInfo.startTime;
          progress = Math.min(1.0, elapsed / trackingInfo.duration);
        } else {
          // Not playing and no pause time recorded
          return;
        }

        visualizer.updateProgress(progress);
        // Always keep visualizer in playing state to show progress bar
        visualizer.setPlayingState(true);
      }
    });
  }, [getVisualizer]);

  useEffect(() => {
    const channels: number[] = [0, 1];

    // Set up audio event listeners
    channels.forEach((channel) => {
      onQueueChange(channel, handleQueueChange(channel));
      onAudioStart(channel, handleAudioStart(channel));
      onAudioComplete(channel, handleAudioComplete(channel));
      onAudioPause(channel, handleAudioPause(channel));
      onAudioResume(channel, handleAudioResume(channel));
    });

    // Handle browser tab visibility changes
    const handleVisibilityChange = async (): Promise<void> => {
      if (document.hidden) {
        stopAllAudio();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start animation loop
    let animationFrameId: number;
    const animationLoop = (): void => {
      calculateProgress();
      animationFrameId = requestAnimationFrame(animationLoop);
    };
    animationFrameId = requestAnimationFrame(animationLoop);

    // Cleanup function
    return (): void => {
      // Remove ALL audio event listeners to prevent state confusion
      channels.forEach((channel) => {
        offQueueChange(channel);
        offAudioStart(channel);
        offAudioComplete(channel);
        offAudioPause(channel);
        offAudioResume(channel);
      });

      // Remove visibility listener
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Cancel animation frame
      cancelAnimationFrame(animationFrameId);

      // Perform full cleanup on unmount
      performFullCleanup();
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

  const examples: Record<string, Example[]> = createExamples(
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
  );

  return (
    <div className="app">
      <BackgroundVisualizer />
      <div className="example-container">
        <Header currentExampleTab={currentExampleTab} onTabChange={handleTabChange} />
        <AppRoutes examples={examples} onFadeOptionChange={handleFadeOptionChange} visualizerRefs={visualizerRefs} />
        <Footer />
      </div>
    </div>
  );
}

export default App;
