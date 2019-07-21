import React, { Component } from 'react';
import { Provider } from 'react-redux';
import {
  createBottomTabNavigator,
  createAppContainer,
  createStackNavigator,
} from 'react-navigation';

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

const Navigator = createBottomTabNavigator({
  Login: LoginScreen,
  Main: createBottomTabNavigator({
    Home: HomeScreen,
    RoomSearch: RoomSearchScreen,
    CreateRoomMain: createStackNavigator({
      CreateRoom: CreateRoomScreen,
      AddSongs: AddSongsScreen,
      CreateRoomSearchArtist: ArtistScreen,
      CreateRoomSearchAlbum: SongsCollectionScreen,
      CreateRoomSearchPlaylist: SongsCollectionScreen,
      CreateRoomLibraryPlaylist: SongsCollectionScreen,
      CreateRoomLibrarySongs: LibrarySongsScreen
    }),
    Settings: SettingsScreen
  })
},
{ defaultNavigationOptions: { tabBarVisible: false } });

const AppContainer = createAppContainer(Navigator);

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <AppContainer />
      </Provider>
    );
  }
}

export default App;
