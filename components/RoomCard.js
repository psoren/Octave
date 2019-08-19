import React, { Component } from 'react';
import {
  Text, View, ActivityIndicator, Alert, TouchableOpacity
} from 'react-native';
import { Icon } from 'react-native-elements';
import * as firebase from 'firebase';
import 'firebase/firestore';
import Spotify from 'rn-spotify-sdk';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import LinearGradient from 'react-native-linear-gradient';
import { getDistance } from 'geolib';
import axios from 'axios';
import { BlurView } from '@react-native-community/blur';


import * as actions from '../actions';
import ProgressBar from './ProgressBar';
import RoomCardImageContainer from './RoomCardImageContainer';

class RoomCard extends Component {
  state = { loading: true };

  componentWillUnmount = () => this.unsubscribe();

  componentDidMount = async () => {
    // The error is somewhere in here


    // Check for initial playback
    const db = firebase.firestore();
    const roomRef = db.collection('rooms').doc(this.props.roomID);
    const roomInfo = await roomRef.get();
    if (roomInfo.exists
      && this.props.isCurrent
      && this.props.currentRoom.id === ''
    ) {
      const { accessToken } = this.props;
      const {
        currentPosition,
        currentSongIndex,
        playlistID,
        listeners
      } = roomInfo.data();

      try {
        const { data: playlistData } = await axios({
          url: `https://api.spotify.com/v1/playlists/${playlistID}`,
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const numSongs = playlistData.tracks.total;
        this.setState({ numSongs, numListeners: listeners.length + 1 });
        await Spotify.playURI(`spotify:playlist:${playlistID}`, currentSongIndex, currentPosition);
      } catch (err) {
        console.log(err);
      }
    }
    this.setupRoom();
  }

  setupRoom = async () => {
    const { deviceHeight, deviceWidth } = this.props;
    const db = firebase.firestore();

    this.unsubscribe = db.collection('rooms').doc(this.props.roomID)
      .onSnapshot(async (doc) => {
        const {
          name,
          currentPosition,
          currentSongIndex,
          listeners,
          colors,
          address,
          playlistID
        } = doc.data();

        const { accessToken } = this.props;

        const { data: songData } = await axios({
          url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { offset: currentSongIndex, limit: 1 }
        });

        const currentSong = songData.items[0].track;
        const { name: songName, artists } = currentSong;
        const artist = artists[0].name;
        this.setState({ songName, artist, name });

        const songLength = currentSong.duration_ms / 1000;
        const progress = currentPosition / songLength;

        // Get distance between these two lat, long pairs
        const userLocation = this.props.location;
        if (userLocation) {
          const roomLocation = doc.data().position;
          const {
            latitude: userLatitude,
            longitude: userLongitude
          } = userLocation.coords;

          const {
            latitude: roomLatitude,
            longitude: roomLongitude
          } = roomLocation.geopoint;

          const distanceInMeters = getDistance(
            { latitude: userLatitude, longitude: userLongitude },
            { latitude: roomLatitude, longitude: roomLongitude }
          );

          const distanceInMiles = ((distanceInMeters / 1000) * 1.60934).toFixed(2);
          this.setState({ distanceInMiles, locationPermission: true });
        } else {
          // No location permission
          this.setState({ locationPermission: false });
        }
        this.setState({
          id: this.props.roomID,
          loading: false,
          songName,
          artist,
          numListeners: listeners.length + 1,
          currentSong,
          progress,
          deviceHeight,
          deviceWidth,
          colors,
          address
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
      const { playlistID, currentSongIndex, currentPosition } = roomInfo.data();
      await Spotify.playURI(`spotify:playlist:${playlistID}`, currentSongIndex, currentPosition);
    }
  }

  joinRoom = async () => {
    const { id: userId } = await Spotify.getMe();
    if (userId === this.props.creatorID) {
      Alert.alert('You cannot join the room you created!');
    } else if (this.props.roomID === this.props.currentRoom.id) {
      Alert.alert('You are already in this room!');
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
            height: 0.6 * this.state.deviceHeight
          }]}
        >
          <Text style={styles.roomName}>{this.state.name}</Text>
          <RoomCardImageContainer
            currentSong={this.state.currentSong}
            numListeners={this.state.numListeners}
            numSongs={this.state.numSongs}
          />
          <View style={styles.songInfoContainer}>
            <Text style={styles.song}>{this.state.songName}</Text>
            <Text style={styles.artists}>{this.state.artist}</Text>
          </View>
          <ProgressBar
            startColor="#fff"
            endColor="#fff"
            progress={this.state.progress}
            duration={1500}
            width={this.state.deviceWidth * 0.6}
            height={5}
          />
          <View style={styles.locationOuterContainer}>
            <Text style={styles.locationTown}>
              {this.state.address}
            </Text>
            <View style={styles.locationInnerContainer}>
              {this.state.locationPermission
                ? (
                  <Text style={styles.locationDistance}>
                    {this.state.distanceInMiles}
                    {' '}
                    miles away
                  </Text>
                ) : null
              }
              <Icon
                type="material"
                size={30}
                color="#fff"
                name="location-on"
              />
            </View>
          </View>
          <TouchableOpacity onPress={this.joinRoom}>
            <BlurView blurType="light" style={styles.joinButton}>
              <Text style={styles.joinRoomText}>Join Room</Text>
            </BlurView>
          </TouchableOpacity>
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
  },
  locationOuterContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  locationInnerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around'

  },
  locationTown: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff'
  },
  locationDistance: {
    fontSize: 14,
    color: '#fff'
  },
  joinButton: {
    width: 100,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    padding: 5
  },
  joinRoomText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff'
  }
};

const mapStateToProps = ({ currentRoom, deviceInfo, auth }) => ({
  accessToken: auth.accessToken,
  currentRoom,
  location: deviceInfo.location
});

export default connect(mapStateToProps, actions)(withNavigation(RoomCard));
