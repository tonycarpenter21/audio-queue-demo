import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Example } from '../types';
import './GlobalControls.css';
import React from 'react';

interface GlobalControlsProps {
  examples: Example[];
  queueState: { [channelNumber: number]: boolean };
  pauseState: { [channelNumber: number]: boolean };
}

function GlobalControls({ examples, queueState, pauseState }: GlobalControlsProps): JSX.Element {
  return (
    <div className="global-controls content-container global-container">
      <h3 className="section-title section-title-primary">Global Controls</h3>

      <div className="global-controls-container">
        {examples.map((example, index) => {
          // For global controls, check if all queues are empty
          const isQueueEmpty: boolean = queueState[0] && queueState[1];
          let isDisabled: boolean = (example.isDisabledWhenQueueIsEmpty ?? false) && isQueueEmpty;

          // Special logic for global pause/resume buttons
          const buttonText: string = example.buttonText.toLowerCase();
          if (buttonText.includes('resume all')) {
            // Resume All should only be enabled when at least one channel is paused
            isDisabled = !pauseState[0] && !pauseState[1];
          } else if (buttonText.includes('pause all')) {
            // Pause All should only be enabled when at least one channel is not paused and has audio
            const hasNonPausedWithAudio: boolean = (!pauseState[0] && !queueState[0]) || (!pauseState[1] && !queueState[1]);
            isDisabled = !hasNonPausedWithAudio;
          } else if (buttonText.includes('toggle all')) {
            // Toggle All should be enabled when any channel has audio (the function handles the toggle logic)
            isDisabled = isQueueEmpty;
          }

          const isLastItem: boolean = index === examples.length - 1;

          return (
            <React.Fragment key={example.buttonText}>
              <div className="global-control-item">
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
              </div>

              {!isLastItem && <div className="global-controls-divider" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default GlobalControls;
