import { queueAudio, stopAllAudio, stopAllAudioInChannel, stopCurrentAudioInChannel } from 'audio-channel-queue';
import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { audioFilesChannelOne, audioFilesChannelZero, getRandomAudioFile } from './audio/audioFilesAndUtils';
import AudioQueueVisualizer, { AudioQueueVisualizerHandle } from './AudioQueueVisualizer/AudioQueueVisualizer';
import { createHandleAudioAndVisualizer, VisualizedAudioItem } from './AudioQueueVisualizer/audioQueueVisualizerUtils';
import Footer from './Footer/Footer';
import Header from './Header/Header';
import { createExamples } from './MultiChannelExampleBlock/exampleData';
import ExampleTabMenu, { ExampleTabs } from './ExampleTabMenu/ExampleTabMenu';
import ExampleTab from './ExampleTab/ExampleTab';
import { Example } from './MultiChannelExampleBlock/MultiChannelExampleBlock';

function App(): JSX.Element {
  const visualizerRef0 = useRef<AudioQueueVisualizerHandle>(null);
  const visualizerRef1 = useRef<AudioQueueVisualizerHandle>(null);

  const [currentExampleTab, setCurrentExampleTab] = useState<ExampleTabs>(ExampleTabs.ADD_SOUND);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<{
    [channelNumber: number]: VisualizedAudioItem | null;
  }>({});
  const [queueState, setQueueState] = useState<{
    [channelNumber: number]: boolean;
  }>({ 0: true, 1: true });

  const handleAudioAndVisualizer = createHandleAudioAndVisualizer(
    visualizerRef0,
    visualizerRef1,
    currentlyPlaying,
    setCurrentlyPlaying,
    setQueueState
  );

  const handleTabChange = useCallback((newTab: ExampleTabs) => {
    stopAllAudio();
    setCurrentExampleTab(newTab);
    visualizerRef0.current?.clearQueue();
    visualizerRef1.current?.clearQueue();
    setCurrentlyPlaying({});
    setQueueState({ 0: true, 1: true });
  }, []);

  useEffect(() => {
    const updateVisualizer = (channelNumber: number): void => {
      const visualizer = channelNumber === 0 ? visualizerRef0 : visualizerRef1;
      const currentlyPlayingItem = currentlyPlaying[channelNumber];

      if (currentlyPlayingItem) {
        const now = Date.now();
        const elapsedTime = now - currentlyPlayingItem.startTime;
        if (elapsedTime < currentlyPlayingItem.duration) {
          visualizer.current?.updateProgress(elapsedTime / currentlyPlayingItem.duration);
        }
      }
    };

    const intervalId = setInterval(() => {
      [0, 1].forEach(updateVisualizer);
    }, 10);

    return (): void => clearInterval(intervalId);
  }, [currentlyPlaying]);

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
          <AudioQueueVisualizer channelNumber={0} ref={visualizerRef0} />
          <AudioQueueVisualizer channelNumber={1} ref={visualizerRef1} />
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;
