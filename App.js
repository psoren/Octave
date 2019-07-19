import React, { Component } from 'react';
import { Provider } from 'react-redux';
import {
  createBottomTabNavigator,
  createAppContainer,
} from 'react-navigation';

import store from './store';
import CreateRoomScreen from './screens/CreateRoomScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RoomSearchScreen from './screens/RoomSearchScreen';
import SettingsScreen from './screens/SettingsScreen';
import SearchContentScreen from './screens/SearchContentScreen';

const Navigator = createBottomTabNavigator({
  Login: LoginScreen,
  SearchContent: SearchContentScreen,
  Main: createBottomTabNavigator({
    Home: HomeScreen,
    CreateRoom: CreateRoomScreen,
    Settings: SettingsScreen,
    RoomSearch: RoomSearchScreen,
  }),
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
