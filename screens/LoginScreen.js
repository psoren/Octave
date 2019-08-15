import React, { PureComponent } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import Spotify from 'rn-spotify-sdk';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import axios from 'axios';
import firebase from 'firebase';
import SplashScreen from 'react-native-splash-screen';

import * as actions from '../actions';
import spotifyCredentials from '../secrets';
import setupRealtimeDatabase from '../functions/setupRealtimeDatabase';

const ROOT_URL = 'https://us-central1-octave-c5cd1.cloudfunctions.net';

class LoginScreen extends PureComponent {
  state = { spotifyInitialized: false };

  setupFirebase = async () => {
    // Connect user to Firebase
    const { uri: spotifyURI } = await Spotify.getMe();
    try {
      const loginResult = await Spotify.login({ showDialog: true });
      if (loginResult) { this.goToHome(); } else {
        console.log('not logged in');
      }

      const { data: firebaseToken } = await axios.post(`${ROOT_URL}/createFirebaseToken`,
        { spotifyURI });

      await firebase.auth().signInWithCustomToken(firebaseToken);

      setupRealtimeDatabase();

      firebase.firestore().collection('status')
        .where('state', '==', 'online')
        .onSnapshot((snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
              // const msg = `User ${change.doc.id} is online.`;
              // console.log(msg);
            }
            if (change.type === 'removed') {
              // const msg = `User ${change.doc.id} is offline.`;
              // console.log(msg);
              await axios.post('https://us-central1-octave-c5cd1.cloudfunctions.net/removeUserOnDisconnect',
                { userID: change.doc.id });
              // console.log(data);
            }
          });
        });

      // Store tokens in redux and navigate
      const sessionInfo = await Spotify.getSessionAsync();
      this.props.storeTokens(sessionInfo);
    } catch (err) {
      console.error(err);
    }
  }

  goToHome = async () => this.props.navigation.navigate('Home');

  handleLogin = async () => {
    try {
      const loginResult = await Spotify.login({ showDialog: true });
      if (loginResult) {
        this.goToHome();
      }
    } catch (err) {
      Alert.alert(`We ran into an issue: ${err}`);
    }
  }

  componentDidMount = async () => {
    SplashScreen.hide();
    const isInitialized = await Spotify.isInitializedAsync();
    if (!isInitialized) {
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
        await this.setupFirebase();
        this.goToHome();
      }
    } else {
      this.setState({ spotifyInitialized: true });
      const loggedIn = await Spotify.isLoggedInAsync();
      if (loggedIn) {
        await this.setupFirebase();
        this.goToHome();
      } else {
        SplashScreen.hide();
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
