import { AudioFile } from '../audio/audioFilesAndUtils';
import { AudioQueueFunction } from '../AudioQueueVisualizer/audioQueueVisualizerUtils';
import { Example } from './MultiChannelExampleBlock';

type HandleAudioAndVisualizer = (
  audioQueueFunction: AudioQueueFunction,
  channelNumber?: number,
  audioFile?: {
    src: string;
    name: string;
    duration: number;
  }
) => () => void;
type QueueAudio = (audioUrl: string, channelNumber?: number) => Promise<void>;
type StopAudioInChannel = (channelNumber?: number) => void;
type GetRandomAudioFile = (audioFiles: Record<string, AudioFile>) => AudioFile;

export const createExamples = (
  handleAudioAndVisualizer: HandleAudioAndVisualizer,
  queueAudio: QueueAudio,
  stopCurrentAudioInChannel: StopAudioInChannel,
  stopAllAudioInChannel: StopAudioInChannel,
  stopAllAudio: () => void,
  getRandomAudioFile: GetRandomAudioFile,
  audioFilesChannelZero: Record<string, AudioFile>,
  audioFilesChannelOne: Record<string, AudioFile>
): Record<string, Example[]> => {
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

  return {
    addSoundToQueueExample,
    stopAllSoundsInAllChannelsExample,
    stopCurrentSoundAndPlayNextExample,
    stopSoundAndEmptyQueueExample
  };
};
