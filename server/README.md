# Backend

Express backend with Socket.IO, Spotify OAuth authentication and playlist import.

## Usage

```
npm install
npm start
```

Create a `.env` file as shown in the repository root to configure the Spotify credentials.

### Endpoints

- `GET /playlists` – list stored playlists
- `POST /playlists` – import a playlist by id
- `POST /users/register` – register a new user
- `POST /users/login` – login an existing user