import React, { PureComponent } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import Spotify from 'rn-spotify-sdk';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import axios from 'axios';
import firebase from 'firebase';

import * as actions from '../actions';
import spotifyCredentials from '../secrets';

const ROOT_URL = 'https://us-central1-octave-c5cd1.cloudfunctions.net';

class LoginScreen extends PureComponent {
  state = { spotifyInitialized: false };

  goToHome = async () => {
    // Connect user to Firebase
    const { uri: spotifyURI } = await Spotify.getMe();
    try {
      const { data: firebaseToken } = await axios.post(`${ROOT_URL}/createFirebaseToken`,
        { spotifyURI });
      await firebase.auth().signInWithCustomToken(firebaseToken);

      // Store tokens in redux and navigate
      const sessionInfo = await Spotify.getSessionAsync();
      this.props.storeTokens(sessionInfo);
      this.props.navigation.navigate('Home');
    } catch (err) {
      console.error(err);
    }
  }

  handleLogin = async () => {
    try {
      const loginResult = await Spotify.login({ showDialog: true });
      if (loginResult) { this.goToHome(); }
    } catch (err) {
      Alert.alert(`We ran into an issue: ${err}`);
    }
  }

  componentDidMount = async () => {
    try {
      await this.initializeIfNeeded();
    } catch (err) {
      console.error(`There was an error${err.message}`);
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
          <ActivityIndicator size="large" color="#00c9fd" animating />
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
