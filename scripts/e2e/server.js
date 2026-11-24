/** Static server for the demo build with HTTP Range support (like GitHub Pages) and SPA fallback. */
const http = require('http');
const fs = require('fs');
const path = require('path');
const base = '/audio-queue-demo';
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.json': 'application/json',
  '.svg': 'image/svg+xml'
};
const REPORT_LIMIT_BYTES = 5 * 1024 * 1024;
const defaultReportDir = path.join(__dirname, '..', '..', 'qa-reports');

/** Saves a diagnostics report POSTed by the /diagnostics page; answers with its path. */
const saveReport = (req, res, reportDir) => {
  const chunks = [];
  let size = 0;
  req.on('data', (chunk) => {
    size += chunk.length;
    if (size > REPORT_LIMIT_BYTES) req.destroy();
    else chunks.push(chunk);
  });
  req.on('end', () => {
    try {
      JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      res.writeHead(400);
      return res.end('not JSON');
    }
    fs.mkdirSync(reportDir, { recursive: true });
    const name = `report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const file = path.join(reportDir, name);
    fs.writeFileSync(file, Buffer.concat(chunks));
    console.log(`Diagnostics report saved: ${file}`);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(path.join(path.basename(reportDir), name));
  });
};

/**
 * Serves the build at /audio-queue-demo/, with Range support; POST /audio-queue-demo/__qa saves a
 * diagnostics report into `reportDir` (qa-reports/ in the demo by default).
 */
const startServer = (root, port, reportDir = defaultReportDir) =>
  http
    .createServer((req, res) => {
      if (req.method === 'POST' && req.url.split('?')[0] === `${base}/__qa`) return saveReport(req, res, reportDir);
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (!p.startsWith(base)) {
        res.writeHead(404);
        return res.end();
      }
      let file = path.join(root, p.slice(base.length));
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(root, 'index.html');
      const size = fs.statSync(file).size;
      const type = types[path.extname(file)] || 'application/octet-stream';
      const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
      if (m) {
        const start = m[1] ? +m[1] : 0;
        const end = m[2] ? +m[2] : size - 1;
        res.writeHead(206, {
          'Accept-Ranges': 'bytes',
          'Content-Length': end - start + 1,
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Content-Type': type
        });
        return fs.createReadStream(file, { start, end }).pipe(res);
      }
      res.writeHead(200, { 'Accept-Ranges': 'bytes', 'Content-Length': size, 'Content-Type': type });
      fs.createReadStream(file).pipe(res);
    })
    .listen(port);

module.exports = { startServer };
