import React, { Component } from 'react';
import {
  Text, View, ActivityIndicator
} from 'react-native';
import { Button } from 'react-native-elements';
import PropTypes from 'prop-types';
import * as firebase from 'firebase';
import 'firebase/firestore';
import Spotify from 'rn-spotify-sdk';
import { connect } from 'react-redux';
import ProgressBar from 'react-native-progress/Bar';

import RoomCardImageContainer from './RoomCardImageContainer';

class RoomCard extends Component {
  state = { loading: true, deviceWidth: 0 };

  componentDidMount = async () => {
    const db = firebase.firestore();
    const roomRef = this.props.test ? db.collection('testRooms').doc(this.props.roomID)
      : db.collection('rooms').doc(this.props.roomID);

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
        progress
      });

      if (this.props.isCurrent && this.props.currentRoom.id === '') {
        const progressInSeconds = (currentSong.duration_ms / 1000) * room.data().currentPosition;
        await Spotify.playURI(`spotify:track:${currentSong.id}`, 0, progressInSeconds);
      }
      this.progressInterval = setInterval(this.updateProgress, 1000);
    }
  }

  componentWillUnmount = () => {
    clearInterval(this.progressInterval);
  }

  updateProgress= () => {
    // Add one second to the progress
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

  joinRoom = () => {
    console.log('Joining room...');
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
      <View style={[styles.container, {
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
          <Text style={styles.song}>{this.state.song}</Text>
          <Text style={styles.artists}>{this.state.artists}</Text>
        </View>

        <ProgressBar
          animated
          progress={this.state.progress}
          width={this.state.deviceWidth * 0.6}
          color="#fff"
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

RoomCard.propTypes = {
  roomID: PropTypes.string.isRequired,
  test: PropTypes.bool.isRequired
};

const mapStateToProps = ({ currentRoom }) => ({ currentRoom });

export default connect(mapStateToProps, null)(RoomCard);
