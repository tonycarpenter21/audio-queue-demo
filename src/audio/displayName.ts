import { extractFileName } from 'audioq';

/**
 * A readable name for a bundled audio file. Webpack adds a content hash
 * (laser.4f3c2a1b.mp3); this removes it.
 */
export function displayName(src: string): string {
  return extractFileName(src).replace(/\.[0-9a-f]{8,}(?=\.\w+$)/, '');
}
