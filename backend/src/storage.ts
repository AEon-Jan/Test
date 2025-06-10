import fs from 'fs';
import path from 'path';

export interface Database {
  users: any[];
  playlists: any[];
  sessions: any[];
}

const DATA_FILE = path.join(__dirname, '..', 'data', 'data.json');

export function loadDB(): Database {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ users: [], playlists: [], sessions: [] }, null, 2)
    );
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as Database;
}

export function saveDB(db: Database): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}
