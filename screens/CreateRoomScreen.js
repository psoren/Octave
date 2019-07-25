import React, { Component } from 'react';
import {
  Text, View, FlatList, TextInput, Alert
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import Spotify from 'rn-spotify-sdk';
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

  addSongs = () => this.props.navigation.navigate('AddSongs');

  createRoom = async () => {
    const { uri } = await Spotify.getMe();
    const roomCreatorID = uri.split(':')[2];
    const { songs, roomName } = this.props;

    if (songs.length === 0) {
      Alert.alert(
        'Please add at least one song',
        '', [{ text: 'OK' }],
        { cancelable: false }
      );
    } else if (roomName === '') {
      Alert.alert(
        'Please add a room name',
        '', [{ text: 'OK' }],
        { cancelable: false }
      );
    } else if (!uri) {
      Alert.alert(
        "You don't appear to be logged in.  There is an issue",
        '', [{ text: 'OK' }],
        { cancelable: false }
      );
    } else {
      this.props.createRoom({
        songs,
        roomName,
        roomCreatorID,
        navigation: this.props.navigation
      });
    }
  }

  render() {
    // If the user is in a room
    if (this.props.currentRoom !== '') {
      return (
        <View style={styles.container}>
          <Text style={{ margin: 15, fontSize: 18 }}>
            Please leave your current room before creating a new one.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <TextInput
          style={styles.roomName}
          onChangeText={roomName => this.props.changeRoomName(roomName)}
          value={this.props.roomName}
          placeholder="Your Room Name"
          autoCapitalize="none"
          autoCompleteType="off"
          autoCorrect={false}
        />
        <View style={styles.songList}>
          <FlatList
            data={this.props.songs}
            renderItem={({ item }) => (
              <Song
                id={item.id}
                name={item.name}
                artists={item.artists}
                images={item.images}
              />
            )}
            keyExtractor={item => item.id}
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
  const { roomName, songs, currentRoom } = newRoom;
  return { roomName, songs, currentRoom };
}

export default connect(mapStateToProps, actions)(CreateRoomScreen);
