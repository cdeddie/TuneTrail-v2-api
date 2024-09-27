// Used for getting the images on front page

import fetchPlaylistTracks  from '../services/public/fetchPlaylistTracks';

type Album = {
  image: string;
  link: string;
}

export const fetchAndProcessPlaylist = async (playlistId: string): Promise<Album[]> => {
  try {
    const playlistData: any = await fetchPlaylistTracks(playlistId);
    
    const albums: Album[] = playlistData.items.map((item: any) => ({
      image: item.track.album.images[0].url,
      link: item.track.album.uri
    }));

    return albums;
  } catch (error) {
    console.error('Error fetching and processing playlist:', error);
    return [];
  }
}

// Usage
// const playlistId = '1534IsiGUiLaOyS8HSwD3D';