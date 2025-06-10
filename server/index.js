const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx !== -1) process.env[line.slice(0, idx)] = line.slice(idx + 1);
  }
}
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const dbFile = path.join(dataDir, 'data.json');

function readData() {
  try {
    return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  } catch {
    return { users: [], playlists: [] };
  }
}

function writeData(data) {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

let data = readData();

function parseBody(req, cb) {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', () => {
    try { cb(JSON.parse(body)); } catch { cb({}); }
  });
}

function sendJSON(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

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
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hitster backend running');
    return;
  }

  if (req.method === 'GET' && url.pathname === '/install') {
    return serveStatic(path.join(__dirname, 'public', 'install.html'), res);
  }

  if (req.method === 'POST' && url.pathname === '/install') {
    parseBody(req, body => {
      const envVars = {
        SPOTIFY_CLIENT_ID: body.clientId || '',
        SPOTIFY_CLIENT_SECRET: body.clientSecret || '',
        SPOTIFY_REDIRECT_URI: body.redirectUri || ''
      };
      const envContent = Object.entries(envVars)
        .map(([k, v]) => `${k}=${v}`)
        .join('\n');
      fs.writeFileSync(envPath, envContent + '\n');
      if (!fs.existsSync(dbFile)) writeData({ users: [], playlists: [] });
      sendJSON(res, 200, { status: 'installed' });
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/users/register') {
    parseBody(req, body => {
      if (!body.username || !body.password) return sendJSON(res, 400, { error: 'Missing credentials' });
      if (data.users.find(u => u.username === body.username)) return sendJSON(res, 400, { error: 'User exists' });
      data.users.push({ username: body.username, password: body.password });
      writeData(data);
      sendJSON(res, 200, { status: 'registered' });
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/users/login') {
    parseBody(req, body => {
      const user = data.users.find(u => u.username === body.username && u.password === body.password);
      if (!user) return sendJSON(res, 401, { error: 'Invalid credentials' });
      sendJSON(res, 200, { status: 'logged_in' });
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/playlists') {
    return sendJSON(res, 200, data.playlists);
  }

  if (req.method === 'POST' && url.pathname === '/playlists') {
    parseBody(req, body => {
      if (!body.id) return sendJSON(res, 400, { error: 'Missing playlist id' });
      if (!data.playlists.find(p => p.id === body.id)) {
        data.playlists.push({ id: body.id });
        writeData(data);
      }
      sendJSON(res, 200, { status: 'imported' });
    });
    return;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/panel')) {
    const rel = url.pathname.replace('/panel', '') || '/index.html';
    return serveStatic(path.join(__dirname, '..', 'client', rel), res);
  }

  if (req.method === 'GET' && url.pathname.startsWith('/public')) {
    const rel = url.pathname.replace('/public', '');
    return serveStatic(path.join(__dirname, 'public', rel), res);
  }

  res.writeHead(404);
  res.end('Not found');
}).listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
