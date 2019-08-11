import React, { Component } from 'react';
import {
  Text, View, Dimensions, ScrollView
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import Spotify from 'rn-spotify-sdk';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import 'firebase/firestore';
import SplashScreen from 'react-native-splash-screen';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from 'react-native-geolocation-service';
import * as geofirex from 'geofirex';

import * as actions from '../actions';
import RoomCard from '../components/RoomCard';
import RoomCardLoading from '../components/RoomCardLoading';
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

  state = { rooms: [], currentRoomIndex: 0, loading: true };

  componentDidMount = async () => {
    SplashScreen.hide();

    // Set token refresh interval
    this.tokenRefreshInterval = setInterval(async () => {
      await Spotify.renewSession();
      const sessionInfo = await Spotify.getSessionAsync();
      this.props.refreshTokens(sessionInfo);
    }, 1000 * 60 * 30);


    // Get all of the room IDs
    const db = firebase.firestore();

    // Get user's location
    // eslint-disable-next-line no-unused-vars
    const geo = geofirex.init(firebase);
    // const cities = geo.collection('cities');
    // const point = geo.point(40, -119);
    // cities.add({ name: 'Phoenix', position: point.data });

    Geolocation.getCurrentPosition(
      position => this.props.setLocation(position),
      (error) => {
        this.props.setLocation(false);
        console.log(`Location Error: ${error.code}`, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    const roomsSnapshot = await db.collection('rooms').get();
    const rooms = [];
    roomsSnapshot.forEach((room) => {
      rooms.push({
        id: room.id,
        creatorID: room.data().creator.id
      });
    });


    this.setState({
      rooms, deviceWidth, deviceHeight, loading: false
    });

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

  getLocalRooms = () => {
    const { latitude, longitude } = this.props.deviceInfo.location.coords;

    const geo = geofirex.init(firebase);

    const center = geo.point(latitude, longitude);

    // in KM
    const radius = 20000;
    const field = 'position';

    const rooms = geo.collection('rooms');
    const query = rooms.within(center, radius, field);
    query.subscribe(console.log);
  }

  render() {
    let roomCards = (
      <View style={styles.roomCardContainer}>
        <RoomCardLoading />
      </View>
    );

    if (!this.state.loading) {
      roomCards = this.state.rooms.map((room, index) => (
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
    }

    let NowPlaying = null;
    if (this.props.currentRoom.id !== '') {
      const { songs, currentSongIndex, name: roomName } = this.props.currentRoom;
      NowPlaying = (
        <MinimizedRoom
          songs={songs}
          currentSongIndex={currentSongIndex}
          roomName={roomName}
          goToRoom={() => this.props.navigation.navigate('NowPlaying')}
        />
      );
    }

    return (
      <View style={styles.container}>
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
        <Button
          title="Get Rooms Near Me"
          onPress={this.getLocalRooms}
        />
        {NowPlaying}
      </View>
    );
  }
}

const styles = {
  container: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  roomCardContainer: {
    width: deviceWidth,
    alignItems: 'center',
    alignSelf: 'center'
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
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#fff',
    marginTop: 25,
    borderRadius: 35
  }
};

const mapStateToProps = ({ currentRoom, deviceInfo }) => ({
  currentRoom,
  deviceInfo
});

export default connect(mapStateToProps, actions)(HomeScreen);
