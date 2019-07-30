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
    const { songs, name } = this.props;
    if (songs.length === 0) {
      Alert.alert('Please add at least one song');
    } else if (name === '') {
      Alert.alert('Please add a room name');
    } else if (!uri) {
      Alert.alert("You don't appear to be logged in.  There is an issue");
    } else {
      this.props.createRoom({
        songs,
        name,
        roomCreatorID,
        navigation: this.props.navigation,
        test: false
      });
    }
  }

  render() {
    // If the user is in a room
    if (this.props.currentRoom.id !== '') {
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
          style={styles.name}
          onChangeText={name => this.props.changePendingRoomName(name)}
          value={this.props.name}
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
  name: {
    margin: 15,
    fontSize: 30,
    height: 40
  },
  addSongsBtn: {
    marginBottom: 25
  }
};

const mapStateToProps = ({ pendingRoom, currentRoom }) => {
  const { name, songs } = pendingRoom;
  return { name, songs, currentRoom };
};

export default connect(mapStateToProps, actions)(CreateRoomScreen);
