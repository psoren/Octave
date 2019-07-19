import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Icon } from 'react-native-elements';

class RoomSearchScreen extends Component {
    static navigationOptions = () => ({
      title: 'Search',
      tabBarIcon: ({ tintColor }) => (
        <Icon
          type="search"
          name="home"
          size={30}
          color={tintColor}
        />
      ),
    });

    render() {
      return (
        <View style={styles.container}>
          <Text>RoomSearchScreen</Text>
          <Text>RoomSearchScreen</Text>
          <Text>RoomSearchScreen</Text>
          <Text>RoomSearchScreen</Text>
          <Text>RoomSearchScreen</Text>
        </View>
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
