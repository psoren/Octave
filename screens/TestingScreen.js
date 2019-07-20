import React, { Component } from 'react';
import { View } from 'react-native';
import { Icon } from 'react-native-elements';

import LibraryPlaylists from '../components/LibraryPlaylists';

class TestingScreen extends Component {
    static navigationOptions = () => ({
      title: 'Testing',
      tabBarIcon: ({ tintColor }) => (
        <Icon
          type="material"
          name="fingerprint"
          size={30}
          color={tintColor}
        />
      ),
    });

    render() {
      return (
        <View style={styles.container}>
          <LibraryPlaylists />
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

export default TestingScreen;
