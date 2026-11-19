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
const startServer = (root, port) =>
  http
    .createServer((req, res) => {
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
