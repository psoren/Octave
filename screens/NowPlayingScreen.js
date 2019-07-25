import React, { Component } from 'react';
import { View } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { connect } from 'react-redux';
import Spotify from 'rn-spotify-sdk';
import * as actions from '../actions';

// How to set this up: when we first load the nowplaying screen,
// we want to get the id of the room and the creator uri from the database.
// if that is the same as ours, we are the creator, and we can play, pause, skip
// we also need to be able to get the current playback state and position of the creator

// When a new listener joins the room, send that info to each client that is
// in that room.  When the creator of that room receives that information, get
// the current position in the track from the rn-spotify-sdk, and send it to firebase.
// Then the new listener can wait for that information to be uploaded, and then join the room
// have the playback be somewhat close to that of the creator.
// We will see how long this takes.

class NowPlayingScreen extends Component {
  state= {};

  addSongs = () => {
    this.props.navigation.navigate('AddSongsRoom');
  }

  nextSongs = () => {
    console.log('view queue');
  }

  currentListeners = () => {
    console.log('currentListeners');
  }

  setupCreator = (roomInfo) => {
    this.setState({ creator: true });
    console.log(roomInfo);
  };

  setupListener = (roomInfo) => {
    this.setState({ creator: false });
  };


  // 3. Set the visual state of the application and start playback
  // 4. Create the listeners screen
  // 5. Create the up next songs screen
  // 6. When the creator presses next, previous, or pause,
  //    emit that event to the database and setup a listener
  //    for database changes.  We can then listen for those changes
  //    (such as new song, change of song order, and new listeners),
  //    and change the UI accordingly.

  componentDidMount = async () => {
    // 1. Get the room info from the database
    // and check if we are the creator
    const db = firebase.firestore();

    // get currentRoom (the id) from the redux state
    const testRoomId = 'k91JxdJMITi5fYx2iAKZ';

    const roomRef = db.collection('rooms').doc(testRoomId);

    try {
      const room = await roomRef.get();
      if (room.exists) {
        const roomInfo = room.data();
        const userInfo = await Spotify.getMe();
        if (roomInfo.roomCreatorID === userInfo.id) {
          this.setupCreator(roomInfo);
        } else {
          this.setupListener(roomInfo);
        }
      } else {
        console.error('Could not find room.');
      }
    } catch (err) {
      console.error(err);
    }
  }

  closeNowPlaying = () => {
    console.log('close now playing screen');
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          containerStyle={styles.closeButton}
          onPress={this.closeNowPlaying}
          type="clear"
          icon={(
            <Icon
              type="material"
              name="close"
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  closeButton: {
    position: 'absolute',
    left: 25,
    top: 25
  }
};

const mapStateToProps = ({ newRoom }) => ({ currentRoom: newRoom.currentRoom });

export default connect(mapStateToProps, actions)(NowPlayingScreen);
