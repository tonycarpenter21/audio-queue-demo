import { useEffect } from 'react';
import { ExampleTabs } from '../types';

const siteName: string = 'AudioQ Demo';

const PAGE_TITLES: Record<ExampleTabs, string> = Object.fromEntries(
  Object.values(ExampleTabs).map((tab: ExampleTabs) => [tab, `${tab} - ${siteName}`])
) as Record<ExampleTabs, string>;

export function usePageTitle(currentTab: ExampleTabs): void {
  useEffect(() => {
    document.title = PAGE_TITLES[currentTab] || siteName;
  }, [currentTab]);
}
