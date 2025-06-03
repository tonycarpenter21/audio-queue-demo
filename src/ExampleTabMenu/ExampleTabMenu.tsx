import './ExampleTabMenu.css';

export enum ExampleTabs {
  BASIC_QUEUE = 'Add & Remove From Queue',
  PAUSE_RESUME = 'Pause & Resume',
  VOLUME_CONTROL = 'Volume Control',
  ADVANCED_FEATURES = 'Advanced Features'
}

interface ExampleTabMenuProps {
  currentExampleTab: ExampleTabs;
  onTabChange: (tab: ExampleTabs) => void;
}

function ExampleTabMenu({ currentExampleTab, onTabChange }: ExampleTabMenuProps): JSX.Element {
  const tabs: ExampleTabs[] = Object.values(ExampleTabs);

  return (
    <div className="example-tabs-container">
      {tabs.map((tab) => (
        <button
          className={`example-tab ${currentExampleTab === tab ? 'active' : ''}`}
          key={tab}
          onClick={() => onTabChange(tab)}
          type="button"
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default ExampleTabMenu;
