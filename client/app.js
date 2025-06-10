const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

function App() {
  const [playlistId, setPlaylistId] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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

  const registerUser = () => {
    fetch('/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }).then(() => {
      setUsername('');
      setPassword('');
    });
  };

  const loginUser = () => {
    fetch('/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    }).then(() => {
      setUsername('');
      setPassword('');
    });
  };

  return (
    React.createElement('div', null,
      React.createElement('h1', null, 'Hitster Client'),
      React.createElement('a', { href: '/auth/login' }, 'Login with Spotify'),
      React.createElement('div', null,
        React.createElement('input', {
          value: username,
          onChange: e => setUsername(e.target.value),
          placeholder: 'Username'
        }),
        React.createElement('input', {
          type: 'password',
          value: password,
          onChange: e => setPassword(e.target.value),
          placeholder: 'Password'
        }),
        React.createElement('button', { onClick: registerUser }, 'Register'),
        React.createElement('button', { onClick: loginUser }, 'Login')
      ),
      React.createElement('div', null,
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
