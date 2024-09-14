import { queueAudio, stopAllAudio, stopAllAudioInChannel, stopCurrentAudioInChannel } from 'audio-channel-queue';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import { audioFilesChannelOne, audioFilesChannelZero, getRandomAudioFile } from './audio/audioFilesAndUtils';
import AudioQueueVisualizer, { AudioQueueVisualizerHandle } from './AudioQueueVisualizer/AudioQueueVisualizer';
import { createHandleAudioAndVisualizer, VisualizedAudioItem } from './AudioQueueVisualizer/audioQueueVisualizerUtils';
import Footer from './Footer/Footer';
import HeaderAndDescription from './HeaderAndDescription/HeaderAndDescription';
import MultiChannelExampleBlock, { Example } from './MultiChannelExampleBlock/MultiChannelExampleBlock';

function App(): JSX.Element {
  const visualizerRef0 = useRef<AudioQueueVisualizerHandle>(null);
  const visualizerRef1 = useRef<AudioQueueVisualizerHandle>(null);

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

  const descriptionText: string[] = [
    'The top examples in each block all default to channel 0 which will satisfy the majority of implementations. If you want your sounds to never overlap, this is what you want. ',
    'Each audio queue channel will play sounds one after another which means they will never overlap within their given channel. The bottom example in each block all run in a second audio queue channel (channel 1) which means they will overlap with the audio played in the top examples (channel 0).',
    'To test this functionality, click both the "Add Sound To End Of Queue (Channel 0)" button and the "Add Sound To End Of Queue (Channel 1)" button a few times. Below you can see a visual representation of each queue adding files each time the button is pressed.',
    'Once audio files are playing, you can click the buttons in the next examples to either stop the current sound and continue the queue for a given channel, stop the sound and empty the queue for a given channel, or stop all sounds and empty all queues for all channels.',
    'This package supports an infinite number of audio queue channels, but this example only shows two.'
  ];
  const headerText: string[] = ['Audio Queue', 'Single & Multi Channel Examples:'];

  const addSoundToQueueExample: Example[] = [
    {
      buttonFunction: handleAudioAndVisualizer(queueAudio, 0, getRandomAudioFile(audioFilesChannelZero)),
      buttonText: 'Add Sound To End Of Queue (Channel 0)',
      codeExample: 'queueAudio(audioFileGoesHere);',
      isDisabledWhenQueueIsEmpty: false
    },
    {
      buttonFunction: handleAudioAndVisualizer(queueAudio, 1, getRandomAudioFile(audioFilesChannelOne)),
      buttonText: 'Add Sound To End Of Queue (Channel 1)',
      codeExample: 'queueAudio(audioFileGoesHere, 1);',
      isDisabledWhenQueueIsEmpty: false
    }
  ];
  const stopCurrentSoundAndPlayNextExample: Example[] = [
    {
      buttonFunction: handleAudioAndVisualizer(stopCurrentAudioInChannel, 0),
      buttonText: 'Stop Current Sound And Play Next Sound (Channel 0)',
      codeExample: 'stopCurrentAudioInChannel();',
      isDisabledWhenQueueIsEmpty: true
    },
    {
      buttonFunction: handleAudioAndVisualizer(stopCurrentAudioInChannel, 1),
      buttonText: 'Stop Current Sound And Play Next Sound (Channel 1)',
      codeExample: 'stopCurrentAudioInChannel(1);',
      isDisabledWhenQueueIsEmpty: true
    }
  ];
  const stopSoundAndEmptyQueueExample: Example[] = [
    {
      buttonFunction: handleAudioAndVisualizer(stopAllAudioInChannel, 0),
      buttonText: 'Stop Sound And Empty Queue (Channel 0)',
      codeExample: 'stopAllAudioInChannel();',
      isDisabledWhenQueueIsEmpty: true
    },
    {
      buttonFunction: handleAudioAndVisualizer(stopAllAudioInChannel, 1),
      buttonText: 'Stop Sound And Empty Queue (Channel 1)',
      codeExample: 'stopAllAudioInChannel(1);',
      isDisabledWhenQueueIsEmpty: true
    }
  ];
  const stopAllSoundsInAllChannelsExample: Example[] = [
    {
      buttonFunction: handleAudioAndVisualizer(stopAllAudio),
      buttonText: 'Stop All Sounds In All Channels',
      codeExample: 'stopAllAudio();',
      isDisabledWhenQueueIsEmpty: true
    }
  ];

  return (
    <div className="app">
      <div className="example-section">
        <HeaderAndDescription description={descriptionText} header={headerText} />
        <div className="example-block-columns">
          <MultiChannelExampleBlock example={addSoundToQueueExample} isChannelQueueEmpty={queueState} />
          <MultiChannelExampleBlock example={stopCurrentSoundAndPlayNextExample} isChannelQueueEmpty={queueState} />
          <MultiChannelExampleBlock example={stopSoundAndEmptyQueueExample} isChannelQueueEmpty={queueState} />
          <MultiChannelExampleBlock example={stopAllSoundsInAllChannelsExample} isChannelQueueEmpty={queueState} />
        </div>
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
