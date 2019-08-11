import React, { Component } from 'react';
import {
  TextInput, View, ScrollView, Text
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import 'firebase/firestore';

import MinimizedRoom from '../components/MinimizedRoom';
import RoomSearchResult from '../components/RoomSearchResult';

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

  state={ search: '', rooms: [] };

  performSearch = async search => this.setState({ search }, async () => {
    const db = firebase.firestore();
    const { search: name } = this.state;
    const snapshot = await db.collection('rooms').where('name', '==', name).get();


    const searchResults = [];
    snapshot.forEach((doc) => {
      const {
        name: roomName, colors, currentSongIndex, creator
      } = doc.data();
      const currentSongName = doc.data().songs[currentSongIndex].name;
      const { images } = doc.data().songs[currentSongIndex];
      const searchResult = {
        id: doc.id,
        roomName,
        currentSongName,
        images,
        colors,
        creatorID: creator.id
      };
      searchResults.push(searchResult);
    });

    this.setState({ rooms: searchResults });
    // See if search matches any of the room names
  });

  render() {
    let NowPlaying = null;
    if (this.props.currentRoom.id !== '') {
      const { songs, currentSongIndex, name: roomName } = this.props.currentRoom;
      NowPlaying = (
        <MinimizedRoom
          songs={songs}
          currentSongIndex={currentSongIndex}
          roomName={roomName}
          goToRoom={() => this.props.navigation.navigate('NowPlaying')}
        />
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            value={this.state.search}
            style={styles.searchInput}
            onChangeText={search => this.performSearch(search)}
            placeholder="Search for a room..."
            autoCapitalize="none"
            autoCompleteType="off"
            autoCorrect={false}
          />
          <Button
            containerStyle={styles.closeButton}
            onPress={() => this.setState({ search: '', rooms: [] })}
            type="clear"
            icon={(<Icon type="material" name="cancel" size={45} />)}
          />
        </View>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContainerStyle}
        >
          {this.state.rooms.map(room => (
            <RoomSearchResult
              id={room.id}
              roomName={room.roomName}
              currentSongName={room.currentSongName}
              images={room.images}
              colors={room.colors}
              creatorID={room.creatorID}
              key={room.id}
            />
          ))}
        </ScrollView>
        {NowPlaying}
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
  scrollContainerStyle: {
    alignItems: 'center'
  },
  scrollContainer: {
    flex: 1,
    flexDirection: 'column'
  },
  searchContainer: {
    flexDirection: 'row'
  },
  searchInput: {
    flex: 5,
    margin: 15,
    fontSize: 30,
    height: 40
  },
  nowPlaying: {
    position: 'absolute',
    bottom: 0,
    left: 0
  }
};

const mapStateToProps = ({ currentRoom }) => ({ currentRoom });

export default connect(mapStateToProps, null)(RoomSearchScreen);
