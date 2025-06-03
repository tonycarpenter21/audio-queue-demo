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
  onQueueChange,
  offQueueChange,
  onAudioStart,
  onAudioComplete,
  onAudioPause,
  onAudioResume,
  offAudioPause,
  offAudioResume,
  QueueSnapshot,
  AudioStartInfo,
  AudioCompleteInfo,
  QueueItem,
  cleanWebpackFilename
} from 'audio-channel-queue';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import './shared.css';
import { audioFilesChannelOne, audioFilesChannelZero, getRandomAudioFile } from './audio/audioFilesAndUtils';
import { AudioQueueVisualizerHandle } from './AudioQueueVisualizer/AudioQueueVisualizer';
import { createHandleAudioAndVisualizer, isAudioFileLooping, clearLoopingTracker } from './AudioQueueVisualizer/audioQueueVisualizerUtils';
import Footer from './Footer/Footer';
import Header from './Header/Header';
import { createExamples } from './MultiChannelExampleBlock/exampleData';
import ExampleTabMenu, { ExampleTabs } from './ExampleTabMenu/ExampleTabMenu';
import ExampleTab from './ExampleTab/ExampleTab';
import { Example } from './types';

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

  const [currentExampleTab, setCurrentExampleTab] = useState<ExampleTabs>(ExampleTabs.BASIC_QUEUE);
  const [queueState, setQueueState] = useState<{ [channelNumber: number]: boolean }>({ 0: true, 1: true });
  const [pauseState, setPauseState] = useState<{ [channelNumber: number]: boolean }>({ 0: false, 1: false });

  const handleAudioAndVisualizer = createHandleAudioAndVisualizer();

  const handleAudioPause = useCallback(
    (channelNumber: number) => (): void => {
      const trackingInfo: ProgressTracking | undefined = progressTrackingRef.current[channelNumber];
      if (trackingInfo && trackingInfo.isPlaying) {
        // Record the pause time to preserve progress
        trackingInfo.isPlaying = false;
        trackingInfo.pausedAt = Date.now();
      }

      // Update pause state
      setPauseState((prev) => ({ ...prev, [channelNumber]: true }));
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

      // Update pause state
      setPauseState((prev) => ({ ...prev, [channelNumber]: false }));
    },
    []
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
    pauseChannel,
    resumeChannel,
    togglePauseChannel,
    pauseAllChannels,
    resumeAllChannels,
    togglePauseAllChannels,
    queueAudioPriority,
    getRandomAudioFile,
    audioFilesChannelZero,
    audioFilesChannelOne
  );

  return (
    <div className="app">
      <div className="example-container">
        <Header />
        <ExampleTabMenu currentExampleTab={currentExampleTab} onTabChange={handleTabChange} />
        <ExampleTab
          currentExampleTab={currentExampleTab}
          examples={examples}
          pauseState={pauseState}
          queueState={queueState}
          visualizerRefs={visualizerRefs}
        />
        <Footer />
      </div>
    </div>
  );
}

export default App;
