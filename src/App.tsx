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
import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { audioFilesChannelOne, audioFilesChannelZero, getRandomAudioFile } from './audio/audioFilesAndUtils';
import AudioQueueVisualizer, { AudioQueueVisualizerHandle } from './AudioQueueVisualizer/AudioQueueVisualizer';
import { createHandleAudioAndVisualizer } from './AudioQueueVisualizer/audioQueueVisualizerUtils';
import Footer from './Footer/Footer';
import Header from './Header/Header';
import { createExamples, HandleAudioAndVisualizer } from './MultiChannelExampleBlock/exampleData';
import ExampleTabMenu, { ExampleTabs } from './ExampleTabMenu/ExampleTabMenu';
import ExampleTab from './ExampleTab/ExampleTab';
import { Example } from './MultiChannelExampleBlock/MultiChannelExampleBlock';

interface ProgressTracking {
  duration: number;
  isPlaying: boolean;
  startTime: number;
}

function App(): JSX.Element {
  const visualizerRefs = [useRef<AudioQueueVisualizerHandle>(null), useRef<AudioQueueVisualizerHandle>(null)];
  const progressTrackingRef = useRef<{ [channelNumber: number]: ProgressTracking }>({});

  const getVisualizer = (channelNumber: number): AudioQueueVisualizerHandle | null => visualizerRefs[channelNumber].current;

  const [currentExampleTab, setCurrentExampleTab] = useState<ExampleTabs>(ExampleTabs.ADD_SOUND);
  const [queueState, setQueueState] = useState<{ [channelNumber: number]: boolean }>({ 0: true, 1: true });

  const handleAudioAndVisualizer: HandleAudioAndVisualizer = createHandleAudioAndVisualizer();

  const handleTabChange = useCallback((newTab: ExampleTabs) => {
    stopAllAudio();
    setCurrentExampleTab(newTab);
    visualizerRefs.forEach((ref) => ref.current?.clearQueue());
    setQueueState({ 0: true, 1: true });
    progressTrackingRef.current = {};
  }, []);

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
    []
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
    []
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
    []
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
  }, []);

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
      <Header />
      <div className="example-container">
        <ExampleTabMenu currentExampleTab={currentExampleTab} onTabChange={handleTabChange} />
        <ExampleTab currentExampleTab={currentExampleTab} examples={examples} queueState={queueState} />
        <div className="visual-queue-container">
          {visualizerRefs.map((ref, index) => (
            <AudioQueueVisualizer channelNumber={index} key={index} ref={ref} />
          ))}
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;
