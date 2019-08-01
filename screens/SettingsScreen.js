import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import Spotify from 'rn-spotify-sdk';
import firebase from 'firebase';

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
      this.props.refreshTokens(sessionInfo);
    }

    getUserInfo = async () => {
      const user = firebase.auth().currentUser;
      console.log(user);
    }

    render() {
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
};

export default SettingsScreen;
