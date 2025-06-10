const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(q) {
  return new Promise(res => rl.question(q, answer => res(answer)));
}

(async () => {
  const envExample = path.join(__dirname, '.env.example');
  const envTarget = path.join(__dirname, '.env');

  const defaults = {};
  if (fs.existsSync(envExample)) {
    for (const line of fs.readFileSync(envExample, 'utf8').split(/\r?\n/)) {
      if (!line || line.startsWith('#')) continue;
      const idx = line.indexOf('=');
      const key = line.slice(0, idx);
      const value = line.slice(idx + 1);
      defaults[key] = value;
    }
  }

  const result = {};
  for (const key of Object.keys(defaults)) {
    const input = await ask(`${key} [${defaults[key]}]: `);
    result[key] = input || defaults[key];
  }

  const envContent = Object.entries(result)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  fs.writeFileSync(envTarget, envContent);
  console.log('Generated .env');

  const dataDir = path.join(__dirname, 'server', 'data');
  const dbFile = path.join(dataDir, 'data.json');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify({ users: [], playlists: [] }, null, 2));
  console.log('Initialized data directory');

  rl.close();
})();
