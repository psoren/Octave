import React, { Component } from 'react';
import {
  Text, View, TextInput, Image, ActivityIndicator, Dimensions, StyleSheet, Alert
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { connect } from 'react-redux';
import Spotify from 'rn-spotify-sdk';
import axios from 'axios';
import qs from 'qs';
import _ from 'lodash';
import ProgressBar from 'react-native-progress/Bar';

import * as actions from '../actions';
import NextSongsModal from '../components/NextSongsModal';
import CurrentListenersModal from '../components/CurrentListenersModal';
import ControlsContainer from '../components/ControlsContainer';
import getSongData from '../functions/getSongData';

const { width: screenWidth } = Dimensions.get('window');

class NowPlayingScreen extends Component {
  state = {
    changingName: false,
    localName: '',
    loading: true,
    showNextSongs: false,
    showCurrentListeners: false,
    playing: true,
    currentSongIndex: 0,
    progress: 0
  };

  componentWillUnmount() {
    console.log('Now Playing Screen unmounting...');
    clearInterval(this.creatorUpdateInterval);
    this.changeSongSubscription.remove();
  }

  componentDidMount = () => {
    this.setupRoom();
  }

  componentDidUpdate = async (prevProps) => {
    if (this.props.currentRoom.id !== prevProps.currentRoom.id) {
      this.setupRoom();
    }
  }

  leaveRoom = () => {
    this.unsubscribe();
    clearInterval(this.creatorUpdateInterval);
    Spotify.removeListener('audioDeliveryDone', this.changeSongOne);
    this.props.leaveRoom(this.props.navigation, this.props.currentRoom.id);
  }

  changeSongOne = () => this.changeSong(1);

  setupRoom = async () => {
    if (this.props.currentRoom.id !== '') {
      Spotify.addListener('audioDeliveryDone', this.changeSongOne);
      const db = firebase.firestore();
      const roomRef = db.collection('rooms').doc(this.props.currentRoom.id);
      this.unsubscribe = db.collection('rooms').doc(this.props.currentRoom.id)
        .onSnapshot(async (room) => {
          const {
            currentPosition, currentSongIndex, listeners, songs
          } = room.data();

          // Detect song changes
          if (this.state.currentSongIndex !== currentSongIndex) {
            await Spotify.playURI(`spotify:track:${room.data().songs[room.data().currentSongIndex].id}`, 0, 0);
          }

          const songLength = songs[currentSongIndex].duration_ms / 1000;
          const progress = currentPosition / songLength;
          this.setState({ currentSongIndex, listeners, progress });
          if (room.data().playing !== this.state.playing) {
            this.setState({ playing: room.data().playing });
            try {
              await Spotify.setPlaying(room.data().playing);
            } catch (err) {
              console.error('Could not toggle playback');
            }
            return;
          }

          this.props.updateRoom(room.data());
        });

      try {
        const room = await roomRef.get();
        if (room.exists) {
          const roomData = room.data();
          const roomInfo = { ...roomData, id: room.id };
          const userInfo = await Spotify.getMe();
          if (roomInfo.roomCreatorID === userInfo.id) {
            this.setupCreator(roomInfo);
          } else {
            this.setupListener(roomInfo);
          }
        } else {
          console.error(' 105 Could not find room.');
        }
      } catch (err) {
        console.error(err);
        console.error('Could not get room data.');
      }
    }
  }

  // eslint-disable-next-line consistent-return
  recommendSong = async (room) => {
    // // Get recommendation from Spotify
    const { accessToken } = this.props;
    const seedTracks = _.map(room.data().songs.slice(
      -Math.min(room.data().songs.length, 5)
    ), song => song.id);
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    const query = qs.stringify({
      limit: 1,
      market: 'US',
      min_popularity: '50',
      seed_tracks: seedTracks.join()
    });

    try {
      const { data } = await axios.get(`https://api.spotify.com/v1/recommendations?${query}`, config);
      if (data.tracks.length > 0) {
        return getSongData(data.tracks[0], null);
      }
      console.error('Could not get recommendations');
      return {};
    } catch (err) {
      console.error(err);
    }
  }

  changeSong = async (distance) => {
    const db = firebase.firestore();
    const roomRef = db.collection('rooms').doc(this.props.currentRoom.id);
    const room = await roomRef.get();
    if (room.exists) {
      const roomData = await room.data();
      const numSongs = roomData.songs.length;
      const newIndex = roomData.currentSongIndex + distance;

      if (newIndex < 0) {
        try {
          Alert.alert('No previous songs');
        } catch (err) {
          console.error(`Could not play ${roomData.songs[0].name}: ${err}`);
        }
      } else if (newIndex + 1 > numSongs) {
        Alert.alert('There were no upcoming songs. Up next is a recommendation from Spotify');
        const newSong = await this.recommendSong(room);
        let { songs } = room.data();
        songs.push(newSong);
        songs = _.uniqBy(songs, 'id');
        await roomRef.update({ songs });
        await roomRef.update({
          currentSongIndex: firebase.firestore.FieldValue.increment(distance)
        });
        const newRoom = await roomRef.get();
        await Spotify.playURI(`spotify:track:${newRoom.data().songs[newRoom.data().currentSongIndex].id}`, 0, 0);
      } else {
        await roomRef.update({
          currentSongIndex: firebase.firestore.FieldValue.increment(distance)
        });
        await Spotify.playURI(`spotify:track:${roomData.songs[roomData.currentSongIndex + distance].id}`, 0, 0);
      }
    } else {
      console.error('Room does not exist');
    }
  }

  togglePlay = async () => {
    try {
      const db = firebase.firestore();
      const roomRef = db.collection('rooms').doc(this.props.currentRoom.id);
      const room = await roomRef.get();
      if (room.exists) {
        const { playing: currentPlayState } = room.data();
        roomRef.update({ playing: !currentPlayState });
      } else {
        console.error('Room does not exist');
      }
    } catch (err) {
      console.error(err);
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
        console.error(`${err}We could not update the room name.`);
      }
    }
  }

  setupListener = async (roomInfo) => {
    this.props.updateRoom(roomInfo);
    this.setState({ loading: false, creator: false });

    // Start playing the same song as the creator
    const { currentSongIndex, songs, currentPosition } = roomInfo;
    const currentSong = songs[currentSongIndex];
    await Spotify.playURI(`spotify:track:${currentSong.id}`, 0, currentPosition);
  };

  setupCreator = async (roomInfo) => {
    this.props.updateRoom(roomInfo);
    this.setState({ loading: false, creator: true });
    const currentSong = roomInfo.songs[0];
    await Spotify.playURI(`spotify:track:${currentSong.id}`, 0, 0);

    this.creatorUpdateInterval = setInterval(this.updateCreatorPosition, 2000);
  };

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
        console.error(' (NowPlaying 235) Could not find room.');
      }
    } catch (err) {
      console.error(`Could not get room data: ${err}`);
    }
  }

  render() {
    if (this.state.loading
      || (!this.props.currentRoom.name)
      || this.props.currentRoom.id === '') {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#92f39d" animating />
        </View>
      );
    }

    const { name, artists } = this.props.currentRoom.songs[this.state.currentSongIndex];
    const { url } = this.props.currentRoom.songs[this.state.currentSongIndex].images[0];
    const nextSongs = this.props.currentRoom.songs.slice(this.state.currentSongIndex);

    return (
      <View style={styles.container}>
        <NextSongsModal
          visible={this.state.showNextSongs}
          closeModal={() => this.setState({ showNextSongs: false })}
          songs={nextSongs}
        />
        <CurrentListenersModal
          visible={this.state.showCurrentListeners}
          closeModal={() => this.setState({ showCurrentListeners: false })}
          listeners={this.state.listeners}
        />
        <Button
          containerStyle={styles.minimizeButton}
          onPress={() => this.props.navigation.navigate('Home')}
          type="outline"
          title="Minimize"
        />
        <Button
          containerStyle={styles.leaveButton}
          onPress={this.leaveRoom}
          type="outline"
          title="Leave"
        />
        <TextInput
          onChangeText={localName => this.setState({ changingName: true, localName })}
          value={this.state.changingName
            ? this.state.localName
            : this.props.currentRoom.name}
          onEndEditing={this.updateRoomName}
          style={styles.roomName}
        />
        <Image
          source={this.props.currentRoom.songs.length > 0 ? { url }
            : require('../assets/default_album.png')}
          style={styles.image}
        />
        <ProgressBar
          animated
          progress={this.state.progress}
          width={screenWidth}
          color="#00c9ff"
          animationType="timing"
          borderRadius={0}
          borderWidth={0}
        />
        <View style={styles.songInfoContainer}>
          <Text style={styles.song}>{name}</Text>
          <Text style={styles.artists}>{artists}</Text>
        </View>
        {this.state.creator ? (
          <ControlsContainer
            playing={this.state.playing}
            togglePlay={this.togglePlay}
            changeSong={this.changeSong}
          />
        ) : null}
        <View
          style={{
            borderBottomColor: 'black',
            borderBottomWidth: 1,
            width: screenWidth - 50
          }}
        />
        <View style={styles.bottomButtons}>
          <Button
            onPress={() => this.props.navigation.navigate('AddSongsRoom')}
            type="clear"
            icon={(<Icon type="material" size={45} name="playlist-add" />)}
          />
          <Button
            onPress={() => this.setState({ showNextSongs: true })}
            type="clear"
            icon={(<Icon type="material" size={45} name="queue-music" />)}
          />
          <Button
            onPress={() => this.setState({ showCurrentListeners: true })}
            type="clear"
            icon={(<Icon type="material" size={45} name="people" />)}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    marginTop: 50
  },
  minimizeButton: {
    position: 'absolute',
    left: 25,
    top: 25,
    zIndex: 10
  },
  leaveButton: {
    position: 'absolute',
    right: 25,
    top: 25,
    zIndex: 10
  },
  roomName: {
    margin: 50,
    fontSize: 24,
    fontWeight: 'bold',
  },
  songInfoContainer: {
    alignItems: 'center',
    margin: 15
  },
  image: {
    width: screenWidth,
    height: screenWidth
  },
  song: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  artists: {
    fontSize: 20
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
    width: screenWidth
  }
});

const mapStateToProps = ({ currentRoom, auth }) => ({
  currentRoom, accessToken: auth.accessToken
});

export default connect(mapStateToProps, actions)(NowPlayingScreen);
