const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

function App() {
  const [playlistId, setPlaylistId] = useState('');
  const [playlists, setPlaylists] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);


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
    })
      .then(res => {
        if (res.ok) setLoggedIn(true);
      });
  };

  return (
    React.createElement('div', { id: 'panel' },
      React.createElement('h1', null, 'Hitster Webpanel'),
      loggedIn ? null : React.createElement('div', { className: 'auth' },
        React.createElement('input', {
          placeholder: 'Username',
          value: username,
          onChange: e => setUsername(e.target.value)
        }),
        React.createElement('input', {
          type: 'password',
          placeholder: 'Password',
          value: password,
          onChange: e => setPassword(e.target.value)
        }),
        React.createElement('div', { className: 'auth-buttons' },
          React.createElement('button', { onClick: registerUser }, 'Register'),
          React.createElement('button', { onClick: loginUser }, 'Login')
        )
      ),
      loggedIn && React.createElement('p', null, 'Logged in'),
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
