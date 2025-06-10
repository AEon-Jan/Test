const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

function App() {
  const [playlistId, setPlaylistId] = useState('');
  const [playlists, setPlaylists] = useState([]);


  useEffect(() => {
    fetch('/playlists')
      .then(res => res.json())
      .then(setPlaylists);

    const socket = io();
    socket.on('playlist:imported', (data) => {
      setPlaylists(p => [...p, data]);
    });
  }, []);

  const importPlaylist = () => {
    fetch('/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: playlistId })
    })
      .then(res => res.json())
      .then(() => setPlaylistId(''));
  };

  return (
    React.createElement('div', { id: 'panel' },
      React.createElement('h1', null, 'Hitster Webpanel'),
      React.createElement('a', { href: '/auth/login', className: 'login' }, 'Login with Spotify'),
      React.createElement('div', { className: 'controls' },
        React.createElement('input', {
          value: playlistId,
          onChange: e => setPlaylistId(e.target.value),
          placeholder: 'Playlist ID'
        }),
        React.createElement('button', { onClick: importPlaylist }, 'Import')
      ),
      React.createElement('ul', null,
        playlists.map(p =>
          React.createElement('li', { key: p.id }, `${p.name} (${p.tracks} tracks)`)
        )
      )
    )
  );
}

const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));
