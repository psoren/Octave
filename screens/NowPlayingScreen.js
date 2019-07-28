import React, { Component } from 'react';
import {
  Text, View, TextInput, Image, ActivityIndicator, Dimensions, StyleSheet, Alert
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { connect } from 'react-redux';
import Spotify from 'rn-spotify-sdk';

import * as actions from '../actions';
import NextSongsModal from '../components/NextSongsModal';
import CurrentListenersModal from '../components/CurrentListenersModal';
import ControlsContainer from '../components/ControlsContainer';

/* When the component is minimized, it will not be unmounted, so when
we are setting up the creator initially, we can begin playback right away
When a new listener joins the room, send that info to each client that is
in that room.  When the creator of that room receives that information, get
the current position in the track from the rn-spotify-sdk, and send it to firebase.
Then the new listener can wait for that information to be uploaded, and then join the room
have the playback be somewhat close to that of the creator.
We will see how long this takes. */

// The issue is that this component never unmounts, so componentdidmount
// is not getting called again, so we are not setting up the room

const { width: screenWidth } = Dimensions.get('window');

class NowPlayingScreen extends Component {
  state = {
    changingName: false,
    localName: '',
    loading: true,
    showNextSongs: false,
    showCurrentListeners: false,
    playing: true,
    currentSongIndex: 0
  };

  componentWillUnmount() {
    console.log('Now Playing Screen unmounting...');
  }

  componentDidMount = () => {
    this.setupRoom();
  }

  componentDidUpdate = async (prevProps) => {
    if (this.props.currentRoom.id !== prevProps.currentRoom.id) {
      this.setupRoom();
    }
  }

  setupRoom = async () => {
    const db = firebase.firestore();
    const roomRef = db.collection('rooms').doc(this.props.currentRoom.id);

    db.collection('rooms').doc(this.props.currentRoom.id)
      .onSnapshot(async (room) => {
        const roomData = room.data();
        this.setState({ currentSongIndex: roomData.currentSongIndex });
        // If the creator paused it,
        // no need to re-render the whole component
        if (roomData.playing !== this.state.playing) {
          this.setState({ playing: roomData.playing });
          try {
            await Spotify.setPlaying(roomData.playing);
          } catch (err) {
            console.error('Could not toggle playback');
          }
          return;
        }
        this.props.updateRoom(roomData);
      });

    try {
      const room = await roomRef.get();
      if (room.exists) {
        const roomData = room.data();
        const roomInfo = { ...roomData, id: room.id };
        const userInfo = await Spotify.getMe();
        if (roomInfo.roomCreatorID === userInfo.id) {
          this.setupCreator(roomInfo, userInfo);
        } else {
          this.setupListener(roomInfo, userInfo);
        }
      } else {
        console.error('Could not find room.');
      }
    } catch (err) {
      console.error(err);
    }
  }


  changeSong = async (distance) => {
    const db = firebase.firestore();
    const roomRef = db.collection('rooms').doc(this.props.currentRoom.id);
    const room = await roomRef.get();
    if (room.exists) {
      const roomData = room.data();
      const numSongs = roomData.songs.length;
      const newIndex = roomData.currentSongIndex + distance;

      if (newIndex < 0) {
        try {
          await Spotify.playURI(`spotify:track:${roomData.songs[0].id}`, 0, 0);
          Alert.alert('No previous songs');
        } catch (err) {
          console.error(`Could not play ${roomData.songs[0].name}: ${err}`);
        }
      } else if (newIndex + 1 > numSongs) {
        Alert.alert('No upcoming songs');
      } else {
        roomRef.update({ currentSongIndex: firebase.firestore.FieldValue.increment(distance) });
        Spotify.playURI(`spotify:track:${roomData.songs[roomData.currentSongIndex + distance].id}`, 0, 0);
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
    const db = firebase.firestore();
    const roomRef = db.collection('rooms').doc(this.props.currentRoom.id);
    try {
      await roomRef.update({ name: this.state.localName });
    } catch (err) {
      console.error(`${err}We could not update the room name.`);
    }
  }

  setupListener = (roomInfo) => {
    this.props.updateRoom(roomInfo);
    this.setState({ loading: false, creator: false });
  };


  setupCreator = async (roomInfo) => {
    this.props.updateRoom(roomInfo);
    this.setState({ loading: false, creator: true });
    const currentSong = roomInfo.songs[0];
    await Spotify.playURI(`spotify:track:${currentSong.id}`, 0, 0);
  };


  render() {
    if (this.state.loading || (!this.props.currentRoom.name)) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#92f39d" animating />
        </View>
      );
    }

    const { name, artists } = this.props.currentRoom.songs[this.state.currentSongIndex];
    const { url } = this.props.currentRoom.songs[this.state.currentSongIndex].images[0];

    return (
      <View style={styles.container}>
        <NextSongsModal
          visible={this.state.showNextSongs}
          closeModal={() => this.setState({ showNextSongs: false })}
          songs={this.props.currentRoom.songs}
        />
        <CurrentListenersModal
          visible={this.state.showCurrentListeners}
          closeModal={() => this.setState({ showCurrentListeners: false })}
        />
        <Button
          containerStyle={styles.minimizeButton}
          onPress={() => this.props.navigation.navigate('Home')}
          type="outline"
          title="Minimize"
        />
        <Button
          containerStyle={styles.leaveButton}
          onPress={() => this.props.leaveRoom(this.props.navigation,
            this.props.currentRoom.id)}
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

const mapStateToProps = ({ currentRoom }) => ({ currentRoom });

export default connect(mapStateToProps, actions)(NowPlayingScreen);
