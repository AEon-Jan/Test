1. Import eigener Spotify-Playlists
Authentifizierung: Implementierung von OAuth 2.0 über die Spotify API zur sicheren Nutzerverbindung.

Playlist-Verwaltung: Playlist-Import per Spotify-ID und Speicherung der Metadaten im Backend.

Caching: Lokales Speichern von Playlist-Daten zur Verbesserung der Performance.

2. Digitaler Spielmodus (ohne Papierkarten)
Frontend: React.js mit responsivem Design (Tailwind CSS) zur optimalen Nutzung auf allen mobilen Geräten.

Spielerinteraktion: Echtzeit-Kommunikation mit WebSockets (Socket.io) zur unmittelbaren Aktualisierung der Spielstände.

Session-Handling: Individuelle, stateful Session-Verwaltung pro Nutzer.

3. Gemeinsame Lobby mit zentraler Musikwiedergabe
Lobby-System: Erstellung und Verwaltung eindeutiger Spiel-Session-IDs.

Synchronisierung: Echtzeit-Streaming von Spotify-Tracks zum zentralen Host-Gerät.

Verbindung und Steuerung: Verteilte Steuerung der Wiedergabe mit synchronisierten Statusmeldungen an verbundene Clients.

4. Digitales Einscannen von Spielkarten
Kamerazugriff: Nutzung der nativen Geräte-Kamera zur Kartenaufnahme via Browser-APIs.

OCR-Technologie: Texterkennung über Tesseract.js für Barcode- oder Texterkennung.

Datenintegration: Automatische Verknüpfung der erkannten Kartendaten mit dem Backend zur unmittelbaren Spielintegration.

5. Klassische Hitster-Spielmechanik mit Tokens
Token-Verwaltung: Implementierung eines Punktesystems basierend auf Nutzeraktionen und Spielfortschritt.

Speicherung: Nutzung einer NoSQL-Datenbank (MongoDB) für persistente Speicherung der Tokens und Spielerdaten.

Logik-Engine: Node.js-Backend (Express.js) zur automatisierten Verwaltung und Auswertung von Spieleraktionen.

Live-Updates: Echtzeit-Aktualisierung der Spielstände und Ranglisten via WebSockets.

## Project Setup

This repository contains a simple Node.js backend and a minimal React frontend.

- `server/` – Express backend with Socket.IO and placeholder routes for Spotify OAuth and playlist import.
- `client/` – React frontend served via Express.
- `docker-compose.yml` – Example setup to run both services with Docker.
Run `./install.sh` to install dependencies for both the backend and the client.
Start the server with `npm start` inside `server/` (or `docker-compose up`).
Open `http://localhost:3000/install` and enter your Spotify credentials.
After submitting the form the database is initialized and you will be redirected to `/panel`.

The generated `.env` file stores the credentials and the app will be ready on subsequent starts.
Use the web panel at `/panel` to register users, log in and import playlists.

### API Endpoints

- `GET /playlists` – List imported playlists
- `POST /playlists` – Import a playlist by ID, body: `{ "id": "<playlistId>" }`
- `POST /users/register` – Register a user, body: `{ "username": "name", "password": "pass" }`
- `POST /users/login` – Login a user, body: `{ "username": "name", "password": "pass" }`
