import React, { Component } from 'react';
import { Text, View, FlatList } from 'react-native';
import axios from 'axios';
import qs from 'qs';
import { connect } from 'react-redux';

import Song from '../components/Song';
import getSongData from '../functions/getSongData';

class LibrarySongsScreen extends Component {
  state = { songs: [], limit: 50 };

  componentDidMount = async () => {
    const { accessToken } = this.props;
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    this.setState({ config });
    const params = qs.stringify({ limit: this.state.limit });
    const { data } = await axios.get(`https://api.spotify.com/v1/me/tracks?${params}`, config);
    const songs = data.items.map(item => getSongData(item.track));
    this.setState({ songs, next: data.next });
  }

  onEndReached = async () => {
    const { data } = await axios.get(this.state.next, this.state.config);
    const newSongs = data.items.map(({ track }) => {
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
      name = name.length > 32 ? `${name.slice(0, 32)}...` : name;

      artists = artists.length > 20 ? `${artists.slice(0, 20)}...` : artists;
      return {
        id, name, artists: artistsTitle, imageExists, albumArt
      };
    });
    const currentSongs = this.state.songs;
    this.setState({ songs: [...currentSongs, ...newSongs], next: data.next });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your Songs</Text>
        <FlatList
          data={this.state.songs}
          keyExtractor={item => item.id}
          onEndReachedThreshold={0.5}
          onEndReached={this.onEndReached}
          extraData={this.state}
          renderItem={({ item }) => (
            <Song
              id={item.id}
              name={item.name}
              artists={item.artists}
              imageExists={item.imageExists}
              albumArt={item.albumArt}
            />
          )}
        />
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  title: {
    alignSelf: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    margin: 15
  }
};

const mapStateToProps = ({ auth }) => ({ accessToken: auth.accessToken });

export default connect(mapStateToProps, null)(LibrarySongsScreen);
