# Hitster Clone

This project provides a minimal skeleton for a Spotify-enabled party game. The
code is split into a TypeScript backend using Express and a React frontend. A
top-level `package.json` uses npm workspaces so common tasks can be executed
from the repository root.

```
repo/
├─ backend/            # Node (Express+TS)
│  ├─ src/
│  │  └─ index.ts
│  ├─ docs/
│  │  └─ openapi.yaml
│  └─ tsconfig.json
├─ frontend/           # React (placeholder)
│  └─ (Vite app files)
├─ infra/
│  └─ docker-compose.yml
├─ scripts/
│  ├─ install.sh
│  └─ installer.js
```

Run `scripts/install.sh` to generate a `.env` file and initialize local data.
Install dependencies for each workspace and start the development servers:

```bash
npm install --workspace backend
npm install --workspace frontend
npm --workspace backend run build
npm --workspace backend start
npm --workspace frontend start
```

Run `npm test` from the repository root to execute any future tests. The
default implementation simply prints a placeholder message.
