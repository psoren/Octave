import React, { Component } from 'react';
import {
  Text,
  View,
  FlatList,
  TextInput,
  Alert,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import Spotify from 'rn-spotify-sdk';
import LinearGradient from 'react-native-linear-gradient';
import * as actions from '../actions';

import Song from '../components/Song';
import MinimizedRoom from '../components/MinimizedRoom';
import allColors from '../colors';

const {
  width: deviceWidth,
  height: deviceHeight
} = Dimensions.get('window');

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

  state = { creatingRoom: false };

  addSongs = () => this.props.navigation.navigate('AddSongs');

  createRoom = async () => {
    const { id, display_name: name, images } = await Spotify.getMe();
    const creator = { id, name, images };
    const { songs, name: roomName } = this.props;
    if (!this.props.location) {
      Alert.alert(`Please enable location permissions in
          Settings > Privacy > Location Services > Octave to create a room`);
    } else if (songs.length < 3) {
      Alert.alert('Please add at least three songs');
    } else if (roomName === '') {
      Alert.alert('Please add a room name');
    } else if (!id) {
      Alert.alert("You don't appear to be logged in.  There is an issue");
    } else {
      this.setState({ creatingRoom: true });
      const colors = allColors[Math.floor(Math.random() * allColors.length)];
      this.props.createRoom({
        songs,
        roomName,
        creator,
        navigation: this.props.navigation,
        colors,
        location: this.props.location,
      });
    }
  }

  componentDidUpdate = () => {
    if (this.state.creatingRoom && this.props.currentRoom.id) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ creatingRoom: false });
    }
  }

  clearQueue = () => {
    Alert.alert('Clear the queue?', '',
      [{ text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => this.props.clearPendingQueue() }],
      { cancelable: false });
  }

  render() {
    if (this.state.creatingRoom) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#00c9ff" animating />
        </View>
      );
    }

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
        <View style={{
          backgroundColor: '#fff',
          width: deviceWidth,
          height: 0.5 * deviceHeight
        }}
        >
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
        <View style={[styles.buttons, { width: deviceWidth }]}>
          <Button
            onPress={this.addSongs}
            type="clear"
            icon={(
              <Icon type="material" size={35} color="#000" name="playlist-add" />
            )}
          />
          <Button
            onPress={this.clearQueue}
            type="clear"
            icon={(
              <Icon type="material" size={35} color="#000" name="cancel" />
            )}
          />
        </View>
        <TouchableOpacity
          style={styles.shadowContainer}
          onPress={this.createRoom}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={['#00c9ff', '#92fe9d']}
            style={styles.createRoomContainer}
          >
            <Text style={styles.createRoomText}>Create Room</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  buttons: {
    flex: 1,
    flexDirection: 'row',
    height: 50,
    justifyContent: 'space-around',
    alignItems: 'space-around'
  },
  name: {
    margin: 15,
    fontSize: 30,
    height: 40,
    padding: 5
  },
  nowPlaying: {
    position: 'absolute',
    bottom: 0,
    left: 0
  },
  shadowContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 35
  },
  createRoomContainer: {
    width: 200,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 35
  },
  createRoomText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
};

const mapStateToProps = ({
  pendingRoom,
  currentRoom,
  deviceInfo,
}) => {
  const { name, songs } = pendingRoom;
  const { location } = deviceInfo;
  return {
    name, songs, currentRoom, location
  };
};

export default connect(mapStateToProps, actions)(CreateRoomScreen);
