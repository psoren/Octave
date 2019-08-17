import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import axios from 'axios';
import { connect } from 'react-redux';

const { width } = Dimensions.get('window');

class MinimizedRoom extends Component {
  state = { loading: true };

  getSong = async (playlistID, currentSongIndex) => {
    const { accessToken } = this.props;
    const { data } = await axios({
      url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { offset: currentSongIndex, limit: 1 }
    });

    const { track } = data.items[0];
    const { name, album } = track;
    this.setState({ name, images: album.images, loading: false });
  }

  componentDidMount = async () => {
    if (this.props.playlistID) {
      this.getSong(this.props.playlistID, this.props.currentSongIndex);
    }
  }

  componentDidUpdate = async () => {
    if (this.props.playlistID && this.state.loading) {
      this.getSong(this.props.playlistID, this.props.currentSongIndex);
    }
  }

  render() {
    if (this.state.loading) {
      return null;
    }

    return (
      <TouchableOpacity
        onPress={this.props.goToRoom}
        style={[styles.container, { width }]}
      >
        <View style={styles.songContainer}>
          <Text style={styles.roomName}>{this.props.roomName}</Text>
          <Text style={styles.song}>{this.state.name}</Text>
        </View>
        <Image
          source={this.state.images.length > 0
            ? { uri: this.state.images[this.state.images.length - 1].url }
            : require('../assets/default_album.png')}
          style={styles.image}
        />
      </TouchableOpacity>
    );
  }
}

const styles = {
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    height: 50,
    justifyContent: 'space-around',
    borderWidth: 0.5,
    borderColor: '#444',
    borderRightWidth: 0,
    borderLeftWidth: 0
  },
  songContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  image: {
    width: 40,
    height: 40
  },
  roomName: {
    color: '#444',
    fontWeight: 'bold',
    fontSize: 20
  },
  song: {
    color: '#444',
    fontSize: 16
  }
};

const mapStateToProps = ({ auth, currentRoom }) => ({
  accessToken: auth.accessToken,
  currentRoom
});

export default connect(mapStateToProps, null)(MinimizedRoom);
