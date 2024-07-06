// Returns the spotify users id as a promise<string>

const fetchSpotifyUser = async (accessToken: string): Promise<string> => {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export { fetchSpotifyUser };