import type { JSX } from 'react';
import { ExampleTabs, FadeOption } from '../types';
import CaptionPanel from '../V3Panels/CaptionPanel';
import PlaylistPanel from '../V3Panels/PlaylistPanel';
import VisualizerPanel from '../V3Panels/VisualizerPanel';
import FadeControls from './FadeControls';
import VolumeControlsSection from './VolumeControlsSection';

/** Extra components a tab shows: settings above its controls, and a live panel beside them. */
export interface TabComponents {
  /** Shown above the controls (settings the buttons use). */
  above: JSX.Element[];
  /** Shown beside the controls (stays in view while scrolling; a mini player on phones). */
  beside: JSX.Element | undefined;
}

export function getTabSpecificComponents(
  currentTab: ExampleTabs,
  selectedFadeOption?: FadeOption,
  onFadeOptionChange?: (option: FadeOption) => void
): TabComponents {
  switch (currentTab) {
    case ExampleTabs.PAUSE_RESUME:
      return {
        above: [
          <FadeControls
            key={currentTab}
            onFadeOptionChange={onFadeOptionChange ?? ((): void => undefined)}
            selectedFadeOption={selectedFadeOption ?? 'None'}
          />
        ],
        beside: undefined
      };
    case ExampleTabs.VOLUME_LOOPING:
      return { above: [<VolumeControlsSection key={currentTab} />], beside: undefined };
    case ExampleTabs.PLAYLIST:
      return { above: [], beside: <PlaylistPanel variant="playlist" /> };
    case ExampleTabs.PLAYBACK:
      return { above: [], beside: <PlaylistPanel variant="playback" /> };
    case ExampleTabs.VISUALIZER:
      return { above: [], beside: <VisualizerPanel /> };
    case ExampleTabs.SPRITES_CAPTIONS:
      return { above: [], beside: <CaptionPanel channels={[0]} /> };
    case ExampleTabs.NOTIFICATIONS:
      return { above: [], beside: <CaptionPanel channels={[1]} /> };
    default:
      return { above: [], beside: undefined };
  }
}
