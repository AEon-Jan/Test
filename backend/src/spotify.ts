import querystring from 'querystring';

export function getAuthUrl(): string {
  const clientId = process.env.SPOTIFY_CLIENT_ID || '';
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI || '';
  const scope = [
    'playlist-read-private',
    'user-read-private'
  ].join(' ');
  const params = querystring.stringify({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope
  });
  return `https://accounts.spotify.com/authorize?${params}`;
}

export async function fetchPlaylist(token: string, id: string): Promise<any> {
  const res = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Spotify request failed');
  return res.json();
}
