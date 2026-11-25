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
    await page.locator('.dropdown-menu button', { hasText: label }).first().click();
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

  await check('header tiles do not move on hover or when selected', async () => {
    const tile = page.locator('.feature-highlights > button.active').first();
    await tile.hover();
    assert.equal(await tile.evaluate((element) => getComputedStyle(element).transform), 'none');
  });

  await check('playlist: plays, skips and records history; the panel sits beside the controls', async () => {
    await openTab('Playlist');
    await click('Queue A Playlist (Channel 0)');
    await page.waitForTimeout(1500);
    assert.match(await text('.v3-panel'), /Background Music 0:0\d \/ 2:47 · 1x · playing · 3 up next/);
    const upNext = async () => page.locator('.v3-up-next li').allInnerTexts();
    assert.deepEqual((await upNext()).sort(), ['Laser Volley', 'Teleporter Hum', 'Teleporter Wind-Down']);
    await click('Shuffle Upcoming Tracks (Channel 0)');
    await page.waitForTimeout(200);
    assert.deepEqual((await upNext()).sort(), ['Laser Volley', 'Teleporter Hum', 'Teleporter Wind-Down'], 'shuffle lost tracks');
    await click('Repeat: off (Channel 0)');
    assert.equal(await page.getByRole('button', { name: /Repeat:/ }).innerText(), 'Repeat: all (Channel 0)');
    await click('Next Track (Channel 0)');
    await page.waitForTimeout(1200);
    assert.match(await text('.v3-panel'), /Recently played: getHistory\(0\) Background Music \(stopped/);
    assert.equal(await page.locator('.channel-section').count(), 1, 'only channel 0 has examples here');
    const panel = await page.locator('.example-side-panel').boundingBox();
    const controls = await page.locator('.channel-section').first().boundingBox();
    assert.ok(panel && controls && panel.x > controls.x + controls.width - 1, 'the panel is not to the right of the controls');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(200);
    const scrolled = await page.locator('.example-side-panel').boundingBox();
    assert.ok(scrolled && scrolled.y >= 0 && scrolled.y < 900, 'the panel scrolled out of view (sticky broken)');
    await page.evaluate(() => window.scrollTo(0, 0));
    await click('Stop All Sounds');
    await page.waitForTimeout(300);
    assert.match(await text('.v3-panel'), /Nothing playing/);
  });

  await check('playback: seeks and changes speed', async () => {
    await openTab('Playback & Lock Screen');
    await click('Queue A Playlist (Channel 0)');
    await page.waitForTimeout(1500);
    assert.match(await text('.v3-panel'), /Background Music 0:0\d \/ 2:47 · 1x/);
    await click('Forward 10 Seconds (Channel 0)');
    await click('Speed 1x (Channel 0)');
    await page.waitForTimeout(1000);
    assert.match(await text('.v3-panel'), /Background Music 0:1\d \/ 2:47 · 1\.5x/);
  });

  await check('visualizer: channel 0, channel 1 and the combined spectrum all show signal', async () => {
    await openTab('Visualizer');
    await click('Play Music (Channel 0)');
    await click('Play Laser Fire (Channel 1)');
    await page.waitForTimeout(1500);
    const peaks = await page
      .locator('.v3-spectrum')
      .evaluateAll((spectrums) =>
        spectrums.map((spectrum) => Math.max(...Array.from(spectrum.children, (bar) => parseFloat(bar.style.height))))
      );
    assert.equal(peaks.length, 3);
    peaks.forEach((peak, index) => assert.ok(peak > 4, `spectrum ${index} shows no signal (${peaks.join(', ')})`));
  });

  await check('sprites: preloads, and captions follow the segments that play', async () => {
    await openTab('Sprites & Captions');
    await click('Preload The Sprite');
    await page.waitForTimeout(800);
    assert.ok(
      logs.some((line) => /Sprite preloaded: \d+ KB/.test(line)),
      'no "Sprite preloaded" log'
    );
    await click('Queue Three Lines (Channel 0)');
    const captions = new Set();
    for (let i = 0; i < 40; i++) {
      await page.waitForTimeout(150);
      captions.add(await text('.v3-caption'));
    }
    for (const line of ['One minute left', 'Red team captured the base', 'Blue team wins!']) {
      assert.ok(
        [...captions].some((caption) => caption.includes(line)),
        `caption "${line}" not shown`
      );
    }
  });

  await check('audio ducking: on when the tab opens', async () => {
    await openTab('Audio Ducking');
    assert.equal(await page.getByRole('button', { name: /Volume Ducking/ }).count(), 1);
    assert.match(await page.getByRole('button', { name: /Volume Ducking/ }).innerText(), /Disable Volume Ducking/);
  });

  await check('advanced queue manipulation: queue details open the debug console', async () => {
    await openTab('Advanced Queue Manipulation');
    await click('Log Queue Details');
    await page.waitForTimeout(300);
    assert.match(await text('.debug-console-body'), /Queue lengths/);
    await page.getByRole('button', { name: '✕' }).click();
  });

  await check('audio info: the channel store shows the playing sound', async () => {
    await openTab('Audio Info');
    await click('Add Sound To Queue (Channel 1)');
    await page.waitForTimeout(1500);
    assert.match(await text('.channel-audio-info', 1), /Status: ▶️ Playing File: \S+\.mp3 .*Items: 1/);
  });

  await check('debug console: the audioq event log shows queue events', async () => {
    await openTab('Notifications & Voice');
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
    await openTab('Playlist');
    await click('Queue A Playlist (Channel 0)');
    await page.waitForTimeout(1000);
    assert.equal(await playbackState(), 'playing');
    await openTopTab('Queue Management');
    await page.waitForTimeout(500);
    assert.notEqual(await playbackState(), 'playing', 'still playing after a header tab change');

    await openTab('Playback & Lock Screen');
    await click('Queue A Playlist (Channel 0)');
    await page.waitForTimeout(1000);
    assert.equal(await playbackState(), 'playing');
    await page.goBack();
    await page.waitForTimeout(500);
    assert.notEqual(await playbackState(), 'playing', 'still playing after the back button');
  });

  await check('diagnostics: an experiment runs and its report is saved', async () => {
    await page.goto(`${BASE}/diagnostics`);
    const item = page.locator('.diagnostics-item', { hasText: 'audioq queue (current library)' });
    await item.getByRole('button', { name: 'Run' }).click();
    await item.locator('.diagnostics-result').waitFor({ timeout: 40000 });
    assert.match(await item.locator('.diagnostics-result').innerText(), /4 of 4 clips played/);
    await page.locator('.diagnostics-saved').waitFor({ timeout: 5000 });
    const saved = await page.locator('.diagnostics-saved').innerText();
    const file = path.join(__dirname, '..', '..', saved.replace(/^.*: /, '').trim());
    const report = JSON.parse(require('node:fs').readFileSync(file, 'utf8'));
    assert.equal(report.results[0].id, 'audioq-queue');
    assert.ok(
      report.results[0].log.some((line) => line.includes('audioq [channel 0] start')),
      'no debug log in the report'
    );
    require('node:fs').unlinkSync(file);
  });

  const savedReport = async (selector) => {
    const message = await page.locator(selector).last().innerText();
    const file = path.join(__dirname, '..', '..', message.replace(/^.*: /, '').trim());
    const report = JSON.parse(require('node:fs').readFileSync(file, 'utf8'));
    require('node:fs').unlinkSync(file);
    return report;
  };

  await check('diagnostics: pause tests resume where they paused, and record what was heard', async () => {
    for (const title of [
      'Pause: Full volume: play() only',
      'Pause: Full volume: fresh element',
      'Pause: Web Audio: fresh element',
      'Pause: audioq, full volume',
      'Pause: audioq, half volume'
    ]) {
      const item = page.locator('.diagnostics-item', { hasText: title });
      await item.getByRole('button', { name: 'Run' }).click();
      await item.locator('.diagnostics-result').waitFor({ timeout: 15000 });
      const summary = await item.locator('.diagnostics-result').innerText();
      const atPause = Number(/paused at (\d+) ms/.exec(summary)?.[1]);
      const later = Number(/(\d+) ms 300 ms later/.exec(summary)?.[1]);
      assert.ok(atPause >= 700, `${title}: paused at ${atPause} ms`);
      // A fresh element reads 0 until it has loaded, so judge by where it is 300 ms after resuming.
      assert.ok(later >= atPause && later <= atPause + 450, `${title}: ${later} ms 300 ms after resuming from ${atPause} ms`);
    }
    await page
      .locator('.diagnostics-item', { hasText: 'Pause: Full volume: play() only' })
      .getByRole('button', { name: 'Every word once' })
      .click();
    await page.waitForTimeout(500);
    const report = await savedReport('.diagnostics-saved');
    assert.equal(report.results.find((result) => result.id === 'pause-plain').heard, 'Every word once');
  });

  await check('progress trace: ?trace records the bars for 4 seconds and saves them', async () => {
    await page.goto(`${BASE}/?trace`);
    await click('Add Sound To End Of Queue (Channel 0)');
    const note = page.locator('div', { hasText: /^Saved on your computer: / });
    await note.last().waitFor({ timeout: 10000 });
    const message = await note.last().innerText();
    const file = path.join(__dirname, '..', '..', message.replace(/^.*: /, '').trim());
    const report = JSON.parse(require('node:fs').readFileSync(file, 'utf8'));
    require('node:fs').unlinkSync(file);
    assert.equal(report.kind, 'progress-trace');
    assert.ok(report.frames.length >= 10, `${report.frames.length} frames`);
    assert.ok(
      report.frames.some((frame) => (frame.widths.visualQueue ?? 0) > 10),
      'visual queue bar never moved'
    );
  });

  await check('no page errors', async () => assert.deepEqual(errors, []));

  await browser.close();
  server.close();
  checks.forEach((line) => console.log(line));
  const failed = checks.filter((line) => line.startsWith('✖')).length;
  console.log(failed === 0 ? `${checks.length} checks passed` : `${failed} of ${checks.length} checks failed`);
  process.exit(failed === 0 ? 0 : 1);
})();
