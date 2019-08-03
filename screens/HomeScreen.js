import React, { Component } from 'react';
import {
  Text, View, Dimensions, ActivityIndicator
} from 'react-native';
import { Icon } from 'react-native-elements';
import Spotify from 'rn-spotify-sdk';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import 'firebase/firestore';
import SplashScreen from 'react-native-splash-screen';
import LinearGradient from 'react-native-linear-gradient';

import { ScrollView } from 'react-native-gesture-handler';
import * as actions from '../actions';
import RoomCard from '../components/RoomCard';
// import MinimizedRoom from '../components/MinimizedRoom';

import MinimizedRoom from '../components/MinimizedRoom';

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

  state = { rooms: [], currentRoomIndex: 0 };

  componentDidMount = async () => {
    SplashScreen.hide();
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
        creatorID: room.data().creator.id
      });
    });
    this.setState({ rooms, deviceWidth, deviceHeight });

    // Constantly listen for new rooms
    db.collection('rooms')
      .orderBy('name').limit(20)
      .onSnapshot((querySnapshot) => {
        const newRooms = [];
        querySnapshot.forEach((room) => {
          newRooms.push({
            id: room.id,
            creatorID: room.data().creator.id
          });
        });
        this.setState({ rooms: newRooms });
      });
  }

  componentWillUnmount() {
    console.log('Home Screen unmounting...');
    clearInterval(this.tokenRefreshInterval);
  }

  handleScroll = (e) => {
    this.setState({ currentRoomIndex: Math.round((e.nativeEvent.contentOffset.x) / deviceWidth) });
  }

  goToRoom = () => {
    this.props.navigation.navigate('NowPlaying');
  }

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#00c9ff" animating />
        </View>
      );
    }

    const roomCards = this.state.rooms.map((room, index) => (
      <View key={room.id} style={styles.roomCardContainer}>
        <RoomCard
          roomID={room.id}
          creatorID={room.creatorID}
          deviceWidth={this.state.deviceWidth}
          deviceHeight={this.state.deviceHeight}
          isCurrent={index === this.state.currentRoomIndex}
        />
      </View>
    ));

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
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={['#fff', '#fff']}
        style={styles.container}
      >
        <View style={styles.shadowContainer}>
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={['#00c9ff', '#92fe9d']}
            style={styles.nowPlayingContainer}
          >
            <Text style={styles.nowPlaying}>Now Playing</Text>
          </LinearGradient>
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
        {NowPlaying}
      </LinearGradient>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  roomCardContainer: {
    width: deviceWidth,
    alignItems: 'center'
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
    width: deviceWidth - 50,
    height: 75,
    backgroundColor: '#00c9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 25,
    borderRadius: 35
  },
  shadowContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  }
};

const mapStateToProps = ({ currentRoom }) => ({ currentRoom });

export default connect(mapStateToProps, actions)(HomeScreen);
