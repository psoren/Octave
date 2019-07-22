import React, { Component } from 'react';
import {
  Text, View, Image, FlatList
} from 'react-native';
import axios from 'axios';
import { connect } from 'react-redux';

import Song from '../components/Song';
import getSongData from '../functions/getSongData';
import getAlbumSongData from '../functions/getAlbumSongData';

class SongsCollectionScreen extends Component {
  state = { imageExists: false, songs: [] };

  componentDidMount = async () => {
    const { accessToken, navigation } = this.props;
    const id = navigation.getParam('id');
    const type = navigation.getParam('type');

    // Get info
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    const { data } = await axios.get(`https://api.spotify.com/v1/${type}s/${id}`, config);

    let imageExists = false;
    let imageSource = '';

    if (data.images && data.images[0] && data.images[0].url) {
      imageExists = true;
      imageSource = data.images[0].url;
      this.setState({
        imageExists: true,
        imageSource: data.images[0].url
      });
    }

    const { next } = data.tracks;
    this.setState({ name: data.name, next });

    // Get songs
    const { data: songsData } = await axios.get(`https://api.spotify.com/v1/${type}s/${id}/tracks`, config);
    if (type === 'album') {
      const songs = songsData.items.map(song => getAlbumSongData(song, imageExists, imageSource));
      this.setState({ songs });
    } else if (type === 'playlist') {
      const songs = songsData.items.map(song => getSongData(song));
      this.setState({ songs, config });
    }
  }


  onEndReached = async () => {
    const { data } = await axios.get(this.state.next, this.state.config);
    const newSongs = data.items.map(item => getSongData(item));
    const currentSongs = this.state.songs;
    this.setState({ songs: [...currentSongs, ...newSongs], next: data.next });
  }


  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{this.state.name}</Text>
        <Image
          source={this.state.imageExists
            ? { uri: this.state.imageSource }
            : require('../assets/default_album.png')}
          style={styles.albumArt}
        />
        <FlatList
          data={this.state.songs}
          keyExtractor={item => item.id}
          onEndReachedThreshold={0.5}
          onEndReached={this.onEndReached}
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
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#fff'
  },
  albumArt: {
    height: 200,
    width: 200,
    alignSelf: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center'
  }
};

const mapStateToProps = ({ auth }) => ({ accessToken: auth.accessToken });

export default connect(mapStateToProps, null)(SongsCollectionScreen);
