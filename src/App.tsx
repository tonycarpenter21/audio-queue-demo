import {
  queueAudio,
  stopAllAudio,
  stopAllAudioInChannel,
  stopCurrentAudioInChannel,
  onQueueChange,
  offQueueChange,
  onAudioStart,
  onAudioComplete,
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
import { createHandleAudioAndVisualizer } from './AudioQueueVisualizer/audioQueueVisualizerUtils';
import Footer from './Footer/Footer';
import Header from './Header/Header';
import { createExamples, HandleAudioAndVisualizer } from './MultiChannelExampleBlock/exampleData';
import ExampleTabMenu, { ExampleTabs } from './ExampleTabMenu/ExampleTabMenu';
import ExampleTab from './ExampleTab/ExampleTab';
import { Example } from './types';

interface ProgressTracking {
  duration: number;
  isPlaying: boolean;
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

  const [currentExampleTab, setCurrentExampleTab] = useState<ExampleTabs>(ExampleTabs.ADD_SOUND);
  const [queueState, setQueueState] = useState<{ [channelNumber: number]: boolean }>({ 0: true, 1: true });

  const handleAudioAndVisualizer: HandleAudioAndVisualizer = createHandleAudioAndVisualizer();

  const handleTabChange = useCallback(
    (newTab: ExampleTabs) => {
      stopAllAudio();
      setCurrentExampleTab(newTab);
      visualizerRefs.forEach((ref) => ref.current?.clearQueue());
      setQueueState({ 0: true, 1: true });
      progressTrackingRef.current = {};
    },
    [visualizerRefs]
  );

  const handleQueueChange = useCallback(
    (channelNumber: number) =>
      (snapshot: QueueSnapshot): void => {
        const visualizer = getVisualizer(channelNumber);
        if (!visualizer) return;

        visualizer.clearQueue();

        snapshot.items.forEach((item: QueueItem) => {
          const cleanFileName = cleanWebpackFilename(item.fileName);
          visualizer.addAudioFile(cleanFileName, item.duration);
        });

        const hasItems = snapshot.totalItems > 0;
        const isPlaying = snapshot.items[0]?.isCurrentlyPlaying || false;

        visualizer.setPlayingState(isPlaying);
        setQueueState((prev) => ({ ...prev, [channelNumber]: !hasItems }));
      },
    [getVisualizer]
  );

  const handleAudioStart = useCallback(
    (channelNumber: number) =>
      (info: AudioStartInfo): void => {
        const visualizer = getVisualizer(channelNumber);

        progressTrackingRef.current[channelNumber] = {
          duration: info.duration,
          isPlaying: true,
          startTime: Date.now()
        };

        visualizer?.setPlayingState(true);
        setQueueState((prev) => ({ ...prev, [channelNumber]: false }));
      },
    [getVisualizer]
  );

  const handleAudioComplete = useCallback(
    (channelNumber: number) =>
      (info: AudioCompleteInfo): void => {
        const visualizer = getVisualizer(channelNumber);

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
      const trackingInfo = progressTrackingRef.current[channelNumber];
      const visualizer = getVisualizer(channelNumber);

      if (trackingInfo?.isPlaying && visualizer && trackingInfo.duration > 0) {
        const elapsed = Date.now() - trackingInfo.startTime;
        const progress = Math.min(1.0, elapsed / trackingInfo.duration);
        visualizer.updateProgress(progress);
      }
    });
  }, [getVisualizer]);

  useEffect(() => {
    const channels: number[] = [0, 1];

    channels.forEach((channel) => {
      onQueueChange(channel, handleQueueChange(channel));
      onAudioStart(channel, handleAudioStart(channel));
      onAudioComplete(channel, handleAudioComplete(channel));
    });

    let animationFrameId: number;

    const animationLoop = (): void => {
      calculateProgress();
      animationFrameId = requestAnimationFrame(animationLoop);
    };

    animationFrameId = requestAnimationFrame(animationLoop);

    return (): void => {
      channels.forEach((channel) => offQueueChange(channel));
      cancelAnimationFrame(animationFrameId);
    };
  }, [handleQueueChange, handleAudioStart, handleAudioComplete, calculateProgress]);

  const examples: Record<string, Example[]> = createExamples(
    handleAudioAndVisualizer,
    queueAudio,
    stopCurrentAudioInChannel,
    stopAllAudioInChannel,
    stopAllAudio,
    getRandomAudioFile,
    audioFilesChannelZero,
    audioFilesChannelOne
  );

  return (
    <div className="app">
      <div className="example-container">
        <Header />
        <ExampleTabMenu currentExampleTab={currentExampleTab} onTabChange={handleTabChange} />
        <ExampleTab currentExampleTab={currentExampleTab} examples={examples} queueState={queueState} visualizerRefs={visualizerRefs} />
        <Footer />
      </div>
    </div>
  );
}

export default App;
