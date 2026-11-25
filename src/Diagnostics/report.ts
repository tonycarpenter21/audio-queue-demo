/**
 * Sending diagnostics to the computer running `npm run phone`, which saves each report under
 * qa-reports/ (see scripts/e2e/server.js).
 */
import audioqPackage from 'audioq/package.json';

export type SaveState = { message: string; ok: boolean } | undefined;

/** Wraps a report body with what identifies the device and build. */
export const withDeviceInfo = (body: object): object => ({
  audioqVersion: audioqPackage.version,
  createdAt: new Date().toISOString(),
  maxTouchPoints: navigator.maxTouchPoints,
  page: window.location.href,
  userAgent: navigator.userAgent,
  ...body
});

/** Posts a report to the phone server. */
export const postReport = async (body: object): Promise<SaveState> => {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/__qa`, {
      body: JSON.stringify(withDeviceInfo(body), null, 2),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    });
    if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
    return { message: `Saved on your computer: ${await response.text()}`, ok: true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown error';
    return { message: `Could not save (${reason}). Serve with npm run phone, or use Download.`, ok: false };
  }
};
