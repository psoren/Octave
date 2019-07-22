export default (track, imageExists, imageSource) => {
  const { id, name, artists } = track;
  const artistsTitle = artists.reduce((acc, artist) => `${acc}, ${artist.name}`, '').slice(2);
  return {
    id, name, artists: artistsTitle, imageExists, albumArt: imageSource
  };
};
