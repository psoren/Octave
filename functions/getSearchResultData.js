export default (item) => {
  let imageExists = false;
  let albumArt = '../assets/default_album.png';
  if (item.images && item.images[0] && item.images[0].url) {
    imageExists = true;
    albumArt = item.images[0].url;
  }
  let { name } = item;
  const { type, id } = item;
  name = name.length > 20 ? `${name.slice(0, 20)}...` : name;
  return {
    id, name, type, imageExists, albumArt
  };
};
