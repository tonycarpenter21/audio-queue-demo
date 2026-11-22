/**
 * Serves the production build on your local network for testing on a phone: npm run phone
 * (it builds first). Prints every address the phone can try; use the one on your Wi-Fi network,
 * usually 192.168.x.x or 10.x.x.x. Seeking and sprites need HTTP Range support, which this
 * server has (like GitHub Pages).
 */
const os = require('node:os');
const path = require('node:path');
const { startServer } = require('./e2e/server');

const PORT = Number(process.env.PORT ?? 3000);
const BASE = '/audio-queue-demo/';

const isPrivate = (address) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(address);

const addresses = Object.entries(os.networkInterfaces()).flatMap(([name, entries]) =>
  (entries ?? []).filter((entry) => entry.family === 'IPv4' && !entry.internal).map((entry) => ({ address: entry.address, name }))
);
addresses.sort((a, b) => Number(isPrivate(b.address)) - Number(isPrivate(a.address)));

const server = startServer(path.join(__dirname, '..', 'build'), PORT);
server.on('error', (error) => {
  console.error(
    `Could not start on port ${PORT}: ${error.message}. Try another port: PORT=3001 npm run phone (PowerShell: $env:PORT=3001; npm run phone)`
  );
  process.exit(1);
});
server.on('listening', () => {
  console.log(`\nServing the demo build on port ${PORT}. On this computer: http://localhost:${PORT}${BASE}\n`);
  console.log('On your phone (same Wi-Fi), open one of these in Safari:');
  for (const { address, name } of addresses) {
    console.log(`  http://${address}:${PORT}${BASE}   (${name}${isPrivate(address) ? '' : ', probably not your Wi-Fi'})`);
  }
  console.log(
    '\nIf the phone cannot connect: allow Node.js through the firewall for private networks, and make ' +
      'sure your Wi-Fi is set to a private network (Windows: Settings > Network & internet > Wi-Fi > ' +
      'your network > Private network).\nPress Ctrl+C to stop.\n'
  );
});
