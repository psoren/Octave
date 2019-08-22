import React, { PureComponent } from 'react';
import {
  Text, View, Alert, Image, Dimensions
} from 'react-native';
import Spotify from 'rn-spotify-sdk';
import { Button } from 'react-native-elements';
import { connect } from 'react-redux';
import axios from 'axios';
import firebase from 'firebase';
import SplashScreen from 'react-native-splash-screen';

import * as actions from '../actions';
import spotifyCredentials from '../secrets';

const ROOT_URL = 'https://us-central1-octave-c5cd1.cloudfunctions.net';
const { width: screenWidth } = Dimensions.get('window');

const logo1Width = 0.9 * screenWidth;
const logo1Height = 0.1779 * logo1Width;

const logo2Width = 0.9 * screenWidth;
const logo2Height = logo2Width * 0.0618;

const spotifyWidth = 0.6 * screenWidth;
const spotifyHeight = 0.3001 * spotifyWidth;

class LoginScreen extends PureComponent {
  state = {
    loading: true,
    loggedInToSpotify: false,
    firebaseInitialized: false
  };

  componentDidUpdate() {
    if (!this.state.firebaseInitialized && this.state.loggedInToSpotify) {
      this.setupFirebase();
      this.firebaseInterval2 = setInterval(this.initFirebase, 100);
    }
    if (this.state.loggedInToSpotify && this.state.firebaseInitialized) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        loggedInToSpotify: false,
        firebaseInitialized: false,
        loading: false
      });
      clearInterval(this.firebaseInterval);
      clearInterval(this.firebaseInterval2);
      this.props.navigation.navigate('Home');
    }
  }

  loginToSpotify = async () => {
    const loginResult = await Spotify.login({ showDialog: true });
    if (loginResult) {
      this.setState({
        loading: false,
        loggedInToSpotify: true
      });
      this.setupFirebase();
    } else {
      Alert.alert('Could not login to Spotify');
      this.setState({ loading: false });
    }
  }

  initFirebase = async () => {
    if (firebase.auth().currentUser) {
      this.setState({ firebaseInitialized: true });
      clearInterval(this.firebaseInterval);
    }
  }

  setupFirebase = async () => {
    // Connect user to Firebase
    const { uri: spotifyURI } = await Spotify.getMe();
    try {
      const { data: firebaseToken } = await axios.post(`${ROOT_URL}/createFirebaseToken`,
        { spotifyURI });
      firebase.auth().signInWithCustomToken(firebaseToken).catch(async () => {
        firebase.firestore().collection('status')
          .where('state', '==', 'online')
          .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
              if (change.type === 'removed') {
                await axios.post(`https://us-central1-octave-c5cd1.
                cloudfunctions.net/removeUserOnDisconnect`,
                { userID: change.doc.id });
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

        const loginResult = await Spotify.login({ showDialog: true });
        if (loginResult) {
          this.setState({ loggedInToSpotify: true });
        }
        this.setState({ loading: false });
      });
    } catch (err) {
      console.error(err);
    }
  }

  handleLogin = async () => {
    try {
      const loginResult = await Spotify.login({ showDialog: true });
      if (loginResult) {
        this.setState({ loggedInToSpotify: true });
      }
    } catch (err) {
      Alert.alert(`We ran into an issue: ${err}`);
    }
  }

  componentDidMount = async () => {
    SplashScreen.hide();
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
    await Spotify.initialize(spotifyOptions);
    const loggedIn = await Spotify.isLoggedInAsync();
    this.firebaseInterval = setInterval(this.initFirebase, 100);
    if (!loggedIn) {
      this.setState({ loading: false });
    } else {
      this.setState({ loggedInToSpotify: true });
    }
  }

  render() {
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
          <Text style={styles.spotifyText}>Powered by</Text>
          <Image
            source={require('../assets/spotify_logo.png')}
            style={[{ width: spotifyWidth, height: spotifyHeight }, styles.image]}
          />
        </View>
        {this.state.loading ? null : (
          <Button
            onPress={this.handleLogin}
            title="LOGIN"
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
          />
        )}
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
