import {
  queueAudio,
  queueAudioPriority,
  stopAllAudio,
  stopAllAudioInChannel,
  stopCurrentAudioInChannel,
  pauseChannel,
  resumeChannel,
  pauseAllChannels,
  resumeAllChannels,
  onQueueChange,
  offQueueChange,
  onAudioStart,
  onAudioComplete,
  onAudioPause,
  onAudioResume,
  offAudioPause,
  offAudioResume,
  setChannelVolume,
  getChannelVolume,
  QueueSnapshot,
  AudioStartInfo,
  AudioCompleteInfo,
  QueueItem,
  cleanWebpackFilename
} from 'audio-channel-queue';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import './shared.css';
import { audioFilesChannelOne, audioFilesChannelZero, backgroundMusic, getRandomAudioFile } from './audio/audioFilesAndUtils';
import { AudioQueueVisualizerHandle } from './AudioQueueVisualizer/AudioQueueVisualizer';
import { createHandleAudioAndVisualizer, isAudioFileLooping, clearLoopingTracker } from './AudioQueueVisualizer/audioQueueVisualizerUtils';
import BackgroundVisualizer from './BackgroundVisualizer/BackgroundVisualizer';
import Footer from './Footer/Footer';
import Header from './Header/Header';
import { createExamples, FadeOption } from './MultiChannelExampleBlock/exampleData';
import ExampleTab from './ExampleTab/ExampleTab';
import { Example, ExampleTabs } from './types';

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

  const [currentExampleTab, setCurrentExampleTab] = useState<ExampleTabs>(ExampleTabs.QUEUE_MANAGEMENT);
  const [queueState, setQueueState] = useState<{ [channelNumber: number]: boolean }>({ 0: true, 1: true });
  const [pauseState, setPauseState] = useState<{ [channelNumber: number]: boolean }>({ 0: false, 1: false });
  const [selectedFadeOption, setSelectedFadeOption] = useState<FadeOption>('none');

  const handleAudioAndVisualizer = createHandleAudioAndVisualizer();

  // Easing functions for fade effects
  const easingFunctions = useMemo(
    () => ({
      'ease-in': (t: number): number => t * t,
      'ease-in-out': (t: number): number => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
      'ease-out': (t: number): number => t * (2 - t),
      linear: (t: number): number => t
    }),
    []
  );

  const fadeVolume = useCallback(
    async (channelNumber: number, targetVolume: number, duration: number = 1000, easing: FadeOption = 'ease-in-out'): Promise<void> => {
      if (easing === 'none') {
        setChannelVolume(channelNumber, targetVolume);
        return;
      }

      const currentVolume: number = getChannelVolume(channelNumber);
      const steps: number = 20;
      const stepDuration: number = duration / steps;
      const easingFunc = easingFunctions[easing];

      return new Promise((resolve) => {
        let currentStep: number = 0;

        const interval = setInterval(() => {
          currentStep++;
          const progress: number = currentStep / steps;
          const easedProgress: number = easingFunc(progress);
          const newVolume: number = currentVolume + (targetVolume - currentVolume) * easedProgress;

          setChannelVolume(channelNumber, newVolume);

          if (currentStep >= steps) {
            clearInterval(interval);
            setChannelVolume(channelNumber, targetVolume); // Ensure exact final value
            resolve();
          }
        }, stepDuration);
      });
    },
    [easingFunctions]
  );

  const pauseChannelWithFade = useCallback(
    async (channelNumber: number = 0): Promise<void> => {
      // Immediately update UI state for responsive feedback
      setPauseState((prev) => ({ ...prev, [channelNumber]: true }));

      if (selectedFadeOption === 'none') {
        pauseChannel(channelNumber);
        return;
      }

      const originalVolume: number = getChannelVolume(channelNumber);
      await fadeVolume(channelNumber, 0, 800, selectedFadeOption);
      pauseChannel(channelNumber);
      setChannelVolume(channelNumber, originalVolume); // Reset for resume
    },
    [selectedFadeOption, fadeVolume]
  );

  const resumeChannelWithFade = useCallback(
    async (channelNumber: number = 0): Promise<void> => {
      // Immediately update UI state for responsive feedback
      setPauseState((prev) => ({ ...prev, [channelNumber]: false }));

      if (selectedFadeOption === 'none') {
        resumeChannel(channelNumber);
        return;
      }

      const targetVolume: number = getChannelVolume(channelNumber);
      setChannelVolume(channelNumber, 0);
      resumeChannel(channelNumber);
      await fadeVolume(channelNumber, targetVolume, 800, selectedFadeOption);
    },
    [selectedFadeOption, fadeVolume]
  );

  const togglePauseChannelWithFade = useCallback(
    async (channelNumber: number = 0): Promise<void> => {
      const currentPauseState: boolean = pauseState[channelNumber];
      if (currentPauseState) {
        await resumeChannelWithFade(channelNumber);
      } else {
        await pauseChannelWithFade(channelNumber);
      }
    },
    [pauseState, pauseChannelWithFade, resumeChannelWithFade]
  );

  const pauseAllChannelsWithFade = useCallback(async (): Promise<void> => {
    // Immediately update UI state for responsive feedback
    setPauseState({ 0: true, 1: true });

    if (selectedFadeOption === 'none') {
      pauseAllChannels();
      return;
    }

    const channels: number[] = [0, 1];
    const originalVolumes: { [key: number]: number } = {};

    // Store original volumes
    channels.forEach((channel) => {
      originalVolumes[channel] = getChannelVolume(channel);
    });

    // Fade all channels simultaneously
    await Promise.all(channels.map((channel) => fadeVolume(channel, 0, 800, selectedFadeOption)));

    pauseAllChannels();

    // Reset volumes for resume
    channels.forEach((channel) => {
      setChannelVolume(channel, originalVolumes[channel]);
    });
  }, [selectedFadeOption, fadeVolume]);

  const resumeAllChannelsWithFade = useCallback(async (): Promise<void> => {
    // Immediately update UI state for responsive feedback
    setPauseState({ 0: false, 1: false });

    if (selectedFadeOption === 'none') {
      resumeAllChannels();
      return;
    }

    const channels: number[] = [0, 1];
    const targetVolumes: { [key: number]: number } = {};

    // Store target volumes and set to 0
    channels.forEach((channel) => {
      targetVolumes[channel] = getChannelVolume(channel);
      setChannelVolume(channel, 0);
    });

    resumeAllChannels();

    // Fade all channels in simultaneously
    await Promise.all(channels.map((channel) => fadeVolume(channel, targetVolumes[channel], 800, selectedFadeOption)));
  }, [selectedFadeOption, fadeVolume]);

  const togglePauseAllChannelsWithFade = useCallback(async (): Promise<void> => {
    const anyChannelPlaying: boolean = !pauseState[0] || !pauseState[1];
    if (anyChannelPlaying) {
      await pauseAllChannelsWithFade();
    } else {
      await resumeAllChannelsWithFade();
    }
  }, [pauseState, pauseAllChannelsWithFade, resumeAllChannelsWithFade]);

  const handleAudioPause = useCallback(
    (channelNumber: number) => (): void => {
      const trackingInfo: ProgressTracking | undefined = progressTrackingRef.current[channelNumber];
      if (trackingInfo && trackingInfo.isPlaying) {
        // Record the pause time to preserve progress
        trackingInfo.isPlaying = false;
        trackingInfo.pausedAt = Date.now();
      }

      // Only update pause state if no fade is selected (for direct API calls)
      // When fade is selected, we handle state updates optimistically to remove a perceived visual delay
      if (selectedFadeOption === 'none') {
        setPauseState((prev) => ({ ...prev, [channelNumber]: true }));
      }
    },
    [selectedFadeOption]
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

      // Only update pause state if no fade is selected (for direct API calls)
      // When fade is selected, we handle state updates optimistically to remove a perceived visual delay
      if (selectedFadeOption === 'none') {
        setPauseState((prev) => ({ ...prev, [channelNumber]: false }));
      }
    },
    [selectedFadeOption]
  );

  const handleTabChange = useCallback(
    (newTab: ExampleTabs) => {
      stopAllAudio();
      setCurrentExampleTab(newTab);
      visualizerRefs.forEach((ref) => ref.current?.clearQueue());
      setQueueState({ 0: true, 1: true });
      setPauseState({ 0: false, 1: false });
      // Clear all progress tracking data including pause times
      progressTrackingRef.current = {};
      clearLoopingTracker();
    },
    [visualizerRefs]
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
        setQueueState((prev) => ({ ...prev, [channelNumber]: !hasItems }));
      },
    [getVisualizer]
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
        setQueueState((prev) => ({ ...prev, [channelNumber]: false }));
      },
    [getVisualizer]
  );

  const handleAudioComplete = useCallback(
    (channelNumber: number) =>
      (info: AudioCompleteInfo): void => {
        const visualizer: AudioQueueVisualizerHandle | null = getVisualizer(channelNumber);

        delete progressTrackingRef.current[channelNumber];

        if (info.remainingInQueue === 0) {
          visualizer?.setPlayingState(false);
          setQueueState((prev) => ({ ...prev, [channelNumber]: true }));
        }
      },
    [getVisualizer]
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

    channels.forEach((channel) => {
      onQueueChange(channel, handleQueueChange(channel));
      onAudioStart(channel, handleAudioStart(channel));
      onAudioComplete(channel, handleAudioComplete(channel));
      onAudioPause(channel, handleAudioPause(channel));
      onAudioResume(channel, handleAudioResume(channel));
    });

    let animationFrameId: number;

    const animationLoop = (): void => {
      calculateProgress();
      animationFrameId = requestAnimationFrame(animationLoop);
    };

    animationFrameId = requestAnimationFrame(animationLoop);

    return (): void => {
      channels.forEach((channel) => {
        offQueueChange(channel);
        offAudioPause(channel);
        offAudioResume(channel);
      });
      cancelAnimationFrame(animationFrameId);
    };
  }, [handleQueueChange, handleAudioStart, handleAudioComplete, handleAudioPause, handleAudioResume, calculateProgress]);

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
    audioFilesChannelZero,
    audioFilesChannelOne,
    backgroundMusic,
    selectedFadeOption
  );

  return (
    <div className="app">
      <BackgroundVisualizer />
      <div className="example-container">
        <Header currentExampleTab={currentExampleTab} onTabChange={handleTabChange} />
        <ExampleTab
          currentExampleTab={currentExampleTab}
          examples={examples}
          onFadeOptionChange={setSelectedFadeOption}
          pauseState={pauseState}
          queueState={queueState}
          selectedFadeOption={selectedFadeOption}
          visualizerRefs={visualizerRefs}
        />
        <Footer />
      </div>
    </div>
  );
}

export default App;
