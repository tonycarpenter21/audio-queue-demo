import { Routes, Route, Navigate } from 'react-router-dom';
import { MutableRefObject } from 'react';
import { AudioQueueVisualizerHandle } from '../AudioQueueVisualizer/AudioQueueVisualizer';
import ExampleTab from '../ExampleTab/ExampleTab';
import { Example, ExampleTabs, ExampleTabRoutes, FadeOption } from '../types';

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

  // Get all tabs that should have routes (exclude dropdown container)
  const routableTabs: ExampleTabs[] = Object.values(ExampleTabs).filter((tab: ExampleTabs) => tab !== ExampleTabs.OTHER_FEATURES);

  return (
    <Routes>
      <Route element={<Navigate replace to={ExampleTabRoutes[ExampleTabs.QUEUE_MANAGEMENT]} />} path="/" />
      {routableTabs.map((tab: ExampleTabs) => (
        <Route element={createExampleTabRoute(tab)} key={tab} path={ExampleTabRoutes[tab]} />
      ))}
    </Routes>
  );
}

export default AppRoutes;
