import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import Spotify from 'rn-spotify-sdk';
import firebase from 'firebase';
import { connect } from 'react-redux';
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

    logout = async () => {
      await Spotify.logout();
      this.props.navigation.navigate('Login');
    }

    renewSession = async () => {
      await Spotify.renewSession();
      const sessionInfo = await Spotify.getSessionAsync();
      console.log(sessionInfo);
      this.props.refreshTokens(sessionInfo);
    }

    getUserInfo = async () => {
      const user = firebase.auth().currentUser;
      console.log(user);
    }

    render() {
      let NowPlaying = null;
      if (this.props.currentRoom.id !== '') {
        const { songs, currentSongIndex, name: roomName } = this.props.currentRoom;
        NowPlaying = (
          <MinimizedRoom
            songs={songs}
            currentSongIndex={currentSongIndex}
            roomName={roomName}
            goToRoom={() => this.props.navigation.navigate('NowPlaying')}
          />
        );
      }

      return (
        <View style={styles.container}>
          <Text>SettingsScreen</Text>
          <Text>SettingsScreen</Text>
          <Text>SettingsScreen</Text>
          <Text>SettingsScreen</Text>
          <Text>SettingsScreen</Text>
          <Button
            title="Now Playing"
            onPress={() => this.props.navigation.navigate('NowPlaying')}
          />
          <Button
            style={styles.button}
            title="Logout"
            onPress={this.logout}
          />
          <Button
            style={styles.button}
            title="Renew Session"
            onPress={this.renewSession}
          />
          <Button
            title="get user info"
            onPress={this.getUserInfo}
          />

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
    backgroundColor: '#fff'
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

const mapStateToProps = ({ currentRoom }) => ({ currentRoom });


export default connect(mapStateToProps, actions)(SettingsScreen);
