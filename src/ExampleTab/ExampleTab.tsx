import Description from '../Description/Description';
import { ExampleTabs } from '../ExampleTabMenu/ExampleTabMenu';
import MultiChannelExampleBlock, { Example } from '../MultiChannelExampleBlock/MultiChannelExampleBlock';
import './ExampleTab.css';

function ExampleTab(props: {
  currentExampleTab: ExampleTabs;
  examples: Record<string, Example[]>;
  queueState: {
    [channelNumber: number]: boolean;
  };
}): JSX.Element {
  const { currentExampleTab, examples, queueState } = props;
  const { addSoundToQueueExample, stopAllSoundsInAllChannelsExample, stopCurrentSoundAndPlayNextExample, stopSoundAndEmptyQueueExample } =
    examples;

  const tabContent = {
    [ExampleTabs.ADD_SOUND]: {
      description: [
        'The top examples in each block all default to channel 0 which will satisfy the majority of implementations. If you want your sounds to never overlap, this is what you want. ',
        'Each audio queue channel will play sounds one after another which means they will never overlap within their given channel. The bottom example in each block all run in a second audio queue channel (channel 1) which means they will overlap with the audio played in the top examples (channel 0).',
        'To test this functionality, click both the "Add Sound To End Of Queue (Channel 0)" button and the "Add Sound To End Of Queue (Channel 1)" button a few times. Below you can see a visual representation of each queue adding files each time the button is pressed.'
      ],
      examples: [{ example: addSoundToQueueExample, key: 'addSound' }]
    },
    [ExampleTabs.STOP_CURRENT_SOUND]: {
      description: [
        'This example demonstrates how to stop the current sound and continue playing the next sound in the queue.',
        'You can use this functionality to skip to the next audio file in the queue without clearing the entire queue.'
      ],
      examples: [
        { example: addSoundToQueueExample, key: 'addSound' },
        { example: stopCurrentSoundAndPlayNextExample, key: 'stopCurrent' }
      ]
    },
    [ExampleTabs.STOP_ALL_SOUNDS_IN_QUEUE]: {
      description: [
        'This example shows how to stop all sounds in a specific queue and clear that queue.',
        'This is useful when you want to reset a specific audio channel without affecting others.'
      ],
      examples: [
        { example: addSoundToQueueExample, key: 'addSound' },
        { example: stopSoundAndEmptyQueueExample, key: 'stopAllInQueue' }
      ]
    },
    [ExampleTabs.STOP_ALL_SOUNDS_IN_ALL_QUEUES]: {
      description: [
        'This example demonstrates how to stop all sounds across all queues and clear all queues.',
        'Use this when you need to reset the entire audio state of your application.'
      ],
      examples: [
        { example: addSoundToQueueExample, key: 'addSound' },
        { example: stopAllSoundsInAllChannelsExample, key: 'stopAllInAllQueues' }
      ]
    }
  };

  const currentContent = tabContent[currentExampleTab];

  return (
    <div className="description-and-channel-example-container">
      <Description description={currentContent.description} />
      <div className="example-block-columns">
        {currentContent.examples.map(({ example, key }) => (
          <MultiChannelExampleBlock example={example} isChannelQueueEmpty={queueState} key={key} />
        ))}
      </div>
    </div>
  );
}

export default ExampleTab;
