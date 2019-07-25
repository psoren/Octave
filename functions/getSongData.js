export default (item, data) => {
  let track;
  let images;
  let key = '';

  if (data) {
    track = data.type === 'playlist' ? item.track : item;
    key = data.type === 'playlist' ? item.added_at + track.id : '';
    images = data.type === 'album' ? data.images : track.album.images;
  } else {
    track = item;
    const { images: albumImages } = track.album;
    images = albumImages;
  }

  let { artists, name } = track;
  const artistsTitle = artists.reduce((acc, artist) => `${acc}, ${artist.name}`, '').slice(2);
  const { id } = track;
  name = name.length > 32 ? `${name.slice(0, 32)}...` : name;
  artists = artists.length > 20 ? `${artists.slice(0, 20)}...` : artists;
  return {
    id, name, artists: artistsTitle, images, key
  };
};
