import React, { Component } from 'react';
import {
  Text, View, FlatList, TextInput, Alert
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import Spotify from 'rn-spotify-sdk';
import * as actions from '../actions';

import Song from '../components/Song';
import MinimizedRoom from '../components/MinimizedRoom';
import allColors from '../colors';

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
    const { id, display_name: name, images } = await Spotify.getMe();
    const creator = { id, name, images };
    const { songs, name: roomName } = this.props;
    if (songs.length < 2) {
      Alert.alert('Please add at least two songs');
    } else if (roomName === '') {
      Alert.alert('Please add a room name');
    } else if (!id) {
      Alert.alert("You don't appear to be logged in.  There is an issue");
    } else {
      const colors = allColors[Math.floor(Math.random() * allColors.length)];
      this.props.createRoom({
        songs,
        roomName,
        creator,
        navigation: this.props.navigation,
        colors,
        location: this.props.location,
        accessToken: this.props.accessToken
      });
    }
  }

  clearQueue = () => {
    Alert.alert('Clear the queue?', '',
      [{ text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => this.props.clearPendingQueue() }],
      { cancelable: false },);
  }

  render() {
    if (this.props.currentRoom.id !== '') {
      const { playlistID, currentSongIndex, name: roomName } = this.props.currentRoom;
      return (
        <View style={styles.container}>
          <Text style={{ margin: 15, fontSize: 18 }}>
            Please leave your current room before creating a new one.
          </Text>
          <View style={styles.nowPlaying}>
            <MinimizedRoom
              playlistID={playlistID}
              currentSongIndex={currentSongIndex}
              roomName={roomName}
              goToRoom={() => this.props.navigation.navigate('NowPlaying')}
            />
          </View>
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
          onPress={this.clearQueue}
          type="clear"
          icon={(<Icon type="material" size={60} name="close" />)}
        />
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
  },
  nowPlaying: {
    position: 'absolute',
    bottom: 0,
    left: 0
  }
};

const mapStateToProps = ({
  pendingRoom,
  currentRoom,
  deviceInfo,
  auth
}) => {
  const { accessToken } = auth;
  const { name, songs } = pendingRoom;
  const { location } = deviceInfo;
  return {
    name, songs, currentRoom, location, accessToken
  };
};

export default connect(mapStateToProps, actions)(CreateRoomScreen);
