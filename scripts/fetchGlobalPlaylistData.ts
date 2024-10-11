import fs   from 'fs';
import path from 'path';

import fetchPlaylistTracks from '../services/public/fetchPlaylistTracks';

// Populates the /data directory with json data from fetchPlaylistTracks(country) for each country
// TODO: Automatically run the script when the spotify playlists update (find exact time of this + 10mins)

const playlistData = [
  ['global', '37i9dQZEVXbMDoHDwVN2tF'],
  ['united_states', '37i9dQZEVXbLRQDuF5jeBp'],
  ['united_kingdom', '37i9dQZEVXbLnolsZ8PSNw'],
  ['mexico', '37i9dQZEVXbO3qyFxbkOE1'],
  ['brazil', '37i9dQZEVXbMXbN3EUUhlg'],
  ['germany', '37i9dQZEVXbJiZcmkrIHGU'],
  ['france', '37i9dQZEVXbIPWwFssbupI'],
  ['canada', '37i9dQZEVXbKj23U1GF4IR'],
  ['australia', '37i9dQZEVXbJPcfkRz0wJ0'],
  ['indonesia', '37i9dQZEVXbObFQZ3JLcXt'],
  ['italy', '37i9dQZEVXbIQnj7RRhdSX'],
  ['spain', '37i9dQZEVXbNFJfN1Vw8d9'],
  ['netherlands', '37i9dQZEVXbKCF6dqVpDkS'],
  ['sweden', '37i9dQZEVXbLoATJ81JYXz'],
  ['philippines', '37i9dQZEVXbNBz9cRCSFkY'],
  ['india', '37i9dQZEVXbLZ52XmnySJg'],
  ['japan', '37i9dQZEVXbKXQ4mDTEBXq'],
  ['argentina', '37i9dQZEVXbMMy2roB9myp']
];

const fetchGlobalPlaylistData = async () => {
  const dataDirectory = path.join(__dirname, '..', 'data');
  // Check for dir existing
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory);
  }

  for (const [country, playlistId] of playlistData) {
    const data = await fetchPlaylistTracks(playlistId);

    const jsonData = JSON.stringify(
      {
        country: country,
        ...data,
      }, null,2
    );

    const fileName = `top_50_${country}.json`;
    const filePath = path.join(dataDirectory, fileName);
    fs.writeFileSync(filePath, jsonData);
  }
};

export default fetchGlobalPlaylistData;