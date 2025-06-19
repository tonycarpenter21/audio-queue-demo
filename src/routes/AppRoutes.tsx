import { Routes, Route, Navigate } from 'react-router-dom';
import { MutableRefObject } from 'react';
import { AudioQueueVisualizerHandle } from '../AudioQueueVisualizer/AudioQueueVisualizer';
import ExampleTab from '../ExampleTab/ExampleTab';
import { Example, ExampleTabs, ExampleTabRoutes } from '../types';
import { FadeOption } from '../MultiChannelExampleBlock/exampleData';

interface AppRoutesProps {
  examples: Record<string, Example[]>;
  onFadeOptionChange: (option: FadeOption) => void;
  pauseState: { [channelNumber: number]: boolean };
  queueState: { [channelNumber: number]: boolean };
  selectedFadeOption: FadeOption;
  visualizerRefs: MutableRefObject<AudioQueueVisualizerHandle | null>[];
}

function AppRoutes({
  examples,
  onFadeOptionChange,
  pauseState,
  queueState,
  selectedFadeOption,
  visualizerRefs
}: AppRoutesProps): JSX.Element {
  const createExampleTabRoute = (tab: ExampleTabs): JSX.Element => (
    <ExampleTab
      currentExampleTab={tab}
      examples={examples}
      onFadeOptionChange={onFadeOptionChange}
      pauseState={pauseState}
      queueState={queueState}
      selectedFadeOption={selectedFadeOption}
      visualizerRefs={visualizerRefs}
    />
  );

  return (
    <Routes>
      <Route element={<Navigate replace to={ExampleTabRoutes[ExampleTabs.QUEUE_MANAGEMENT]} />} path="/" />
      <Route element={createExampleTabRoute(ExampleTabs.QUEUE_MANAGEMENT)} path={ExampleTabRoutes[ExampleTabs.QUEUE_MANAGEMENT]} />
      <Route element={createExampleTabRoute(ExampleTabs.PAUSE_RESUME)} path={ExampleTabRoutes[ExampleTabs.PAUSE_RESUME]} />
      <Route element={createExampleTabRoute(ExampleTabs.VOLUME_CONTROL)} path={ExampleTabRoutes[ExampleTabs.VOLUME_CONTROL]} />
      <Route element={createExampleTabRoute(ExampleTabs.PRIORITY_SOUNDS)} path={ExampleTabRoutes[ExampleTabs.PRIORITY_SOUNDS]} />
    </Routes>
  );
}

export default AppRoutes;
