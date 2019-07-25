import React, { Component } from 'react';
import {
  Text, View, Image, FlatList
} from 'react-native';
import axios from 'axios';
import { connect } from 'react-redux';

import Song from '../components/Song';
import getSongData from '../functions/getSongData';

class SongsCollectionScreen extends Component {
  state = { songs: [], images: [] };

  componentDidMount = async () => {
    const { accessToken, navigation } = this.props;
    const id = navigation.getParam('id');
    const type = navigation.getParam('type');
    this.setState({ type });

    // Get info
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    const { data: collectionData } = await axios.get(`https://api.spotify.com/v1/${type}s/${id}`, config);

    if (collectionData.images && collectionData.images.length > 0) {
      this.setState({ images: collectionData.images });
    }
    this.setState({ name: collectionData.name, collectionData });

    // Get songs
    const { data: songsData } = await axios.get(`https://api.spotify.com/v1/${type}s/${id}/tracks`, config);
    // If there are no more songs in the collection
    if (!Object.prototype.hasOwnProperty.call(songsData, 'next')) {
      this.setState({ next: null });
    } else {
      this.setState({ next: songsData.next });
    }

    const songs = songsData.items.map(song => getSongData(song, collectionData));
    this.setState({ songs, config });
  }

  onEndReached = async () => {
    if (this.state.next) {
      const { data } = await axios.get(this.state.next, this.state.config);
      if (this.state.type === 'playlist') {
        const newSongs = data.items.map(item => getSongData(item, this.state.collectionData));
        const currentSongs = this.state.songs;
        this.setState({ songs: [...currentSongs, ...newSongs] });
        // If there are no more songs to get
        if (!Object.prototype.hasOwnProperty.call(data, 'next')) {
          this.setState({ next: null });
        } else {
          this.setState({ next: data.next });
        }
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{this.state.name}</Text>
        <Image
          source={this.state.images.length > 0
            ? { uri: this.state.images[0].url }
            : require('../assets/default_album.png')}
          style={styles.albumArt}
        />
        <FlatList
          data={this.state.songs}
          keyExtractor={item => (this.state.type === 'playlist' ? item.key : item.id)}
          onEndReachedThreshold={0.35}
          onEndReached={this.onEndReached}
          renderItem={({ item }) => (
            <Song
              id={item.id}
              name={item.name}
              artists={item.artists}
              images={item.images}
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
