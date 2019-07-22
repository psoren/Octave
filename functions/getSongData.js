export default (song) => {
  const { track } = song;


  let imageExists = false;
  let albumArt = '../assets/default_album.png';

  if (track.album
      && track.album.images
      && track.album.images[2]
      && track.album.images[2].url) {
    imageExists = true;
    albumArt = track.album.images[2].url;
  }

  let { artists, name } = track;
  const artistsTitle = artists.reduce((acc, artist) => `${acc}, ${artist.name}`, '').slice(2);
  const { id } = track;
  name = name.length > 20 ? `${name.slice(0, 20)}...` : name;
  artists = artists.length > 20 ? `${artists.slice(0, 20)}...` : artists;
  return {
    id, name, artists: artistsTitle, imageExists, albumArt
  };
};
