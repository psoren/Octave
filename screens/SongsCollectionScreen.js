import React, { Component } from 'react';
import {
  Text, View, Image, FlatList, Alert
} from 'react-native';
import { Button } from 'react-native-elements';
import axios from 'axios';
import { connect } from 'react-redux';
import qs from 'qs';
import * as firebase from 'firebase';
import 'firebase/firestore';

import * as actions from '../actions';
import Song from '../components/Song';
import getSongData from '../functions/getSongData';

class SongsCollectionScreen extends Component {
  state = { songs: [], images: [] };

  componentDidMount = async () => {
    const { accessToken, navigation } = this.props;
    const id = navigation.getParam('id');
    const type = navigation.getParam('type');
    this.setState({ type, id });

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

  playAll = async (shouldPrepend) => {
    const numTracks = this.state.collectionData.tracks.total;
    const { accessToken } = this.props;
    const limit = 50;
    const numRequests = Math.ceil(numTracks / limit);
    const requests = [];

    for (let i = 0; i < numRequests; i += 1) {
      const params = qs.stringify({ limit, offset: i * limit });
      requests.push(
        axios({
          url: `https://api.spotify.com/v1/${this.state.type}s/${this.state.id}/tracks?${params}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
      );
    }

    const results = await Promise.all(requests);
    let songs = [];
    // eslint-disable-next-line array-callback-return
    results.map((result) => {
      const newSongs = result.data.items.map(item => getSongData(item, { type: this.state.type }));
      songs = [...songs, ...newSongs];
    });

    const songURIs = songs.map(song => `spotify:track:${song.id}`);

    if (this.props.currentRoom.id === '') {
      if (this.props.pendingRoom.songs.length > 4000) {
        Alert.alert('You cannot add more than 4000 songs to a room');
        return;
      }

      if (shouldPrepend) {
        this.props.prependSongsToPendingQueue(songs);
      } else {
        this.props.appendSongsToPendingQueue(songs);
      }
    } else {
      // Add to firebase
      const db = firebase.firestore();
      const roomRef = db.collection('rooms').doc(this.props.currentRoom.id);
      try {
        const room = await roomRef.get();
        if (room.exists) {
          const { playlistID, currentSongIndex } = room.data();

          const songURIsSections = [];
          let curIndex = 0;
          const numSongsPerRequest = 50;

          while (curIndex < songURIs.length) {
            const songsSection = songURIs.slice(curIndex, curIndex + numSongsPerRequest);
            songURIsSections.push(songsSection);
            curIndex += numSongsPerRequest;
          }

          // we have a list of songs called songs
          // we need to get a list of lists of songs, where each sublist
          // has at most 100 songs, and then successively append them to the playlist,
          // either by appending to the end or adding at the specified index and
          // incrementing the current position in the playlist
          let insertIndex = currentSongIndex + 2;
          for (let i = 0; i < songURIsSections.length; i += 1) {
            const position = shouldPrepend ? insertIndex : null;
            // eslint-disable-next-line no-await-in-loop
            await axios({
              method: 'post',
              url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              data: { uris: songURIsSections[i], position }
            });
            insertIndex += numSongsPerRequest;
          }
        }
      } catch (err) {
        console.error(err);
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
        <View style={styles.buttonContainer}>
          <Button
            title="Play Next"
            onPress={() => this.playAll(true)}
          />
          <Button
            title="Play Later"
            onPress={() => this.playAll(false)}
          />
        </View>
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
              popularity={item.popularity}
              duration_ms={item.duration_ms}
              preview_url={item.preview_url}
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    margin: 15
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

const mapStateToProps = ({ auth, currentRoom, pendingRoom }) => ({
  accessToken: auth.accessToken,
  currentRoom,
  pendingRoom
});

export default connect(mapStateToProps, actions)(SongsCollectionScreen);
