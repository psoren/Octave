import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Icon } from 'react-native-elements';
import {
  createBottomTabNavigator,
  createAppContainer,
  createStackNavigator,
} from 'react-navigation';
import firebase from 'firebase';

import store from './store';
import CreateRoomScreen from './screens/CreateRoomScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RoomSearchScreen from './screens/RoomSearchScreen';
import SettingsScreen from './screens/SettingsScreen';
import AddSongsScreen from './screens/AddSongsScreen';
import ArtistScreen from './screens/ArtistScreen';
import LibrarySongsScreen from './screens/LibrarySongsScreen';
import SongsCollectionScreen from './screens/SongsCollectionScreen';
import NowPlayingScreen from './screens/NowPlayingScreen';

const Navigator = createBottomTabNavigator({
  Login: LoginScreen,
  Main: createBottomTabNavigator({
    Home: HomeScreen,
    RoomSearch: RoomSearchScreen,
    CreateRoomMain: {
      screen: createStackNavigator({
        CreateRoom: CreateRoomScreen,
        AddSongs: AddSongsScreen,
        CreateRoomSearchArtist: ArtistScreen,
        CreateRoomSearchAlbum: SongsCollectionScreen,
        CreateRoomSearchPlaylist: SongsCollectionScreen,
        CreateRoomLibraryPlaylist: SongsCollectionScreen,
        CreateRoomLibrarySongs: LibrarySongsScreen
      }),
      navigationOptions: () => ({
        title: 'Create Room',
        tabBarIcon: ({ tintColor }) => (
          <Icon
            type="material"
            name="add-circle-outline"
            size={30}
            color={tintColor}
          />
        )
      })
    },
    Settings: SettingsScreen
  }),
  NowPlayingMain: {
    screen: createStackNavigator({
      NowPlaying: NowPlayingScreen,
      AddSongsRoom: AddSongsScreen,
      SearchArtistRoom: ArtistScreen,
      SearchAlbumRoom: SongsCollectionScreen,
      SearchPlaylistRoom: SongsCollectionScreen,
      LibraryPlaylistRoom: SongsCollectionScreen,
      LibrarySongsRoom: LibrarySongsScreen
    }, { headerMode: 'none' })
  }
},
{
  defaultNavigationOptions: { tabBarVisible: false }
});

const AppContainer = createAppContainer(Navigator);

class App extends Component {
  componentDidMount = async () => {
    const firebaseConfig = {
      apiKey: 'AIzaSyBCfVBTHezqkYGN6VBjFiNAaWAiJa4tJWQ',
      authDomain: 'octave-c5cd1.firebaseapp.com',
      databaseURL: 'https://octave-c5cd1.firebaseio.com',
      projectId: 'octave-c5cd1',
      storageBucket: 'octave-c5cd1.appspot.com',
      messagingSenderId: '657931064278',
      appId: '1:657931064278:web:c73efc56d3404293'
    };
    firebase.initializeApp(firebaseConfig);
  }

  render() {
    return (
      <Provider store={store}>
        <AppContainer />
      </Provider>
    );
  }
}

export default App;
