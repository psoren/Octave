import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import Spotify from 'rn-spotify-sdk';

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

    logout = async () => {
      await Spotify.logout();
      this.props.navigation.navigate('Login');
    }

    render() {
      return (
        <View style={styles.container}>
          <Text>HomeScreen</Text>
          <Text>HomeScreen</Text>
          <Text>HomeScreen</Text>
          <Text>HomeScreen</Text>
          <Text>HomeScreen</Text>
          <Button
            title="Logout"
            onPress={this.logout}
          />
        </View>
      );
    }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
};

export default HomeScreen;
