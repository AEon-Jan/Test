# Backend

Minimal Node.js backend without external dependencies. Stores data in a JSON file.

## Usage

```
node index.js
```
Run `../install.sh` once to generate the `.env` file and initialize the data directory.
Alternatively open `http://localhost:3000/install` to run the web installer and enter your Spotify credentials.
After installation you will be redirected to `/panel` where you can manage playlists and users.

### Endpoints

- `GET /playlists` – list stored playlists
- `POST /playlists` – import a playlist by id
- `POST /users/register` – register a new user
- `POST /users/login` – login an existing user

