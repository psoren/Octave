import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  Image,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Alert,
  Animated,
  PanResponder,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { connect } from 'react-redux';
import Spotify from 'rn-spotify-sdk';
import axios from 'axios';
import { showMessage } from 'react-native-flash-message';
import LinearGradient from 'react-native-linear-gradient';

import spotifyCredentials from '../secrets';
import ProgressBar from '../components/ProgressBar';
import * as actions from '../actions';
import QueueModal from '../components/QueueModal';
import CurrentListenersModal from '../components/CurrentListenersModal';

const {
  width: screenWidth,
  height: screenHeight
} = Dimensions.get('window');

const SWIPE_THRESHOLD = 0.2 * screenHeight;
const VELOCITY_THRESHOLD = 3.5;

class NowPlayingScreen extends Component {
  constructor(props) {
    super(props);

    const position = new Animated.ValueXY();
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_e, gesture) => {
        position.setValue({ x: 0, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dy > SWIPE_THRESHOLD || gesture.vy > VELOCITY_THRESHOLD) {
          this.forceSwipe();
        } else {
          this.resetPosition(event, gesture);
        }
      }
    });

    this.panResponder = panResponder;
    this.position = position;

    this.state = {
      changingName: false,
      localName: '',
      loading: true,
      showQueue: false,
      showCurrentListeners: false,
      creator: {},
      currentSongIndex: 0,
      progress: 0,
      listeners: [],
      userID: '',
      name: '',
      artists: '',
      images: [],
      colors: []
    };
  }

  componentWillUnmount() {
    clearInterval(this.creatorUpdateInterval);
    this.changeSongSubscription.remove();
    Spotify.removeListener('trackChange', this.updateCurrentSongIndex);
  }

  resetPosition = () => Animated.spring(this.position,
    { toValue: { x: 0, y: 0 } }).start();

  forceSwipe = () => {
    Animated.timing(this.position, {
      toValue: { x: 0, y: screenHeight }
    }).start(() => this.minimizeRoom());
  }

  minimizeRoom = () => {
    this.props.navigation.navigate('Home');
    this.resetPosition();
  }

  componentDidMount = () => this.setupRoom();

  componentDidUpdate = async (prevProps) => {
    if (this.props.currentRoom.id !== prevProps.currentRoom.id) {
      this.setupRoom();
    }
  }

  leaveRoom = () => {
    this.unsubscribe();
    clearInterval(this.creatorUpdateInterval);
    Spotify.removeListener('trackChange', this.updateCurrentSongIndex);
    this.props.leaveRoom(this.props.navigation, this.props.currentRoom.id);
  }

  // Given a playlist id and a currentSongIndex, return the song info
  // and update the progress
  getCurrentSongInfo = async (playlistID, currentSongIndex) => {
    const { accessToken } = this.props;
    const { data } = await axios({
      url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { offset: currentSongIndex, limit: 1 }
    });
    const { track } = data.items[0];
    const {
      artists: artistsArr, name, duration_ms: duration, album
    } = track;
    const artists = artistsArr[0].name;
    const { images } = album;

    this.setState({
      artists, name, images, duration
    });
  }

  setupRoom = async () => {
    if (this.props.currentRoom.id !== '') {
      const { id: userID } = await Spotify.getMe();
      this.setState({ userID });
      const db = firebase.firestore();
      const roomRef = db.collection('rooms').doc(this.props.currentRoom.id);

      try {
        const room = await roomRef.get();
        if (room.exists) {
          const roomData = room.data();
          const roomInfo = { ...roomData, id: room.id };
          const userInfo = await Spotify.getMe();
          const { playlistID, currentSongIndex, currentPosition } = room.data();

          this.getCurrentSongInfo(playlistID, currentSongIndex);
          this.setState({ currentSongIndex });
          this.props.updateRoom(roomInfo);

          if (playlistID && currentSongIndex !== null && currentPosition !== null) {
            await Spotify.playURI(`spotify:playlist:${playlistID}`,
              currentSongIndex, currentPosition);
          }

          if (roomInfo.creator.id === userInfo.id) {
            Spotify.addListener('trackChange', e => this.updateCurrentSongIndex(e));
            this.setState({ loading: false, isCreator: true, updateInterval: 1500 }, () => {
              this.creatorUpdateInterval = setInterval(this.updateCreatorPosition,
                this.state.updateInterval);
            });
          } else {
            this.setState({ loading: false, isCreator: false });
          }
        } else {
          Alert.alert('Could not find the room', '',
            [{ text: 'OK', onPress: () => this.leaveRoom }]);
        }
      } catch (err) {
        Alert.alert('Could not find the room', '',
          [{ text: 'OK', onPress: () => this.leaveRoom }]);
      }

      this.unsubscribe = db.collection('rooms').doc(this.props.currentRoom.id)
        .onSnapshot(async (room) => {
          const {
            currentPosition,
            currentSongIndex,
            listeners,
            creator,
            playlistID,
            colors
          } = room.data();

          if (this.state.duration && currentPosition) {
            const durationSeconds = Math.max(1, this.state.duration / 1000);
            const progress = currentPosition / durationSeconds;
            this.setState({ progress });
          }

          // We have become the creator
          if (creator.id === this.state.userID) {
            this.setState({ isCreator: true });
          } else if (this.state.isCreator
            && this.state.creator.id !== userID) {
            // We have given creator status to someone else
            this.setState({ isCreator: false });
          }

          // The song has changed, update the UI
          if (currentSongIndex !== this.state.currentSongIndex) {
            this.setState({ currentSongIndex }, () => {
              this.getCurrentSongInfo(playlistID, currentSongIndex);
            });
          }

          this.setState({
            currentSongIndex,
            listeners,
            creator,
            colors
          });
          this.props.updateRoom(room.data());
        });
    }
  }

  updateCurrentSongIndex = async (e) => {
    if (e.metadata.currentTrack.indexInContext > 0) {
      const db = firebase.firestore();
      const roomRef = db.collection('rooms').doc(this.props.currentRoom.id);
      roomRef.update({ currentSongIndex: firebase.firestore.FieldValue.increment(1) });

      const { playlistID } = this.props.currentRoom;

      if (playlistID) {
        const currentSongRef = db.collection('currentSong').doc(playlistID);
        const currentSong = await currentSongRef.get();
        if (currentSong.exists) {
          await currentSongRef.update({
            currentSongIndex: firebase.firestore.FieldValue.increment(1)
          });
        }
      }
    }
  }

  updateRoomName = async () => {
    this.setState({ changingName: false });
    if (this.state.localName !== '') {
      const db = firebase.firestore();
      const roomRef = db.collection('rooms').doc(this.props.currentRoom.id);
      try {
        await roomRef.update({ name: this.state.localName });
      } catch (err) {
        console.error(`${err}. Could not update the room name.`);
      }
    }
  }

  updateCreatorPosition = async () => {
    // 1. Get current position from playback
    const { position: currentPosition } = await Spotify.getPlaybackStateAsync();
    // 2. Get database reference
    const db = firebase.firestore();
    const roomRef = db.collection('rooms').doc(this.props.currentRoom.id);

    // 3. Update room in database
    try {
      const room = await roomRef.get();
      if (room.exists) {
        await roomRef.update({ currentPosition });
      } else {
        Alert.alert('Could not find the room', '',
          [{ text: 'OK', onPress: () => this.leaveRoom }]);
      }
    } catch (err) {
      console.error(`Could not get room data: ${err}`);
    }
  }

  saveSong = async () => {
    const { playlistID, currentSongIndex } = this.props.currentRoom;
    const { accessToken } = this.props;

    const { data } = await axios({
      url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { offset: currentSongIndex, limit: 1 }
    });
    const { id, name } = data.items[0].track;
    try {
      await axios({
        method: 'PUT',
        url: 'https://api.spotify.com/v1/me/tracks',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: { ids: [id] }
      });
      showMessage({
        message: `Saved ${name} to your library`,
        type: 'info',
        backgroundColor: '#00c9ff',
        color: '#fff'
      });
    } catch (err) {
      Alert.alert(`Could not save ${name} to your library`);
    }
  }

  clearQueue = async () => {
    Alert.alert('Clear next 25 songs?', '',
      [{
        text: 'OK',
        onPress: async () => {
          const db = firebase.firestore();
          const roomRef = db.collection('rooms').doc(this.props.currentRoom.id);
          try {
            const room = await roomRef.get();
            if (room.exists) {
              const { playlistID, currentSongIndex } = room.data();

              // const { data: playlistData } = await axios({
              //   url: `https://api.spotify.com/v1/playlists/${playlistID}`,
              //   headers: { Authorization: `Bearer ${this.props.accessToken}` },
              // });

              // const { snapshot_id } = playlistData;

              const NUM_SONGS_TO_REMOVE = 25;

              const { data: songData } = await axios({
                url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
                headers: { Authorization: `Bearer ${this.props.accessToken}` },
                params: { offset: currentSongIndex + 3, limit: NUM_SONGS_TO_REMOVE }
              });

              // If there are songs(s) we can delete without stopping playback
              // Remove all the songs starting from currentSongIndex+3
              if (songData.items.length > 0) {
                const tracks = [];
                songData.items.forEach((item, index) => {
                  tracks.push({
                    uri: item.track.uri,
                    positions: [currentSongIndex + index + 3]
                  });
                });

                const res = await axios({
                  method: 'delete',
                  url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
                  headers: {
                    Authorization: `Bearer ${this.props.accessToken}`,
                    'Content-Type': 'application/json'
                  },
                  data: {
                    tracks
                  }
                });
                if (res.status === 200) {
                  showMessage({
                    message: `Removed the next ${NUM_SONGS_TO_REMOVE} songs from the queue`,
                    type: 'info',
                    backgroundColor: '#00c9ff',
                    color: '#fff'
                  });
                }
              }
            } else {
              Alert.alert('We could not find your room.');
            }
          } catch (err) {
            Alert.alert(`Could not clear queue: ${err}`);
          }
        }
      },
      { text: 'Cancel', style: 'cancel' }
      ]);
  }

  savePlaylist = () => Alert.alert(
    `Create the playlist ${this.props.currentRoom.name} from the songs in this room?`,
    '', [{
      text: 'Ok',
      onPress: async () => {
        const { accessToken } = this.props;
        const { playlistID: secretPlaylistID, name } = this.props.currentRoom;
        const { id } = await Spotify.getMe();
        const description = 'Created by Octave!';

        try {
          // Create Playlist
          const { data } = await axios({
            method: 'POST',
            url: `https://api.spotify.com/v1/users/${id}/playlists`,
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            data: { name, description }
          });
          const { id: newPlaylistID } = data;

          // 1. Create an array of promises where we
          // add the songs in the song list to the
          // user's library
          // Get total number of songs in the current secret playlist
          const { playlistRefreshURL } = spotifyCredentials;
          const { data: refreshData } = await axios({
            url: playlistRefreshURL,
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          });
          const { access_token: playlistAccessToken } = refreshData;

          const { data: secretPlaylistData } = await axios({
            url: `https://api.spotify.com/v1/playlists/${secretPlaylistID}`,
            headers: { Authorization: `Bearer ${playlistAccessToken}` }
          });

          const totalCurrentTracks = secretPlaylistData.tracks.total;

          // Get all of the tracks and add them to the songs array
          const songs = [];
          let offset = 0;

          while (offset < totalCurrentTracks) {
            // eslint-disable-next-line no-await-in-loop
            const { data: songsData } = await axios({
              url: `https://api.spotify.com/v1/playlists/${secretPlaylistID}/tracks`,
              headers: { Authorization: `Bearer ${playlistAccessToken}` },
              params: { offset }
            });
            songsData.items.forEach((song) => {
              songs.push(song);
            });
            offset += 100;
          }

          const songURIs = songs.map(song => `spotify:track:${song.track.id}`);
          // Split them so we can add every 50 in the correct order
          const splitSongURIs = [];
          for (let i = 0; i < songURIs.length; i += 50) {
            splitSongURIs.push(songURIs.slice(i, i + 50));
          }

          const songsToAdd = splitSongURIs.map(uris => ({
            method: 'POST',
            url: `https://api.spotify.com/v1/playlists/${newPlaylistID}/tracks`,
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            data: { uris }
          }));

          // 2. Add them to the library
          songsToAdd.reduce((promiseChain, currentTask) => promiseChain
            .then(async chainResults =>
              // eslint-disable-next-line implicit-arrow-linebreak
              axios(currentTask).then(currentResult =>
                // eslint-disable-next-line implicit-arrow-linebreak
                [...chainResults, currentResult])),
          // eslint-disable-next-line no-unused-vars
          Promise.resolve([])).then((arrayOfResults) => {
            showMessage({
              message: `Saved the playlist ${name} with
          ${songURIs.length} songs to your library`,
              type: 'info',
              backgroundColor: '#00c9ff',
              color: '#fff',
              duration: 8000
            });
          });
        } catch (err) {
          Alert.alert(`Could not create playlist: ${err}`);
        }
      }
    },
    { text: 'Cancel', style: 'cancel' }], { cancelable: false },
  );

  getCardStyle = () => {
    const { position } = this;
    return { ...position.getLayout() };
  }

  render() {
    if (this.state.loading
      || (!this.props.currentRoom.name)
      || this.props.currentRoom.id === '') {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#00c9ff" animating />
        </View>
      );
    }

    const { name, artists, images } = this.state;

    return (
      <Animated.View
        style={[styles.container, this.getCardStyle()]}
        {...this.panResponder.panHandlers}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={this.state.colors}
          style={styles.container}
        >
          <QueueModal
            accessToken={this.props.accessToken}
            visible={this.state.showQueue}
            closeModal={() => this.setState({ showQueue: false })}
            savePlaylist={this.savePlaylist}
            playlistID={this.props.currentRoom.playlistID}
            currentSongIndex={this.state.currentSongIndex}
            clearQueue={this.clearQueue}
            isCreator={this.state.isCreator}
            colors={this.props.currentRoom.colors}
          />
          <CurrentListenersModal
            visible={this.state.showCurrentListeners}
            creator={this.state.creator}
            closeModal={() => this.setState({ showCurrentListeners: false })}
            listeners={this.state.listeners}
          />
          <View style={styles.header}>
            <Button
              containerStyle={styles.minimizeButton}
              onPress={() => this.props.navigation.navigate('Home')}
              type="clear"
              icon={(
                <Icon
                  type="material"
                  size={45}
                  color="#fff"
                  name="expand-more"
                />
              )}
            />
            <Button
              containerStyle={styles.leaveButton}
              onPress={() => Alert.alert('Leave this room?', '',
                [{ text: 'Cancel', style: 'cancel' },
                  { text: 'OK', onPress: this.leaveRoom }
                ])}
              type="clear"
              icon={(
                <Icon
                  type="material"
                  size={45}
                  name="close"
                  color="#fff"
                />
              )}
            />
            <TextInput
              onChangeText={localName => (localName.length < 15
                ? this.setState({ changingName: true, localName }) : null)}
              value={this.state.changingName
                ? this.state.localName
                : this.props.currentRoom.name}
              onEndEditing={this.updateRoomName}
              style={styles.roomName}
            />
          </View>
          <Image
            source={images.length > 0 ? { url: images[0].url }
              : require('../assets/default_album.png')}
            style={styles.image}
          />
          <View style={{ marginTop: 15 }}>
            <ProgressBar
              startColor="#fff"
              endColor="#fff"
              progress={this.state.progress}
              width={screenWidth - 40}
              height={10}
              duration={this.state.updateInterval}
            />
          </View>
          <View style={styles.likeButtonContainer}>
            <View style={styles.songInfoContainer}>
              <Text style={styles.song}>{name}</Text>
              <Text style={styles.artists}>{artists}</Text>
            </View>
            <Button
              onPress={this.saveSong}
              type="clear"
              icon={(
                <Icon
                  type="material"
                  size={45}
                  color="#fff"
                  name="favorite-border"
                />
              )}
            />
          </View>
          <View
            style={{
              marginTop: 50,
              borderBottomColor: '#fff',
              borderBottomWidth: 2,
              width: screenWidth - 50
            }}
          />
          <View style={styles.bottomButtons}>
            <Button
              onPress={() => this.props.navigation.navigate('AddSongsRoom')}
              type="clear"
              icon={(
                <Icon
                  type="material"
                  color="#fff"
                  size={45}
                  name="playlist-add"
                />
              )}
            />
            <Button
              onPress={() => this.setState({ showQueue: true })}
              type="clear"
              icon={(
                <Icon
                  type="material"
                  color="#fff"
                  size={45}
                  name="queue-music"
                />
              )}
            />
            <Button
              onPress={() => this.setState({ showCurrentListeners: true })}
              type="clear"
              icon={(
                <Icon
                  type="material"
                  color="#fff"
                  size={45}
                  name="people"
                />
              )}
            />
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  minimizeButton: {
    position: 'absolute',
    left: 15,
    top: 15,
    zIndex: 10
  },
  leaveButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 10
  },
  roomName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff'
  },
  songInfoContainer: {
    alignItems: 'center',
    margin: 5
  },
  image: {
    width: screenWidth - 40,
    height: screenWidth - 40
  },
  song: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold'
  },
  artists: {
    color: '#fff',
    fontSize: 20
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
    width: screenWidth
  },
  header: {
    width: screenWidth,
    height: 75,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  likeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  }
});

const mapStateToProps = ({ currentRoom, auth }) => ({
  currentRoom, accessToken: auth.accessToken
});

export default connect(mapStateToProps, actions)(NowPlayingScreen);
