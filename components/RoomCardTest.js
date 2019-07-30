import React, { Component } from 'react';
import {
  Text, View, ActivityIndicator, Alert
} from 'react-native';
import { Button } from 'react-native-elements';
import PropTypes from 'prop-types';
import * as firebase from 'firebase';
import 'firebase/firestore';
import Spotify from 'rn-spotify-sdk';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import ProgressBar from 'react-native-progress/Bar';
import * as actions from '../actions';

import RoomCardImageContainer from './RoomCardImageContainer';

class RoomCardTest extends Component {
  state = { loading: true, deviceWidth: 0 };

  componentDidMount = async () => {
    const db = firebase.firestore();
    const roomRef = db.collection('testRooms').doc(this.props.roomID);

    try {
      const room = await roomRef.get();
      if (room.exists) {
        const currentSong = room.data().songs[room.data().currentSongIndex];
        const { name } = room.data();
        const { name: song, artists } = currentSong;
        const numListeners = (room.data().listeners.length) + 1;
        const progress = room.data().currentPosition;

        const numSongs = room.data().songs.length;
        this.setState({
          name,
          currentSong,
          song,
          artists,
          loading: false,
          numListeners,
          numSongs,
          deviceWidth: this.props.deviceWidth,
          deviceHeight: this.props.deviceHeight,
          progress,
          id: room.id
        });

        if (this.props.isCurrent && this.props.currentRoom.id === '') {
          const progressInSeconds = (currentSong.duration_ms / 1000) * room.data().currentPosition;

          console.log('current room!');
          console.log(progressInSeconds);
          await Spotify.playURI(`spotify:track:${currentSong.id}`, 0, progressInSeconds);
        }
        this.progressInterval = setInterval(this.updateProgress, 1000);
      }
    } catch (err) {
      console.error(`(RoomCard.js) Could not find room${err}`);
    }
  }

  componentWillUnmount = () => clearInterval(this.progressInterval);

  // Add one second to the progress
  updateProgress= () => {
    this.setState(prevState => ({
      progress: ((prevState.progress * (prevState.currentSong.duration_ms / 1000)) + 1)
        / (prevState.currentSong.duration_ms / 1000)
    }));
  }

  componentDidUpdate = async (prevProps) => {
    if (prevProps.isCurrent !== this.props.isCurrent
      && this.props.isCurrent
      && this.props.currentRoom.id === ''
    ) {
      // Get length of song and use room.data().currentPosition
      // to get the current song position in seconds
      const progressInSeconds = (this.state.currentSong.duration_ms / 1000) * this.state.progress;
      await Spotify.playURI(`spotify:track:${this.state.currentSong.id}`, 0, progressInSeconds);
    }
  }

  joinRoom = () => Alert.alert('You cannot join a test room');

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" animating />
        </View>
      );
    }

    return (
      <View style={[styles.container, {
        width: 0.75 * this.state.deviceWidth,
        height: 0.5 * this.state.deviceHeight
      }]}
      >
        <Text style={styles.roomName}>{this.state.name}</Text>
        <Text style={{ color: '#fff' }}>Test Room</Text>
        <RoomCardImageContainer
          currentSong={this.state.currentSong}
          numListeners={this.state.numListeners}
          numSongs={this.state.numSongs}
        />
        <View style={styles.songInfoContainer}>
          <Text style={styles.song}>{this.state.song}</Text>
          <Text style={styles.artists}>{this.state.artists}</Text>
        </View>

        <ProgressBar
          animated
          progress={this.state.progress}
          width={this.state.deviceWidth * 0.6}
          color="#fff"
          animationType="timing"
        />

        <Text style={styles.location} />
        <Button
          title="Join Room"
          onPress={this.joinRoom}
          type="outline"
          raised
          containerStyle={styles.buttonContainer}
        />
      </View>
    );
  }
}

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    borderRadius: 15,
    backgroundColor: '#00c9ff',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  roomName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    margin: 20
  },

  songInfoContainer: {
    padding: 10,
    flexDirection: 'column',
    alignItems: 'center'
  },
  song: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  artists: {
    fontSize: 16,
    color: '#fff'
  },
  location: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  buttonContainer: {
    margin: 20
  }
};

RoomCardTest.propTypes = {
  roomID: PropTypes.string.isRequired,
};

const mapStateToProps = ({ currentRoom }) => ({ currentRoom });

export default connect(mapStateToProps, actions)(withNavigation(RoomCardTest));
