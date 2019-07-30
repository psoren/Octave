import React, { Component } from 'react';
import { Text, View, Dimensions } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import Spotify from 'rn-spotify-sdk';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import 'firebase/firestore';

import { ScrollView } from 'react-native-gesture-handler';
import * as actions from '../actions';
import RoomCard from '../components/RoomCard';

const {
  width: deviceWidth,
  height: deviceHeight
} = Dimensions.get('window');

class HomeScreen extends Component {
  static navigationOptions = () => ({
    title: 'Home',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        type="material"
        name="home"
        size={30}
        color={tintColor}
      />
    )
  });

  state = { rooms: [], currentRoom: 0 };

  componentDidMount = async () => {
    this.tokenRefreshInterval = setInterval(async () => {
      await Spotify.renewSession();
      const sessionInfo = await Spotify.getSessionAsync();
      this.props.refreshTokens(sessionInfo);
    }, 1000 * 60 * 30);

    // Get all of the room IDs
    const db = firebase.firestore();
    const roomsSnapshot = await db.collection('rooms').get();
    const rooms = [];
    roomsSnapshot.forEach((room) => {
      rooms.push({
        id: room.id,
        roomCreatorID: room.data().roomCreatorID
      });
    });
    this.setState({ rooms, deviceWidth, deviceHeight });
  }

  componentWillUnmount() {
    console.log('Home Screen unmounting...');
    clearInterval(this.tokenRefreshInterval);
  }

  logout = async () => {
    await Spotify.logout();
    this.props.navigation.navigate('Login');
  }

  renewSession = async () => {
    await Spotify.renewSession();
    const sessionInfo = await Spotify.getSessionAsync();
    this.props.refreshTokens(sessionInfo);
  }

  handleScroll = (e) => {
    this.setState({ currentRoom: Math.round((e.nativeEvent.contentOffset.x) / deviceWidth) });
  }

  render() {
    const roomCards = this.state.rooms.map((room, index) => (
      <View key={room.id} style={styles.roomCardContainer}>
        <RoomCard
          roomID={room.id}
          roomCreatorID={room.roomCreatorID}
          deviceWidth={this.state.deviceWidth}
          deviceHeight={this.state.deviceHeight}
          isCurrent={index === this.state.currentRoom}
        />
      </View>
    ));

    return (
      <View style={styles.container}>
        <View style={styles.nowPlayingContainer}>
          <Text style={styles.nowPlaying}>Now Playing</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onMomentumScrollEnd={this.handleScroll}
        >
          {roomCards.length === 0 ? (
            <View style={styles.roomCardContainer}>
              <Text style={styles.noRooms}>
                Create a room to get started!
              </Text>
            </View>
          ) : roomCards}
        </ScrollView>
        <Button
          style={styles.button}
          title="Logout"
          onPress={this.logout}
        />
        <Button
          style={styles.button}
          title="Renew Session"
          onPress={this.renewSession}
        />
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  roomCardContainer: {
    width: deviceWidth,
    alignItems: 'center'
  },
  button: {
    margin: 15
  },
  noRooms: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00c9ff'
  },
  nowPlaying: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  nowPlayingContainer: {
    width: deviceWidth,
    height: 100,
    backgroundColor: '#00c9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50
  }
};

export default connect(null, actions)(HomeScreen);
