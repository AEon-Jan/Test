# Backend

Express backend with Socket.IO, Spotify OAuth authentication and playlist import.

## Usage

```
npm install
npm start
```

Open `http://localhost:3000/install` and fill in your Spotify credentials.
After installation you will be redirected to `/panel` where you can manage playlists and users.

### Endpoints

- `GET /playlists` – list stored playlists
- `POST /playlists` – import a playlist by id
- `POST /users/register` – register a new user
- `POST /users/login` – login an existing user

