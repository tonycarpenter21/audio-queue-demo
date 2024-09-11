import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './MultiChannelExampleBlock.css';

export interface Example {
  buttonFunction: () => void;
  buttonText: string; 
  codeExample: string;
  isDisabledWhenQueueIsEmpty: boolean;
}

interface MultiChannelExampleBlockProps {
  example: Example[];
  isChannelZeroQueueEmpty: boolean;
  isChannelOneQueueEmpty: boolean;
}

function MultiChannelExampleBlock({ example, isChannelZeroQueueEmpty, isChannelOneQueueEmpty }: MultiChannelExampleBlockProps) {
  return (
    <div className='example-block'>
      {example.map((item, index) => {
        const isQueueEmpty = example.length === 1
          ? (isChannelZeroQueueEmpty && isChannelOneQueueEmpty) // This is for Stop all Sounds In All Channels where if any channel is not empty the button is valid
          : index === 0 
            ? isChannelZeroQueueEmpty 
            : isChannelOneQueueEmpty;
        const isDisabled = item.isDisabledWhenQueueIsEmpty && isQueueEmpty;
        const isLastItem = index === example.length - 1;

        return(
          <div className='example-block-section' key={item.buttonText}>
            <button 
              className={`button ${isDisabled ? 'disabled' : ''}`} 
              onClick={() => item.buttonFunction()}
              disabled={isDisabled}
            >
              {item.buttonText}
            </button>
      
            <SyntaxHighlighter 
              language="typescript" 
              style={vscDarkPlus} 
              customStyle={{
                borderRadius: "10px",
                padding: "20px 40px",
                width: "250px"
              }}
            >
              {item.codeExample}
            </SyntaxHighlighter>
      
            { !isLastItem && <div className="divider"/> }
          </div>
        )
      })}
    </div>
  );
}

export default MultiChannelExampleBlock;
