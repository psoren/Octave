import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Spotify from 'rn-spotify-sdk';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import axios from 'axios';

import * as actions from '../actions';

const { width: screenWidth } = Dimensions.get('window');

class RoomSearchResult extends Component {
  state ={ loading: true };

  componentDidMount = async () => {
    const { playlistID, currentSongIndex } = this.props;

    const { data } = await axios({
      url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
      headers: { Authorization: `Bearer ${this.props.accessToken}` },
      params: { offset: currentSongIndex, limit: 1 }
    });

    const { track } = data.items[0];
    const { name, album } = track;
    this.setState({
      songName: name, images: album.images, loading: false
    });
  }

  joinRoom = async () => {
    const { id: userId } = await Spotify.getMe();
    if (userId === this.props.creatorID) {
      Alert.alert('You cannot join the room you created!');
    } else if (this.props.id === this.props.currentRoom.id) {
      Alert.alert('You are already in this room!');
    } else if (this.props.currentRoom.id !== '') {
      const { name: newRoom } = this.props.currentRoom;
      Alert.alert(`Do you want to leave the room ${newRoom} and join the room ${this.props.roomName}?`, '',
        [{
          text: 'OK',
          onPress: () => this.props.joinRoom(this.props.navigation,
            this.props.id),
        }, { text: 'Cancel' }]);
    } else {
      this.props.joinRoom(this.props.navigation, this.props.id);
    }
  };

  render() {
    return (
      <TouchableOpacity
        onPress={this.joinRoom}
        style={[styles.container, { width: screenWidth }]}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={this.props.colors}
          style={[styles.container, { width: 0.9 * screenWidth }]}
        >
          {!this.state.loading ? (
            <React.Fragment>
              <View style={styles.songContainer}>
                <Text style={styles.roomName}>{this.props.roomName}</Text>
                <Text style={styles.song}>{this.state.songName}</Text>
              </View>
              <Image
                source={this.state.images.length > 0
                  ? { uri: this.state.images[this.state.images.length - 1].url }
                  : require('../assets/default_album.png')}
                style={styles.image}
              />
            </React.Fragment>
          ) : null}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
}

const styles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
    justifyContent: 'space-around',
    borderRadius: 15,
    margin: 10
  },
  songContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  image: {
    width: 75,
    height: 75
  },
  roomName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20
  },
  song: {
    color: '#fff',
    fontSize: 16
  }
};

const mapStateToProps = ({ auth, currentRoom }) => ({
  accessToken: auth.accessToken,
  currentRoom
});

export default connect(mapStateToProps, actions)(withNavigation(RoomSearchResult));
