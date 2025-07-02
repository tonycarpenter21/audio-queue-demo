import VolumeSlider from '../VolumeSlider/VolumeSlider';
import { setChannelVolume, setAllChannelsVolume } from 'audio-channel-queue';
import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './VolumeControlsSection.css';

interface VolumeStates {
  channel0: number;
  channel1: number;
  master: number;
}

export default function VolumeControlsSection(): JSX.Element {
  const [volumeStates, setVolumeStates] = useState<VolumeStates>({
    channel0: 100,
    channel1: 100,
    master: 100
  });

  // Reset volumes to 100% when component unmounts
  useEffect(() => {
    return (): void => {
      // Reset all volumes to default when leaving the Volume & Looping tab
      setChannelVolume(0, 1);
      setChannelVolume(1, 1);
      setAllChannelsVolume(1);
    };
  }, []);

  const handleVolumeChange = (volume: number, channelNumber?: number): void => {
    if (channelNumber !== undefined) {
      setChannelVolume(channelNumber, volume);
      // Update volume state for code examples
      setVolumeStates((prev) => ({
        ...prev,
        [`channel${channelNumber}`]: Math.round(volume * 100)
      }));
    } else {
      setAllChannelsVolume(volume);
      // Update master volume state for code examples
      setVolumeStates((prev) => ({
        ...prev,
        master: Math.round(volume * 100)
      }));
    }
  };

  return (
    <div className="volume-controls-section">
      <h3 className="section-title section-title-primary">Volume Controls</h3>
      <div className="volume-controls-container">
        <div className="volume-control-item">
          <VolumeSlider channelNumber={0} initialVolume={1} onVolumeChange={handleVolumeChange} />
          <SyntaxHighlighter
            customStyle={{
              borderRadius: '10px',
              padding: '10px 20px'
            }}
            language="typescript"
            style={vscDarkPlus}
          >
            {`setChannelVolume(0, ${volumeStates.channel0 / 100});`}
          </SyntaxHighlighter>
        </div>

        <div className="volume-controls-divider" />

        <div className="volume-control-item">
          <VolumeSlider channelNumber={1} initialVolume={1} onVolumeChange={handleVolumeChange} />
          <SyntaxHighlighter
            customStyle={{
              borderRadius: '10px',
              padding: '10px 20px'
            }}
            language="typescript"
            style={vscDarkPlus}
          >
            {`setChannelVolume(1, ${volumeStates.channel1 / 100});`}
          </SyntaxHighlighter>
        </div>

        <div className="volume-controls-divider" />

        <div className="volume-control-item">
          <VolumeSlider initialVolume={1} isGlobal={true} onVolumeChange={handleVolumeChange} />
          <SyntaxHighlighter
            customStyle={{
              borderRadius: '10px',
              padding: '10px 20px'
            }}
            language="typescript"
            style={vscDarkPlus}
          >
            {`setAllChannelsVolume(${volumeStates.master / 100});`}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
