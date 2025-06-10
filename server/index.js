require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const fetch = require('node-fetch');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const envPath = path.join(__dirname, '.env');
const dbFile = process.env.DB_FILE || 'data.db';
const db = new Database(dbFile);

function isInstalled() {
  return fs.existsSync(envPath);
}

function initDb() {
  db.prepare(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`).run();
  db.prepare(`CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    name TEXT,
    tracks INTEGER
  )`).run();
}

if (isInstalled()) {
  initDb();
}

function saveEnv(config) {
  const lines = [
    `SPOTIFY_CLIENT_ID=${config.clientId}`,
    `SPOTIFY_CLIENT_SECRET=${config.clientSecret}`,
    `SPOTIFY_REDIRECT_URI=${config.redirectUri}`,
    `DB_FILE=${dbFile}`
  ];
  fs.writeFileSync(envPath, lines.join('\n'));
}

// simple landing page so `/` doesn't 404 after auth redirect
app.get('/', (_req, res) => {
  res.send('Hitster backend running');
});

let accessToken = null;
let refreshToken = null;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/panel', express.static(path.join(__dirname, '..', 'client')));

app.get('/install', (_req, res) => {
  if (isInstalled()) {
    return res.redirect('/panel');
  }
  res.sendFile(path.join(__dirname, 'public/install.html'));
});

app.post('/install', (req, res) => {
  const { clientId, clientSecret, redirectUri } = req.body;
  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  saveEnv({ clientId, clientSecret, redirectUri });
  process.env.SPOTIFY_CLIENT_ID = clientId;
  process.env.SPOTIFY_CLIENT_SECRET = clientSecret;
  process.env.SPOTIFY_REDIRECT_URI = redirectUri;
  initDb();
  res.json({ status: 'installed' });
});

app.post('/users/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  try {
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, password);
    res.json({ status: 'registered' });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'User exists' });
    }
    res.status(500).json({ error: 'Failed to register' });
  }
});

app.post('/users/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ status: 'logged_in' });
});

// OAuth login route
app.get('/auth/login', (_req, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: 'playlist-read-private'
  });
  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
});

// OAuth callback route
app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Missing code');
  }
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI
    })
  });
  const data = await tokenRes.json();
  accessToken = data.access_token;
  refreshToken = data.refresh_token;
  res.redirect('/');
});

// Endpoint to list imported playlists
app.get('/playlists', (_req, res) => {
  const rows = db.prepare('SELECT * FROM playlists').all();
  res.json(rows);
});

// Endpoint to import playlist data
app.post('/playlists', async (req, res) => {
  const playlistId = req.body.id;
  if (!playlistId) {
    return res.status(400).json({ error: 'Missing playlist id' });
  }
  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated with Spotify' });
  }
  const infoRes = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!infoRes.ok) {
    return res.status(400).json({ error: 'Failed to fetch playlist' });
  }
  const info = await infoRes.json();
  const playlist = {
    id: info.id,
    name: info.name,
    tracks: info.tracks.total
  };
  db.prepare('INSERT OR REPLACE INTO playlists (id, name, tracks) VALUES (?, ?, ?)')
    .run(playlist.id, playlist.name, playlist.tracks);
  io.emit('playlist:imported', playlist);
  res.json({ status: 'imported', playlist });
});

io.on('connection', (socket) => {
  console.log('client connected');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
