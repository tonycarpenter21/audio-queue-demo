import './ExampleTabMenu.css';

export enum ExampleTabs {
  ADD_SOUND = 'Add Sound To Queue',
  STOP_CURRENT_SOUND = 'Stop Current Sound In Queue',
  STOP_ALL_SOUNDS_IN_QUEUE = 'Stop All Sounds In Queue',
  STOP_ALL_SOUNDS_IN_ALL_QUEUES = 'Stop All Sounds In All Queues'
}

interface ExampleTabMenuProps {
  currentExampleTab: ExampleTabs;
  onTabChange: (tab: ExampleTabs) => void;
}

function ExampleTabMenu({ currentExampleTab, onTabChange }: ExampleTabMenuProps): JSX.Element {
  return (
    <div className="example-tabs-container">
      {Object.values(ExampleTabs).map((tab) => (
        <div className={`example-tab ${currentExampleTab === tab ? 'active' : ''}`} key={tab} onClick={() => onTabChange(tab)}>
          {tab}
        </div>
      ))}
    </div>
  );
}

export default ExampleTabMenu;
