import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import qs from 'qs';

import Song from '../components/Song';

class LibrarySongsScreen extends Component {
  state = { songs: [], limit: 50 };

  getSongData = (item) => {
    const { track } = item;

    let imageExists = false;

    let albumArt = '../assets/default_album.png';
    if (track.album
      && track.album.images
      && track.album.images[2]
      && track.album.images[2].url) {
      imageExists = true;
      albumArt = track.album.images[2].url;
    }
    let artists = '';
    track.artists.forEach((_, index) => {
      artists += track.artists[index].name;
      if (index !== track.artists.length - 1) {
        artists += ', ';
      }
    });

    let { name } = track;
    const { id } = track;
    name = name.length > 20 ? `${name.slice(0, 20)}...` : name;
    artists = artists.length > 20 ? `${artists.slice(0, 20)}...` : artists;

    return {
      id, name, artists, imageExists, albumArt
    };
  }

  componentDidMount = async () => {
    const token = await AsyncStorage.getItem('accessToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    this.setState({ token, config });
    const params = qs.stringify({ limit: this.state.limit });
    const { data } = await axios.get(`https://api.spotify.com/v1/me/tracks?${params}`, this.state.config);
    const songs = data.items.map(item => this.getSongData(item));
    this.setState({ songs, next: data.next });
  }

  onEndReached = async () => {
    const { data } = await axios.get(this.state.next, this.state.config);
    const newSongs = data.items.map(item => this.getSongData(item));
    const currentSongs = this.state.songs;
    this.setState({ songs: [...currentSongs, ...newSongs], next: data.next });
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          onPress={() => console.log('close current songs')}
          style={styles.button}
          type="clear"
          icon={(
            <Icon
              type="material"
              name="close"
              size={30}
              color="#555"
            />
          )}
        />
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
              token={this.state.token}
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
  button: {
    marginTop: 25,
    alignSelf: 'flex-start'
  }
};

export default LibrarySongsScreen;
