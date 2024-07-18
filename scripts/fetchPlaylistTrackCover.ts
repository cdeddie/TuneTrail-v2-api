// Used for getting the images on front page

import fetchPlaylistTracks  from '../services/public/fetchPlaylistTracks';

type Album = {
  image: string;
  link: string;
}

async function fetchAndProcessPlaylist(playlistId: string): Promise<Album[]> {
  try {
    const playlistData: any = await fetchPlaylistTracks(playlistId);
    
    const albums: Album[] = playlistData.items.map((item: any) => ({
      image: item.track.album.images[1].url,
      link: item.track.album.uri
    }));

    return albums;
  } catch (error) {
    console.error('Error fetching and processing playlist:', error);
    return [];
  }
}

// Usage
const playlistId = '1534IsiGUiLaOyS8HSwD3D';

fetchAndProcessPlaylist(playlistId)
  .then(albums => {
    console.log(`Processed albums (${albums.length}):`, albums);
  })
  .catch(error => {
    console.error('Script execution failed:', error);
  });

export default fetchAndProcessPlaylist;