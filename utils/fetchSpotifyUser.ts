const fetchSpotifyUser = async (accessToken: string): Promise<SpotifyApi.UserObjectPublic> => {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json() as SpotifyApi.UserObjectPublic;
  return data;
};

export { fetchSpotifyUser };
