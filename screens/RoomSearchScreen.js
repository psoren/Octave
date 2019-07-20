import React, { Component } from 'react';
import { View } from 'react-native';
import { Icon } from 'react-native-elements';

import Thumbnail from '../components/Thumbnail';

class RoomSearchScreen extends Component {
    static navigationOptions = () => ({
      title: 'Discover',
      tabBarIcon: ({ tintColor }) => (
        <Icon
          type="material"
          name="important-devices"
          size={30}
          color={tintColor}
        />
      ),
    });

    render() {
      return (
        <View style={styles.container}>
          <Thumbnail uri="spotify:album:2FNk380jCQyICbwtkOdEHE" />
          <Thumbnail uri="spotify:artist:4YLQaW1UU3mrVetC8gNkg5" />
          <Thumbnail uri="spotify:playlist:37i9dQZF1DX8Uebhn9wzrS" />

        </View>
      );
    }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50
  },
};

export default RoomSearchScreen;
