import React, { Component } from 'react';
import {
  Text, View, Alert, Image
} from 'react-native';
import { Icon } from 'react-native-elements';
import Spotify from 'rn-spotify-sdk';
import { connect } from 'react-redux';
import firebase from 'firebase';

import * as actions from '../actions';
import MinimizedRoom from '../components/MinimizedRoom';

class SettingsScreen extends Component {
  static navigationOptions = () => ({
    title: 'Me',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        type="material"
        name="person"
        size={30}
        color={tintColor}
      />
    )
  });

  state = { display_name: '', images: [] };

  logout = () => {
    Alert.alert('Are you sure you want to log out?', '',
      [{ text: 'Cancel', style: 'cancel' }, {
        text: 'OK',
        onPress: async () => {
          firebase.auth().signOut().then(async () => {
            this.props.clearUserInfo();
            await Spotify.logout();
            this.props.navigation.navigate('Login');
          }).catch(() => {
            Alert.alert('Could not log out.');
          });
        },
      }]);
  }

  componentDidMount = async () => {
    const {
      id, display_name, email, images
    } = await Spotify.getMe();
    this.props.setUserInfo({
      id, display_name, email, images
    });
    this.setState({ display_name, images });
  }

  render() {
    let NowPlaying = null;
    if (this.props.currentRoom.id !== '') {
      const { playlistID, currentSongIndex, name: roomName } = this.props.currentRoom;
      NowPlaying = (
        <MinimizedRoom
          playlistID={playlistID}
          currentSongIndex={currentSongIndex}
          roomName={roomName}
          goToRoom={() => this.props.navigation.navigate('NowPlaying')}
        />
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.userCard}>
          <Text style={styles.name}>
            Logged in as
            {'\n'}
            {this.state.display_name}
          </Text>
          <Image
            source={this.state.images.length > 0
              ? { uri: this.state.images[0].url }
              : require('../assets/default_album.png')}
            style={styles.image}
          />
        </View>
        <View style={styles.nowPlaying}>
          {NowPlaying}
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  userCard: {
    width: 300,
    height: 300,
    borderColor: '#444',
    borderRadius: 50,
    borderWidth: 1,
    margin: 25,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 25
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  logoutContainerButton: {
    flex: 1,
    margin: 20,
    width: 200,
    height: 100
  },
  logoutButton: {
    borderRadius: 100,
    backgroundColor: '#ed2939'
  },
  button: {
    margin: 15
  },
  nowPlaying: {
    position: 'absolute',
    bottom: 0,
    left: 0
  }
};

const mapStateToProps = ({ userInfo, currentRoom }) => ({ userInfo, currentRoom });


export default connect(mapStateToProps, actions)(SettingsScreen);
