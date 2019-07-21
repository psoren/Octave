import React, { Component } from 'react';
import { View, FlatList, TextInput } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import * as actions from '../actions';

import Song from '../components/Song';

class CreateRoomScreen extends Component {
  static navigationOptions = () => ({
    title: 'Create',
    tabBarIcon: ({ tintColor }) => (
      <Icon
        type="material"
        name="add-circle-outline"
        size={30}
        color={tintColor}
      />
    ),
  });

  state = { roomName: '' };

  keyExtractor = item => item;

  addSongs = () => this.props.navigation.navigate('AddSongs');

  createRoom = () => console.log('create room');

  render() {
    return (
      <View style={styles.container}>

        <TextInput
          style={styles.roomName}
          onChangeText={roomName => this.setState({ roomName })}
          value={this.state.roomName}
          placeholder="Your Room Name"
        />

        <View style={styles.songList}>
          <FlatList
            data={this.props.songs}
            renderItem={({ item }) => <Song uri={item} playNow={() => { }} playLater={() => { }} />}
            keyExtractor={this.keyExtractor}
          />
        </View>
        <Button
          style={styles.addSongsBtn}
          title="Add Songs"
          type="outline"
          onPress={this.addSongs}
        />
        <Button
          title="Create Room"
          type="outline"
          onPress={this.createRoom}
        />
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  songList: {
    backgroundColor: '#fff',
    height: 400,
    width: 400
  },
  roomName: {
    margin: 15,
    fontSize: 30,
    height: 40
  },
  addSongsBtn: {
    marginBottom: 25
  }
};

function mapStateToProps({ newRoom }) {
  return {
    roomName: newRoom.roomName,
    songs: newRoom.songs
  };
}

export default connect(mapStateToProps, actions)(CreateRoomScreen);
