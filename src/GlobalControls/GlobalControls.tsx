import type { JSX } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Example } from '../types';
import { anyChannelActivity, channelActivity, isExampleEnabled } from '../ExampleTab/exampleOrganizer';
import Divider, { DividerOrientation } from '../Divider/Divider';
import './GlobalControls.css';
import React from 'react';

interface GlobalControlsProps {
  examples: Example[];
  queueState: Record<number, boolean>;
  pauseState: Record<number, boolean>;
}

function GlobalControls({ examples, pauseState, queueState }: GlobalControlsProps): JSX.Element {
  return (
    <div className="global-controls content-container global-container">
      <h3 className="section-title section-title-primary">Global Controls</h3>

      <div className="global-controls-container">
        {examples.map((example, index) => {
          const activity = anyChannelActivity(
            [0, 1].map((channel) => channelActivity(queueState[channel] ?? true, pauseState[channel] ?? false, 0))
          );
          const isDisabled: boolean = !isExampleEnabled(example, activity);

          const isLastItem: boolean = index === examples.length - 1;

          return (
            <React.Fragment key={example.buttonText}>
              <div className="global-control-item">
                <button
                  className={`button ${isDisabled ? 'disabled' : ''}`}
                  disabled={isDisabled}
                  onClick={() => void example.buttonFunction()}
                >
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
              </div>

              {!isLastItem && <Divider orientation={DividerOrientation.Vertical} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default GlobalControls;
