import VolumeSlider from '../VolumeSlider/VolumeSlider';
import { setChannelVolume, setAllChannelsVolume, setGlobalVolume, getGlobalVolume } from 'audioq';
import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Divider, { DividerOrientation } from '../Divider/Divider';
import './VolumeControlsSection.css';

interface VolumeStates {
  channel0: number;
  channel1: number;
  global: number;
  setAllChannels: number;
}

export default function VolumeControlsSection(): JSX.Element {
  const [volumeStates, setVolumeStates] = useState<VolumeStates>({
    channel0: 100,
    channel1: 100,
    global: 100,
    setAllChannels: 100
  });

  // Initialize global volume on mount
  useEffect(() => {
    const currentGlobalVolume: number = getGlobalVolume();
    setVolumeStates((prev) => ({
      ...prev,
      global: Math.round(currentGlobalVolume * 100)
    }));
  }, []);

  // Reset volumes to 100% when component unmounts
  useEffect(() => {
    return (): void => {
      // Reset all volumes to default when leaving the Volume & Looping tab
      setChannelVolume(0, 1);
      setChannelVolume(1, 1);
      setAllChannelsVolume(1);
      setGlobalVolume(1);
    };
  }, []);

  const handleChannelVolumeChange = (volume: number, channelNumber: number): void => {
    setChannelVolume(channelNumber, volume);
    setVolumeStates((prev) => ({
      ...prev,
      [`channel${channelNumber}`]: Math.round(volume * 100)
    }));
  };

  const handleSetAllChannelsVolumeChange = (volume: number): void => {
    setAllChannelsVolume(volume);
    // Update all channel sliders to match
    setVolumeStates({
      channel0: Math.round(volume * 100),
      channel1: Math.round(volume * 100),
      global: volumeStates.global,
      setAllChannels: Math.round(volume * 100)
    });
  };

  const handleGlobalVolumeChange = (volume: number): void => {
    setGlobalVolume(volume);
    setVolumeStates((prev) => ({
      ...prev,
      global: Math.round(volume * 100)
    }));
  };

  return (
    <div className="volume-controls-section">
      <h3 className="section-title section-title-primary">Volume Controls</h3>

      <div className="volume-controls-grid">
        {/* Channel 0 Volume */}
        <div className="volume-control-item">
          <VolumeSlider
            channelNumber={0}
            initialVolume={1}
            onVolumeChange={(volume) => handleChannelVolumeChange(volume, 0)}
            volume={volumeStates.channel0 / 100}
          />
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

        <Divider hideOnMobile noMargin orientation={DividerOrientation.Vertical} />
        <Divider hideOnDesktop noMargin />

        {/* Channel 1 Volume */}
        <div className="volume-control-item">
          <VolumeSlider
            channelNumber={1}
            initialVolume={1}
            onVolumeChange={(volume) => handleChannelVolumeChange(volume, 1)}
            volume={volumeStates.channel1 / 100}
          />
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

        <Divider hideOnMobile noMargin spanFullWidth />
        <Divider hideOnDesktop noMargin />

        {/* Set All Channels Volume */}
        <div className="volume-control-item">
          <VolumeSlider initialVolume={1} label="Set All Channel Volumes" onVolumeChange={handleSetAllChannelsVolumeChange} />
          <SyntaxHighlighter
            customStyle={{
              borderRadius: '10px',
              padding: '10px 20px'
            }}
            language="typescript"
            style={vscDarkPlus}
          >
            {`setAllChannelsVolume(${volumeStates.setAllChannels / 100});
// Set All Channel Volume sets all 
// channels to the same level.
// Unlike global volume changes,
// this changes each channel's 
// individual volume setting.
`}
          </SyntaxHighlighter>
        </div>

        <Divider hideOnMobile noMargin orientation={DividerOrientation.Vertical} />
        <Divider hideOnDesktop noMargin />

        {/* Global Volume */}
        <div className="volume-control-item">
          <VolumeSlider initialVolume={1} label="Global Volume" onVolumeChange={handleGlobalVolumeChange} />
          <SyntaxHighlighter
            customStyle={{
              borderRadius: '10px',
              padding: '10px 20px'
            }}
            language="typescript"
            style={vscDarkPlus}
          >
            {`setGlobalVolume(${volumeStates.global / 100}); // ${volumeStates.global}%
getGlobalVolume(); // Returns ${volumeStates.global / 100}
// Global volume scales all 
// channels proportionally
// while preserving their 
// relative volume levels
`}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
