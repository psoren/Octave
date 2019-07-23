import React, { PureComponent } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Spotify from 'rn-spotify-sdk';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';

import * as actions from '../actions';
import spotifyCredentials from '../secrets';

class LoginScreen extends PureComponent {
  state = { spotifyInitialized: false };

  goToHome = async () => {
    // Store tokens in redux and navigate
    const sessionInfo = await Spotify.getSessionAsync();
    this.props.storeTokens(sessionInfo);
    this.props.navigation.navigate('Home');
  }

  handleLogin = async () => {
    const loginResult = await Spotify.login();
    if (loginResult) { this.goToHome(); }
  }

  componentDidMount = async () => {
    try {
      await this.initializeIfNeeded();
    } catch (error) {
      console.log(`There was an error${error.message}`);
    }
  }

  async initializeIfNeeded() {
    if (!await Spotify.isInitializedAsync()) {
      const {
        clientID, redirectURL, scopes, tokenSwapURL, tokenRefreshURL
      } = spotifyCredentials;
      const spotifyOptions = {
        clientID,
        sessionUserDefaultsKey: 'SpotifySession',
        redirectURL,
        scopes,
        tokenSwapURL,
        tokenRefreshURL,
        tokenRefreshEarliness: 30
      };
      const loggedIn = await Spotify.initialize(spotifyOptions);
      this.setState({ spotifyInitialized: true });
      if (loggedIn) {
        this.goToHome();
      }
    } else {
      this.setState({ spotifyInitialized: true });
      if (await Spotify.isLoggedInAsync()) {
        this.goToHome();
      }
    }
  }

  render() {
    if (!this.state.spotifyInitialized) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" />
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <Button
          onPress={this.handleLogin}
          title="Login"
        />
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  }
};

export default connect(null, actions)(LoginScreen);
