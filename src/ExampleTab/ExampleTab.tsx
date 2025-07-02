import { ExampleTabProps, ExampleTabs, Example } from '../types';
import './ExampleTab.css';
import GlobalControls from '../GlobalControls/GlobalControls';
import TabDescription from './TabDescription';
import ChannelsLayout from './ChannelsLayout';
import { tabContentDescriptions } from './exampleTabContent';
import { organizeExamplesByChannel } from './exampleOrganizer';
import { useQueueManipulation } from '../hooks/useQueueManipulation';
import { getTabSpecificComponents } from './tabComponentConfig';
import { useAudioQueue } from '../context/AudioQueueContext';

function ExampleTab(props: ExampleTabProps): JSX.Element {
  const { currentExampleTab, examples, visualizerRefs, onFadeOptionChange } = props;

  // Get state from context
  const { state } = useAudioQueue();
  const { queueState, queueLengths, pauseState, selectedFadeOption } = state;

  // Get descriptions for current tab
  const currentContent = tabContentDescriptions[currentExampleTab];
  const currentExamples: Example[] = examples[currentExampleTab] || [];

  // Organize examples by channel
  const { channel0, channel1, global } = organizeExamplesByChannel(currentExamples);

  // Use queue manipulation hook
  const { handleMoveUp, handleMoveDown, handleRemoveItem } = useQueueManipulation();

  // Get tab-specific components
  const tabSpecificComponents = getTabSpecificComponents(currentExampleTab, selectedFadeOption, onFadeOptionChange);

  // Determine which features are enabled for current tab
  const enableReordering = currentExampleTab === ExampleTabs.ADVANCED_QUEUE_MANIPULATION;
  const showAudioInfo = currentExampleTab === ExampleTabs.AUDIO_INFO;

  return (
    <div className="description-and-channel-example-container">
      <TabDescription descriptions={currentContent.description} />

      {tabSpecificComponents}

      <div className="channel-grouped-layout">
        {global.length > 0 && <GlobalControls examples={global} pauseState={pauseState} queueState={queueState} />}
        <ChannelsLayout
          channel0Examples={channel0}
          channel1Examples={channel1}
          enableReordering={enableReordering}
          onMoveDown={handleMoveDown}
          onMoveUp={handleMoveUp}
          onRemoveItem={handleRemoveItem}
          pauseState={pauseState}
          queueLengths={queueLengths}
          queueState={queueState}
          showAudioInfo={showAudioInfo}
          visualizerRefs={visualizerRefs}
        />
      </div>
    </div>
  );
}

export default ExampleTab;
