import React, { Component } from 'react';
import { Provider } from 'react-redux';
import {
	createBottomTabNavigator,
	createStackNavigator,
	createAppContainer
} from 'react-navigation';

import store from './store';

import CreateRoomScreen from './screens/CreateRoomScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import NowPlayingScreen from './screens/NowPlayingScreen';
import RoomSearchScreen from './screens/RoomSearchScreen';
import SearchContentScreen from './screens/SearchContentScreen';
import SettingsScreen from './screens/SettingsScreen';

const Navigator = createBottomTabNavigator({
	Login: LoginScreen,
	Main: createBottomTabNavigator({
		Home: HomeScreen,
		CreateRoom: CreateRoomScreen,
		Settings: SettingsScreen,
		RoomSearch: RoomSearchScreen
	})
},
	{ defaultNavigationOptions: { tabBarVisible: false } }
);

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
