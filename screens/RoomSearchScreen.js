import React, { Component } from 'react';
import { View } from 'react-native';
import { Icon } from 'react-native-elements';

import SearchResult from '../components/SearchResult';

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
        <View style={styles.container}>
          <SearchResult uri="spotify:playlist:37i9dQZEVXcSK2M4TVQOSL" />
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
