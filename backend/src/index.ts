import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { loadDB, saveDB } from './storage';
import { getAuthUrl, fetchPlaylist } from './spotify';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


const publicDir = path.join(__dirname, '..', 'public');


app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/install', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'install.html'));
});

app.post('/install', (req: Request, res: Response) => {

  const { clientId, clientSecret, redirectUri } = req.body;
  const env = [
    `SPOTIFY_CLIENT_ID=${clientId}`,
    `SPOTIFY_CLIENT_SECRET=${clientSecret}`,
    `SPOTIFY_REDIRECT_URI=${redirectUri}`,
    `PORT=${PORT}`,
    `CLIENT_PORT=4000`,
    `DB_FILE=./data/data.json`
  ].join('\n');
  fs.writeFileSync(path.join(repoRoot, '.env'), env);

  // initialize data directory
  loadDB();
  res.json({ status: 'installed' });
});

app.get('/panel', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'panel.html'));
});

app.get('/login', (_req: Request, res: Response) => {
  res.redirect(getAuthUrl());
});

app.get('/auth/callback', (req: Request, res: Response) => {

  const code = req.query.code;
  res.send(`Received code: ${code}`);
});


app.post('/api/playlists/:id', async (req: Request, res: Response) => {

  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    const playlist = await fetchPlaylist(token, req.params.id);
    const db = loadDB();
    db.playlists.push(playlist);
    saveDB(db);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ error: 'failed to import playlist' });
  }
});


app.post('/api/sessions', (_req: Request, res: Response) => {

  const db = loadDB();
  const id = crypto.randomUUID();
  const session = { id, users: [] };
  db.sessions.push(session);
  saveDB(db);
  res.json({ id });
});

app.use('/public', express.static(publicDir));

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
