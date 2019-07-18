import React, { PureComponent } from 'react';
import { Text, View } from 'react-native';
import Spotify from 'rn-spotify-sdk';
import { Button } from 'react-native-elements';

import Song from '../components/Song';

export default class PlayerScreen extends PureComponent {

	state = { username: null };

	componentDidMount = async () => {
		try {
			let result = await Spotify.getMe();
			console.log(result);
			this.setState({ username: result.display_name });
		}
		catch (error) {
			console.log(error);
			this.setState({ username: 'Could not get username' });
		}
	}

	handleLogout = async () => {
		await Spotify.logout();
		this.props.navigation.navigate('Login');
	}

	getPlaybackInfo = async () => {
		let playbackInfo = await Spotify.getPlaybackMetadataAsync();
		console.log(playbackInfo);
	}

	render() {
		if (!this.state.username) {
			return (
				<View style={styles.container}>
					<Text style={styles.greeting}>
						Getting user info...
					</Text>
				</View>
			);
		}
		return (
			/*
			<Text style={styles.greeting}>
				You are logged in as {this.state.username}
			</Text>
			<Button
				title='Logout'
				onPress={this.handleLogout}
			/>
			<Button
				title='Get playback info'
				onPress={this.getPlaybackInfo}
			/>
			<Button
				title='home'
				onPress={() => this.props.navigation.navigate('Home')}
			/>
			*/
			<View style={styles.container}>
				<Song uri='spotify:track:654BH5npNnfbFZyHD4c2RC' />
				<Song uri='spotify:track:7GCElX2eJA5t0AFWw3WzKn' />
				<Song uri='spotify:track:1Hk0QRlUFCHYG6zIvUh0Xd' />
				<Song uri='spotify:track:6foY66mWZN0pSRjZ408c00' />
				<Button
					title='Playlist'
					onPress={() => this.props.navigation.navigate('Playlist')}
				/>
			</View>
		);
	}
}

const styles = {
	container: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'stretch',
		backgroundColor: '#F5FCFF',
	},
	greeting: {
		fontSize: 20,
		textAlign: 'center',
		margin: 10,
	}
};
