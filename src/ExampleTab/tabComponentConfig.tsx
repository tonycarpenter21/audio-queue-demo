import { ExampleTabs, FadeOption } from '../types';
import FadeControls from './FadeControls';
import VolumeControlsSection from './VolumeControlsSection';

// Type-safe factory functions for each component
function createFadeControls(selectedFadeOption: FadeOption, onFadeOptionChange: (option: FadeOption) => void): JSX.Element {
  return <FadeControls key={ExampleTabs.PAUSE_RESUME} onFadeOptionChange={onFadeOptionChange} selectedFadeOption={selectedFadeOption} />;
}

function createVolumeControlsSection(): JSX.Element {
  return <VolumeControlsSection key={ExampleTabs.VOLUME_LOOPING} />;
}

export function getTabSpecificComponents(
  currentTab: ExampleTabs,
  selectedFadeOption?: FadeOption,
  onFadeOptionChange?: (option: FadeOption) => void
): JSX.Element[] {
  const components: JSX.Element[] = [];

  switch (currentTab) {
    case ExampleTabs.PAUSE_RESUME:
      components.push(createFadeControls(selectedFadeOption || 'None', onFadeOptionChange || ((): void => {})));
      break;
    case ExampleTabs.VOLUME_LOOPING:
      components.push(createVolumeControlsSection());
      break;
  }

  return components;
}
