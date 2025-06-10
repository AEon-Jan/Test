const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.CLIENT_PORT || 4000;
app.listen(PORT, () => console.log(`Client server listening on ${PORT}`));
