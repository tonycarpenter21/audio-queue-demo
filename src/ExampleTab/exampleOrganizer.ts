import { Example } from '../types';

export interface OrganizedExamples {
  channel0: Example[];
  channel1: Example[];
  global: Example[];
}

export function organizeExamplesByChannel(examples: Example[]): OrganizedExamples {
  const channel0: Example[] = [];
  const channel1: Example[] = [];
  const global: Example[] = [];

  examples.forEach((example) => {
    const text: string = example.buttonText.toLowerCase();

    if (text.includes('channel 0')) {
      channel0.push(example);
    } else if (text.includes('channel 1')) {
      channel1.push(example);
    } else if (text.includes('all channels') || text.includes('all sounds')) {
      global.push(example);
    }
  });

  return { channel0, channel1, global };
}
