import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Example } from '../types';
import Divider from '../Divider/Divider';
import './GlobalControls.css';

interface GlobalControlsProps {
  examples: Example[];
  queueState: { [channelNumber: number]: boolean };
}

function GlobalControls({ examples, queueState }: GlobalControlsProps): JSX.Element {
  return (
    <div className="global-controls content-container global-container">
      <h3 className="section-title section-title-accent">Global Controls</h3>

      <div className="global-controls-container">
        {examples.map((example, index) => {
          // For global controls, check if all queues are empty
          const isQueueEmpty = queueState[0] && queueState[1];
          const isDisabled = example.isDisabledWhenQueueIsEmpty && isQueueEmpty;
          const isLastItem = index === examples.length - 1;

          return (
            <div className="global-control-item" key={example.buttonText}>
              <button className={`button ${isDisabled ? 'disabled' : ''}`} disabled={isDisabled} onClick={() => example.buttonFunction()}>
                {example.buttonText}
              </button>

              <SyntaxHighlighter
                customStyle={{
                  borderRadius: '10px',
                  padding: '10px 20px'
                }}
                language="typescript"
                style={vscDarkPlus}
              >
                {example.codeExample}
              </SyntaxHighlighter>

              {!isLastItem && <Divider />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GlobalControls;
