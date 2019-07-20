import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Icon } from 'react-native-elements';

// Testing
import Artist from '../components/Artist';

class RoomSearchScreen extends Component {
    static navigationOptions = () => ({
      title: 'Discover',
      tabBarIcon: ({ tintColor }) => (
        <Icon
          type="material"
          name="search"
          size={30}
          color={tintColor}
        />
      ),
    });

    render() {
      return (
        <Artist uri="spotify:artist:246dkjvS1zLTtiykXe5h60" />
      );
    }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
};

export default RoomSearchScreen;
