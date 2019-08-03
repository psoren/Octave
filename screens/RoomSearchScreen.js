import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';

import MinimizedRoom from '../components/MinimizedRoom';

class RoomSearchScreen extends Component {
  static navigationOptions = () => ({
    title: 'Discover',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        type="material"
        name="search"
        size={30}
        color={tintColor}
      />
    ),
  });

  render() {
    let NowPlaying = null;
    if (this.props.currentRoom.id !== '') {
      const { songs, currentSongIndex, name: roomName } = this.props.currentRoom;
      NowPlaying = (
        <MinimizedRoom
          songs={songs}
          currentSongIndex={currentSongIndex}
          roomName={roomName}
          goToRoom={this.goToRoom}
        />
      );
    }

    return (
      <View style={styles.container}>
        <Text>RoomSearchScreen</Text>
        <Text>RoomSearchScreen</Text>
        <Text>RoomSearchScreen</Text>
        <Text>RoomSearchScreen</Text>
        <Text>RoomSearchScreen</Text>
        <Text>RoomSearchScreen</Text>

        <View style={styles.nowPlaying}>
          {NowPlaying}
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50
  },
  nowPlaying: {
    position: 'absolute',
    bottom: 0,
    left: 0
  }
};

const mapStateToProps = ({ currentRoom }) => ({ currentRoom });

export default connect(mapStateToProps, null)(RoomSearchScreen);
