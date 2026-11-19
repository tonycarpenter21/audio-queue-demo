/**
 * End-to-end check of the built demo in Chromium: every tab is exercised and the page must not
 * throw. Needs Playwright with Chromium (npx playwright install chromium) and a build:
 *   npm run e2e
 * The build is served with HTTP Range support, like GitHub Pages (seeking needs it).
 */
const assert = require('node:assert/strict');
const path = require('node:path');
const { startServer } = require('./server');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright is not installed: npm install --no-save playwright && npx playwright install chromium');
  process.exit(2);
}

const PORT = 8765;
const BASE = `http://localhost:${PORT}/audio-queue-demo`;
const checks = [];
const check = async (name, run) => {
  try {
    await run();
    checks.push(`✔ ${name}`);
  } catch (error) {
    checks.push(`✖ ${name}: ${error.message}`);
  }
};

(async () => {
  const server = startServer(path.join(__dirname, '..', '..', 'build'), PORT);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { height: 900, width: 1280 } });
  const errors = [];
  const logs = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => logs.push(message.text()));
  const click = (name) => page.getByRole('button', { exact: false, name }).first().click();
  const openTab = async (label) => {
    await click('More Examples');
    await click(label);
    await page.waitForTimeout(300);
  };
  const openTopTab = async (label) => {
    await page.locator('.feature-highlights > button', { hasText: label }).first().click();
    await page.waitForTimeout(300);
  };
  const text = async (selector, index = 0) => (await page.locator(selector).nth(index).innerText()).replace(/\s+/g, ' ');

  await page.goto(`${BASE}/`);

  await check('footer shows the installed audioq version', async () => {
    assert.match(await text('.footer-version'), /Package Version: 3\./);
  });

  await check('queue management: a queued sound appears in the visualizer', async () => {
    await click('Add Sound To End Of Queue (Channel 0)');
    await page.waitForTimeout(800);
    assert.match(await text('.channel-visualizer'), /\.mp3/);
  });

  await check('playlist: plays, skips and records history', async () => {
    await openTopTab('Playlist');
    await click('Queue A Playlist (Channel 0)');
    await page.waitForTimeout(1500);
    assert.match(await text('.v3-panel'), /Background Music 0:0\d \/ 2:47 · 1x · playing · 3 up next/);
    await click('Repeat: off (Channel 0)');
    assert.equal(await page.getByRole('button', { name: /Repeat:/ }).innerText(), 'Repeat: all (Channel 0)');
    await click('Next Track (Channel 0)');
    await page.waitForTimeout(1200);
    assert.match(await text('.v3-panel'), /Teleporter Hum .*Recently played: getHistory\(0\) Background Music \(stopped/);
    assert.equal(await page.locator('.v3-spectrum').count(), 0, 'the spectrum belongs to the Playback tab');
    assert.equal(await page.locator('.channel-section').count(), 1, 'only channel 0 has examples here');
  });

  await check('playback: seeks, changes speed and shows the spectrum', async () => {
    await openTab('New: Playback');
    await click('Queue A Playlist (Channel 0)');
    await page.waitForTimeout(1500);
    assert.match(await text('.v3-panel'), /Background Music 0:0\d \/ 2:47 · 1x/);
    await click('Forward 10 Seconds (Channel 0)');
    await click('Speed 1x (Channel 0)');
    await page.waitForTimeout(1000);
    assert.match(await text('.v3-panel'), /Background Music 0:1\d \/ 2:47 · 1\.5x/);
    const heights = await page.locator('.v3-spectrum-bar').evaluateAll((bars) => bars.map((bar) => parseFloat(bar.style.height)));
    assert.equal(heights.length, 16);
    assert.ok(Math.max(...heights) > 4, `spectrum shows no signal: ${heights.join(', ')}`);
  });

  await check('sprites: preloads, and captions follow the segments that play', async () => {
    await openTab('New: Sprites');
    await click('Preload The Sprite');
    await page.waitForTimeout(800);
    assert.ok(
      logs.some((line) => /Sprite preloaded: \d+ KB/.test(line)),
      'no "Sprite preloaded" log'
    );
    await click('Queue Three Lines (Channel 0)');
    await click('Loop A 4-Second Segment');
    const captions = new Set();
    const beats = new Set();
    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(150);
      captions.add(await text('.v3-caption'));
      beats.add(await page.locator('.v3-beat').innerText());
    }
    for (const line of ['One minute left', 'Red team captured the base', 'Blue team wins!']) {
      assert.ok(
        [...captions].some((caption) => caption.includes(line)),
        `caption "${line}" not shown`
      );
    }
    assert.ok(beats.has('beat 1') && beats.has('beat 4'), `beats seen: ${[...beats].join(', ')}`);
  });

  await check('audio info: the channel store shows the playing sound', async () => {
    await openTab('Audio Info');
    await click('Add Sound To Queue (Channel 1)');
    await page.waitForTimeout(1500);
    assert.match(await text('.channel-audio-info', 1), /Status: ▶️ Playing File: \S+\.mp3 .*Items: 1/);
  });

  await check('debug console: the audioq event log shows queue events', async () => {
    await openTab('New: Notifications');
    await click('Show Debug Console');
    await click('audioq events: Off');
    await click('Generated Beep');
    await page.waitForTimeout(800);
    assert.ok(
      logs.some((line) => /^audioq \[channel 0\] start/.test(line)),
      'no "audioq [channel 0] start" debug line'
    );
    assert.match(await text('.debug-console-body'), /audioq \[channel 0\] start/);
    await click('audioq events: On');
    await page.getByRole('button', { name: '✕' }).click();
  });

  await check('notifications: dedupe, blob beep and queue limit', async () => {
    for (let i = 0; i < 3; i++) await click('Tap Fast');
    await click('Generated Beep');
    for (let i = 0; i < 4; i++) await click('Queue Up To 2');
    await page.waitForTimeout(1500);
    assert.equal(logs.filter((line) => /Laser #\d+ finished: skipped/.test(line)).length, 2);
    assert.equal(logs.filter((line) => /Rejected: Queue size limit/.test(line)).length, 2);
  });

  await check('volume: mute buttons toggle', async () => {
    await page.goto(`${BASE}/volume-and-looping`);
    await click('Start Looping Audio (Channel 1)');
    await click('Mute Everything');
    assert.equal(await page.getByRole('button', { name: /Everything/ }).innerText(), '🔈 Unmute Everything');
  });

  await check('volume: stereo panning buttons update the code example', async () => {
    await click('Channel 1 Left');
    assert.match(await text('.volume-controls-section'), /setChannelPan\(1, -1\);/);
    await click('Channel 1 Center');
    assert.match(await text('.volume-controls-section'), /setChannelPan\(1, 0\);/);
  });

  await check('changing tabs stops audio (header buttons and the browser back button)', async () => {
    const playbackState = () => page.evaluate(() => navigator.mediaSession.playbackState);
    await openTopTab('Playlist');
    await click('Queue A Playlist (Channel 0)');
    await page.waitForTimeout(1000);
    assert.equal(await playbackState(), 'playing');
    await openTopTab('Queue Management');
    await page.waitForTimeout(500);
    assert.notEqual(await playbackState(), 'playing', 'still playing after a header tab change');

    await openTab('New: Playback');
    await click('Queue A Playlist (Channel 0)');
    await page.waitForTimeout(1000);
    assert.equal(await playbackState(), 'playing');
    await page.goBack();
    await page.waitForTimeout(500);
    assert.notEqual(await playbackState(), 'playing', 'still playing after the back button');
  });

  await check('no page errors', async () => assert.deepEqual(errors, []));

  await browser.close();
  server.close();
  checks.forEach((line) => console.log(line));
  const failed = checks.filter((line) => line.startsWith('✖')).length;
  console.log(failed === 0 ? `${checks.length} checks passed` : `${failed} of ${checks.length} checks failed`);
  process.exit(failed === 0 ? 0 : 1);
})();
