import React, { PureComponent } from 'react';
import {
  Text, View, ActivityIndicator, Alert, Image, Dimensions
} from 'react-native';
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
const { width: screenWidth } = Dimensions.get('window');

const logo1Width = 0.9 * screenWidth;
const logo1Height = 0.1779 * logo1Width;

const logo2Width = 0.9 * screenWidth;
const logo2Height = logo2Width * 0.0618;

const spotifyWidth = 0.6 * screenWidth;
const spotifyHeight = 0.3001 * spotifyWidth;

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

      const {
        id, display_name, email, images
      } = await Spotify.getMe();
      this.props.setUserInfo({
        id, display_name, email, images
      });
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
        <View>
          <Image
            source={require('../assets/logo1.png')}
            style={[{ width: logo1Width, height: logo1Height }, styles.image]}
          />
          <Image
            source={require('../assets/logo2.png')}
            style={[{ width: logo2Width, height: logo2Height }, styles.image]}
          />
        </View>

        <View style={styles.spotifyContainer}>
          <Text style={styles.spotifyText}>
            Powered by
          </Text>
          <Image
            source={require('../assets/spotify_logo.png')}
            style={[{ width: spotifyWidth, height: spotifyHeight }, styles.image]}
          />

        </View>
        <Button
          onPress={this.handleLogin}
          title="LOGIN"
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
        />
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  image: {
    margin: 5
  },
  button: {
    backgroundColor: '#1DB954',
    borderRadius: 100,
    width: 180,
    height: 60,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  spotifyContainer: {
    flexDirection: 'column',
    alignItems: 'center'
  },
  spotifyText: {
    color: '#1DB954',
    fontSize: 20
  }
};

export default connect(null, actions)(LoginScreen);
