import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Button, Icon } from 'react-native-elements';

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

export default SettingsScreen;
