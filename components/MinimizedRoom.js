import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

class MinimizedRoom extends Component {
  render() {
    if (this.props.songs.length === 0) {
      return (<Text>Current Room</Text>);
    }

    const { songs, currentSongIndex } = this.props;
    const { name, images } = songs[currentSongIndex];

    return (
      <TouchableOpacity
        onPress={this.props.goToRoom}
        style={[styles.container, { width }]}
      >
        <View style={styles.songContainer}>
          <Text style={styles.roomName}>{this.props.roomName}</Text>
          <Text style={styles.song}>{name}</Text>
        </View>
        <Image
          source={images.length > 0
            ? { uri: images[images.length - 1].url }
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

export default MinimizedRoom;
