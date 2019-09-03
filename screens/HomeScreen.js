import React, { Component } from 'react';
import {
  Text, View, Dimensions, ScrollView, Alert
} from 'react-native';
import { Icon } from 'react-native-elements';
import Spotify from 'rn-spotify-sdk';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import 'firebase/firestore';
import SplashScreen from 'react-native-splash-screen';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from 'react-native-geolocation-service';
import * as geofirex from 'geofirex';
import setupRealtimeDatabase from '../functions/setupRealtimeDatabase';

import * as actions from '../actions';
import RoomCard from '../components/RoomCard';
import RoomCardLoading from '../components/RoomCardLoading';
import MinimizedRoom from '../components/MinimizedRoom';

const {
  width: deviceWidth,
  height: deviceHeight
} = Dimensions.get('window');

const NUM_HOME_SCREEN_ROOMS = 25;
const REFRESH_TOKEN_INTERVAL = 1000 * 60 * 30;

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
    setupRealtimeDatabase();
    const {
      id, display_name, email, images
    } = await Spotify.getMe();
    this.props.setUserInfo({
      id, display_name, email, images
    });
    const sessionInfo = await Spotify.getSessionAsync();
    this.props.storeTokens(sessionInfo);
    SplashScreen.hide();

    // Set token refresh interval
    this.tokenRefreshInterval = setInterval(async () => {
      await Spotify.renewSession();
      const info = await Spotify.getSessionAsync();
      this.props.refreshTokens(info);
    }, REFRESH_TOKEN_INTERVAL);

    Geolocation.getCurrentPosition(
      (position) => {
        this.props.setLocation(position);
        this.getLocalRooms(position);
      },
      (error) => {
        this.props.setLocation(false);
        console.log(error);
        // Alert.alert(`Location Error: ${error.code}`, error.message);
        Alert.alert(`Please enable location permissions in 
        Settings > Privacy > Location Services > Octave to join a room`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    this.setState({ deviceWidth, deviceHeight });
  }

  componentWillUnmount = () => clearInterval(this.tokenRefreshInterval);

  handleScroll = e => this.setState({
    currentRoomIndex: Math.round((
      e.nativeEvent.contentOffset.x) / deviceWidth)
  });

  getLocalRooms = async () => {
    // Get user's location
    const geo = geofirex.init(firebase);
    const { latitude, longitude } = this.props.deviceInfo.location.coords;

    // in KM
    const center = geo.point(latitude, longitude);
    let radius = 1;
    const field = 'position';
    const rooms = geo.collection('rooms');
    let query;
    try {
      query = rooms.within(center, radius, field);
    } catch (err) {
      console.log(`3e432${err}`);
    }
    let localRooms = await geofirex.get(query);
    console.log(localRooms);
    // try again with 100 KM
    while (localRooms.length < 10 && radius < 30000) {
      radius *= 10;
      try {
        query = rooms.within(center, radius, field);
        // eslint-disable-next-line no-await-in-loop
        localRooms = await geofirex.get(query);
      } catch (err) {
        console.log(`fd;lkjl: ${err}`);
      }
    }
    this.setState({ rooms: localRooms });

    // We now have a radius at which there are at least 10 rooms
    // or if there are not 10 rooms total in the database,
    // we have all of them.
    // Subscribe to the realtime stream at that radius
    this.setState({ loading: false });

    try {
      const localRoomsRef = geo.collection('rooms', ref => ref.limit(NUM_HOME_SCREEN_ROOMS));
      query = localRoomsRef.within(center, radius, field);

      query.subscribe((data) => {
        const newRooms = [];
        data.forEach((room) => {
          newRooms.push({
            id: room.id,
            creatorID: room.creator.id
          });
        });
        this.setState({ rooms: newRooms, loading: false });
      });
    } catch (err) {
      console.log(`asdf: ${err}`);
    }
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
      NowPlaying = (
        <MinimizedRoom goToRoom={() => this.props.navigation.navigate('NowPlaying')} />
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
          {!this.state.loading && roomCards.length === 0 ? (
            <View style={styles.roomCardContainer}>
              <Text style={styles.noRooms}>
                Create a room to get started!
              </Text>
            </View>
          ) : roomCards}
        </ScrollView>
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

const mapStateToProps = ({
  auth, currentRoom, deviceInfo, userInfo
}) => ({
  currentRoom,
  deviceInfo,
  userInfo,
  auth
});

export default connect(mapStateToProps, actions)(HomeScreen);
