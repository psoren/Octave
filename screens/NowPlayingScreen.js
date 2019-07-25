import React, { Component } from 'react';
import {
  Text, View, Image, ActivityIndicator, Dimensions
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { connect } from 'react-redux';
import Spotify from 'rn-spotify-sdk';

import * as actions from '../actions';
import NextSongsModal from '../components/NextSongsModal';
import CurrentListenersModal from '../components/CurrentListenersModal';

// When the component is minimized, it will not be unmounted, so when
// we are setting up the creator initially, we can begin playback right away

// When a new listener joins the room, send that info to each client that is
// in that room.  When the creator of that room receives that information, get
// the current position in the track from the rn-spotify-sdk, and send it to firebase.
// Then the new listener can wait for that information to be uploaded, and then join the room
// have the playback be somewhat close to that of the creator.
// We will see how long this takes.

const { width: screenWidth } = Dimensions.get('window');

class NowPlayingScreen extends Component {
  state = {
    roomName: '',
    loading: true,
    showNextSongs: false,
    showCurrentListeners: false,
    songs: []
  };

  setupCreator = async (roomInfo, userInfo) => {
    console.log(roomInfo);
    console.log(userInfo);

    const { roomName, songs } = roomInfo;
    const currentSong = roomInfo.songs[0];
    const song = roomInfo.songs[0].name;
    const { artists } = roomInfo.songs[0];

    this.setState({
      currentSong,
      song,
      artists,
      roomName,
      loading: false,
      creator: true,
      songs
    });

    await Spotify.playURI(`spotify:track:${currentSong.id}`, 0, 0);
  };

  // setupListener = (roomInfo, userInfo) => {
  //   this.setState({ creator: false });
  // };


  // 3. Set the visual state of the application and start playback
  // 4. Create the listeners screen
  // 5. Create the up next songs screen
  // 6. When the creator presses next, previous, or pause,
  //    emit that event to the database and setup a listener
  //    for database changes.  We can then listen for those changes
  //    (such as new song, change of song order, and new listeners),
  //    and change the UI accordingly.

  componentDidMount = async () => {
    // 1. Get the room info firestore, check if creator
    const db = firebase.firestore();

    // 2. Get currentRoom (the id) from the redux state
    const testRoomId = this.props.currentRoom;

    const roomRef = db.collection('rooms').doc(testRoomId);

    try {
      const room = await roomRef.get();
      if (room.exists) {
        const roomInfo = room.data();
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

  closeNowPlaying = () => {
    this.props.navigation.navigate('Home');
  }

  previous = () => {
    console.log('previous');
  }

  togglePlay = () => {
    console.log('togglePlay');
  }

  next = () => {
    console.log('next');
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#92f39d" animating />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <NextSongsModal
          visible={this.state.showNextSongs}
          closeModal={() => this.setState({ showNextSongs: false })}
          songs={this.state.songs}
        />
        <CurrentListenersModal
          visible={this.state.showCurrentListeners}
          closeModal={() => this.setState({ showCurrentListeners: false })}
        />
        <Button
          containerStyle={styles.closeButton}
          onPress={this.closeNowPlaying}
          type="clear"
          icon={(<Icon type="material" name="cancel" size={45} />)}
        />
        <Text style={styles.roomName}>{this.state.roomName}</Text>
        <Image
          source={this.state.currentSong.images.length > 0
            ? { uri: this.state.currentSong.images[0].url }
            : require('../assets/default_album.png')}
          style={styles.image}
        />
        <View style={styles.songInfoContainer}>
          <Text style={styles.song}>{this.state.song}</Text>
          <Text style={styles.artists}>{this.state.artists}</Text>
        </View>
        { this.state.creator ? (
          <View style={styles.controlsContainer}>
            <Button
              onPress={this.previous}
              type="clear"
              icon={(<Icon type="material" size={60} name="skip-previous" />)}
            />
            <Button
              onPress={this.togglePlay}
              type="clear"
              icon={(<Icon type="material" size={60} name="play-arrow" />)}
            />
            <Button
              onPress={this.next}
              type="clear"
              icon={(<Icon type="material" size={60} name="skip-next" />)}
            />
          </View>
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

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  closeButton: {
    position: 'absolute',
    left: 25,
    top: 25,
    zIndex: 10
  },
  roomName: {
    fontSize: 24,
    fontWeight: 'bold'
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
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
    width: screenWidth
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
    width: screenWidth
  }
};

const mapStateToProps = ({ newRoom }) => ({ currentRoom: newRoom.currentRoom });

export default connect(mapStateToProps, actions)(NowPlayingScreen);
