import React, { Component } from 'react';
import { TextInput, View, FlatList } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import 'firebase/firestore';

import MinimizedRoom from '../components/MinimizedRoom';
// import RoomSearchResult from '../components/RoomSearchResult';

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

  // state={ search: '' };

  // performSearch = async search => this.setState({ search }, async () => {
  //   const db = firebase.firestore();
  //   // Search for rooms
  // });

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


    //   <View style={styles.searchContainer}>
    //   <TextInput
    //     value={this.state.search}
    //     style={styles.searchInput}
    //     onChangeText={search => this.performSearch(search)}
    //     placeholder="Search for a room..."
    //     autoCapitalize="none"
    //     autoCompleteType="off"
    //     autoCorrect={false}
    //   />
    //   <Button
    //     containerStyle={styles.closeButton}
    //     onPress={this.setState({ search: '', rooms: [] })}
    //     type="clear"
    //     icon={(<Icon type="material" name="cancel" size={45} />)}
    //   />
    // </View>
    // <FlatList
    //   data={this.state.rooms}
    //   renderItem={({ room }) => (
    //     <RoomSearchResult
    //       id={room.id}
    //       roomName={room.artists}
    //       currentSongName={room.currentSongName}
    //       images={room.images}
    //     />
    //   )}
    //   keyExtractor={room => room.id}
    // />

    return (
      <View style={styles.container}>

        <View style={styles.nowPlaying}>
          {NowPlaying}
        </View>
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
