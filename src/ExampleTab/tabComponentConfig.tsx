import type { JSX } from 'react';
import { ExampleTabs, FadeOption } from '../types';
import CaptionPanel from '../V3Panels/CaptionPanel';
import PlaylistPanel from '../V3Panels/PlaylistPanel';
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
      components.push(createFadeControls(selectedFadeOption ?? 'None', onFadeOptionChange ?? ((): void => undefined)));
      break;
    case ExampleTabs.VOLUME_LOOPING:
      components.push(createVolumeControlsSection());
      break;
    case ExampleTabs.PLAYLIST:
      components.push(<PlaylistPanel key={ExampleTabs.PLAYLIST} />);
      break;
    case ExampleTabs.SPRITES_CAPTIONS:
    case ExampleTabs.NOTIFICATIONS:
      components.push(<CaptionPanel key={currentTab} />);
      break;
  }

  return components;
}
