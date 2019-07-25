export default (item, data) => {
  let track;
  let images;

  if (data) {
    track = data.type === 'playlist' ? item.track : item;
    images = data.type === 'album' ? data.images : track.album.images;
  } else {
    track = item;
    images = track.album.images;
  }

  let { artists, name } = track;
  const artistsTitle = artists.reduce((acc, artist) => `${acc}, ${artist.name}`, '').slice(2);
  const { id } = track;
  name = name.length > 32 ? `${name.slice(0, 32)}...` : name;
  artists = artists.length > 20 ? `${artists.slice(0, 20)}...` : artists;
  return {
    id, name, artists: artistsTitle, images
  };
};
