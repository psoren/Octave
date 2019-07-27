import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import Spotify from 'rn-spotify-sdk';
import { connect } from 'react-redux';
import * as actions from '../actions';

class HomeScreen extends Component {
  static navigationOptions = () => ({
    title: 'Home',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        type="material"
        name="home"
        size={30}
        color={tintColor}
      />
    )
  });

  componentDidMount = () => {
    this.tokenRefreshInterval = setInterval(async () => {
      await Spotify.renewSession();
      const sessionInfo = await Spotify.getSessionAsync();
      this.props.refreshTokens(sessionInfo);
    }, 1000 * 60 * 30);
  }

  componentWillUnmount() {
    console.log('Home Screen unmounting...');
    clearInterval(this.tokenRefreshInterval);
  }

  logout = async () => {
    await Spotify.logout();
    this.props.navigation.navigate('Login');
  }

  renewSession = async () => {
    await Spotify.renewSession();
    const sessionInfo = await Spotify.getSessionAsync();
    this.props.refreshTokens(sessionInfo);
  }

  render() {
    const { accessToken, refreshToken, expireTime } = this.props.auth;

    return (
      <View style={styles.container}>
        <Text>HomeScreen</Text>
        <Text>HomeScreen</Text>
        <Text>HomeScreen</Text>
        <Text>HomeScreen</Text>
        <Text>HomeScreen</Text>
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
        <Text>
          {' '}
          Access token:
          {' '}
          {accessToken}
          {'\n'}
        </Text>
        <Text>
          Refresh token:
          {' '}
          {refreshToken}
          {'\n'}
        </Text>
        <Text>
          Expire time:
          {expireTime}
        </Text>
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
  }
};

const mapStateToProps = ({ auth }) => ({ auth });

export default connect(mapStateToProps, actions)(HomeScreen);
