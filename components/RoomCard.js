import React, { Component } from 'react';
import {
  Text, View, ActivityIndicator, Alert
} from 'react-native';
import { Button } from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/firestore';
import Spotify from 'rn-spotify-sdk';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import LinearGradient from 'react-native-linear-gradient';
import ProgressBar from './ProgressBar';
import * as actions from '../actions';

import RoomCardImageContainer from './RoomCardImageContainer';

class RoomCard extends Component {
  state = { loading: true };

  componentWillUnmount = () => this.unsubscribe();

  componentDidMount = async () => {
    // Check for initial playback
    const db = firebase.firestore();
    const roomRef = db.collection('rooms').doc(this.props.roomID);
    const roomInfo = await roomRef.get();
    if (roomInfo.exists
      && this.props.isCurrent
      && this.props.currentRoom.id === ''
    ) {
      const { songs, currentPosition } = roomInfo.data();
      const currentSong = songs[roomInfo.data().currentSongIndex];
      await Spotify.playURI(`spotify:track:${currentSong.id}`, 0, currentPosition);
    }
    this.setupRoom();
  }

  setupRoom = async () => {
    const { deviceHeight, deviceWidth } = this.props;
    const db = firebase.firestore();

    this.unsubscribe = db.collection('rooms').doc(this.props.roomID)
      .onSnapshot((doc) => {
        const {
          name, currentPosition, currentSongIndex, listeners, songs, colors
        } = doc.data();

        const currentSong = songs[currentSongIndex];
        const songLength = songs[currentSongIndex].duration_ms / 1000;
        const progress = currentPosition / songLength;

        this.setState({
          id: this.props.roomID,
          loading: false,
          name,
          numListeners: listeners.length + 1,
          numSongs: songs.length,
          currentSong,
          progress,
          deviceHeight,
          deviceWidth,
          colors
        });
      });
  }

  componentDidUpdate = async (prevProps) => {
    // Check to see if we need to start playback
    if (prevProps.isCurrent !== this.props.isCurrent
      && this.props.isCurrent
      && this.props.currentRoom.id === ''
    ) {
      const db = firebase.firestore();
      const roomRef = db.collection('rooms').doc(this.props.roomID);
      const roomInfo = await roomRef.get();
      const { songs, currentPosition } = roomInfo.data();
      const currentSong = songs[roomInfo.data().currentSongIndex];
      await Spotify.playURI(`spotify:track:${currentSong.id}`, 0, currentPosition);
    }
  }

  joinRoom = async () => {
    const { id: userId } = await Spotify.getMe();
    // if (userId === this.props.creatorID) {
    if (userId === 'asdfa') {
      Alert.alert('You cannot join the room you created!');
    } else if (this.props.currentRoom.id !== '') {
      // If they are in a room already, prompt the user
      // to see if they want to leave their current room
      const { name: newRoom } = this.props.currentRoom;
      Alert.alert(`Do you want to leave the room ${newRoom} and join the room ${this.state.name}?`, '',
        [{
          text: 'OK',
          onPress: () => this.props.joinRoom(this.props.navigation,
            this.state.id),
          style: 'cancel'
        },
        { text: 'Cancel' }
        ],
        { cancelable: false });
    } else {
      // They are not in a room, join it
      this.props.joinRoom(this.props.navigation, this.state.id);
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" animating />
        </View>
      );
    }
    return (
      <View style={styles.shadowContainer}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={this.state.colors}
          style={[styles.container, {
            width: 0.75 * this.state.deviceWidth,
            height: 0.5 * this.state.deviceHeight
          }]}
        >
          <Text style={styles.roomName}>{this.state.name}</Text>
          <RoomCardImageContainer
            currentSong={this.state.currentSong}
            numListeners={this.state.numListeners}
            numSongs={this.state.numSongs}
          />
          <View style={styles.songInfoContainer}>
            <Text style={styles.song}>{this.state.currentSong.name}</Text>
            <Text style={styles.artists}>{this.state.currentSong.artists}</Text>
          </View>
          <ProgressBar
            startColor="#fff"
            endColor="#fff"
            progress={this.state.progress}
            duration={1500}
            width={this.state.deviceWidth * 0.6}
            height={5}
          />
          <Button
            title="Join Room"
            onPress={this.joinRoom}
            type="outline"
            raised
            containerStyle={styles.buttonContainer}
          />
        </LinearGradient>
      </View>

    );
  }
}

const styles = {
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 15
  },
  shadowContainer: {
    shadowColor: '#000',
    backgroundColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
    borderRadius: 15
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  roomName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    margin: 5
  },
  songInfoContainer: {
    padding: 10,
    flexDirection: 'column',
    alignItems: 'center'
  },
  song: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff'
  },
  artists: {
    fontSize: 12,
    color: '#fff'
  },
  buttonContainer: {
    margin: 5
  }
};

const mapStateToProps = ({ currentRoom }) => ({ currentRoom });

export default connect(mapStateToProps, actions)(withNavigation(RoomCard));
