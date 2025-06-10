const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.CLIENT_PORT || 4000;

function serveStatic(filePath, res) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const ext = path.extname(filePath);
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

http.createServer((req, res) => {
  const file = req.url === '/' ? '/index.html' : req.url;
  serveStatic(path.join(ROOT, file), res);
}).listen(PORT, () => console.log(`Client server listening on ${PORT}`));
