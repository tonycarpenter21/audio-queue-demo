/**
 * Makes a short sine-wave tone as a WAV Blob, the same kind of Blob you get from a recording,
 * a text-to-speech service or a file input.
 */
export function createBeep(frequency: number, durationMs: number = 300, sampleRate: number = 44100): Blob {
  const samples: number = Math.round((sampleRate * durationMs) / 1000);
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  const writeText = (offset: number, text: string): void => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeText(0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeText(36, 'data');
  view.setUint32(40, samples * 2, true);

  const fadeSamples: number = Math.min(samples / 2, sampleRate / 100); // 10 ms fades avoid clicks
  for (let i = 0; i < samples; i++) {
    const envelope: number = Math.min(1, i / fadeSamples, (samples - i) / fadeSamples);
    const value: number = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * envelope * 0.4;
    view.setInt16(44 + i * 2, value * 0x7fff, true);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}
