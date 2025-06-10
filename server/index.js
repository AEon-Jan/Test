require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const fetch = require('node-fetch');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const playlists = [];
const users = [];
let accessToken = null;
let refreshToken = null;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

app.use(bodyParser.json());
// simple in-memory user management
app.post('/users/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'User exists' });
  }
  users.push({ username, password });
  res.json({ status: 'registered' });
});

app.post('/users/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
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
  res.json(playlists);
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
  playlists.push(playlist);
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
