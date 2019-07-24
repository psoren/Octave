import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-elements';

class NowPlayingScreen extends Component {
  addSongs = () => {
    this.props.navigation.navigate('AddSongsRoom');
  }

  nextSongs = () => {
    console.log('nex');
  }

  currentListeners = () => {
    console.log('next songs');
  }


  render() {
    return (
      <View>
        <Text>NowPlayingScreen</Text>
        <Text>NowPlayingScreen</Text>
        <Text>NowPlayingScreen</Text>
        <Text>NowPlayingScreen</Text>
        <Text>NowPlayingScreen</Text>
        <Button
          title="Add songs"
          onPress={this.addSongs}
        />
        <Button
          title="next songs"
          onPress={this.nextSongs}
        />
        <Button
          title="view listeners"
          onPress={this.currentListeners}
        />
      </View>
    );
  }
}

export default NowPlayingScreen;
