import { useEffect } from 'react';
import { ExampleTabs } from '../types';

const siteName: string = 'Audio Channel Queue Demo';

const PAGE_TITLES: Record<ExampleTabs, string> = {
  [ExampleTabs.QUEUE_MANAGEMENT]: `Queue Management - ${siteName}`,
  [ExampleTabs.PAUSE_RESUME]: `Pause & Resume - ${siteName}`,
  [ExampleTabs.VOLUME_CONTROL]: `Volume Control - ${siteName}`,
  [ExampleTabs.PRIORITY_SOUNDS]: `Priority Sounds - ${siteName}`,
  [ExampleTabs.ADVANCED_FEATURES]: `Advanced Features - ${siteName}`
};

const DEFAULT_TITLE: string = 'Audio Channel Queue Demo';

export function usePageTitle(currentTab: ExampleTabs): void {
  useEffect(() => {
    document.title = PAGE_TITLES[currentTab] || DEFAULT_TITLE;
  }, [currentTab]);
}
