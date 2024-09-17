import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Divider from '../Divider/Divider';
import './MultiChannelExampleBlock.css';

export interface Example {
  buttonFunction: () => void;
  buttonText: string;
  codeExample: string;
  isDisabledWhenQueueIsEmpty: boolean;
}

interface MultiChannelExampleBlockProps {
  example: Example[];
  isChannelQueueEmpty: { [channelNumber: number]: boolean };
}

function MultiChannelExampleBlock({ example, isChannelQueueEmpty }: MultiChannelExampleBlockProps): JSX.Element {
  return (
    <div className="example-block">
      {example.map((item, index) => {
        const isQueueEmpty =
          example.length === 1
            ? isChannelQueueEmpty[0] && isChannelQueueEmpty[1] // This is for Stop all Sounds In All Channels where if any channel is not empty the button is valid
            : index === 0
              ? isChannelQueueEmpty[0]
              : isChannelQueueEmpty[1];
        const isDisabled = item.isDisabledWhenQueueIsEmpty && isQueueEmpty;
        const isLastItem = index === example.length - 1;

        return (
          <div className="example-block-section" key={item.buttonText}>
            <button className={`button ${isDisabled ? 'disabled' : ''}`} disabled={isDisabled} onClick={() => item.buttonFunction()}>
              {item.buttonText}
            </button>

            <SyntaxHighlighter
              customStyle={{
                borderRadius: '10px',
                padding: '10px 20px'
              }}
              language="typescript"
              style={vscDarkPlus}
            >
              {item.codeExample}
            </SyntaxHighlighter>

            {!isLastItem && <Divider />}
          </div>
        );
      })}
    </div>
  );
}

export default MultiChannelExampleBlock;
