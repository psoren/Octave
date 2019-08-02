import React, { Component } from 'react';
import { Text, View, Image } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import 'firebase/firestore';
import _ from 'lodash';

import * as actions from '../actions';
import SongModal from './SongModal';

class Song extends Component {
  state = { modalVisible: false };

  handlePlay = async (playNow) => {
    const {
      // eslint-disable-next-line camelcase
      id, name, artists, images, duration_ms, popularity = 1, preview_url
    } = this.props;

    const newSong = {
      id, name, artists, images, duration_ms, popularity, preview_url
    };

    if (this.props.currentRoom.id === '') {
      if (playNow) {
        this.props.prependSongsToPendingQueue([newSong]);
      } else { this.props.appendSongsToPendingQueue([newSong]); }
    } else {
      const db = firebase.firestore();
      const roomRef = db.collection('rooms').doc(this.props.currentRoom.id);
      try {
        const room = await roomRef.get();
        if (room.exists) {
          const { currentSongIndex } = room.data();
          let { songs } = room.data();
          if (playNow) {
            songs.splice(currentSongIndex + 1, 0, newSong);
          } else { songs.push(newSong); }
          songs = _.uniqBy(songs, 'id');
          roomRef.update({ songs });
        } else {
          console.error('Could not find room');
        }
      } catch (err) {
        console.error(`(Song.js) We could not update the room.${err}`);
      }
    }
    this.setState({ modalVisible: false });
  }

  toggleModal = () => {
    const currentModalVisible = this.state.modalVisible;
    this.setState({ modalVisible: !currentModalVisible });
  }

  render() {
    return (
      <View
        style={styles.container}
        onPress={this.hideModal}
      >
        <Image
          source={this.props.images.length > 0
            ? { uri: this.props.images[this.props.images.length - 1].url }
            : require('../assets/default_album.png')}
          style={styles.albumArt}
        />
        <View style={styles.songInfoContainer}>
          <Text style={styles.name}>{this.props.name}</Text>
          <Text style={styles.artists}>{this.props.artists}</Text>
        </View>
        <Button
          onPress={this.toggleModal}
          style={styles.moreButton}
          type="clear"
          icon={(
            <Icon
              type="material"
              name="more-horiz"
              size={30}
              color="#000"
            />
          )}
        />
        <SongModal
          song={this.props.name}
          artist={this.props.artists}
          handlePlay={this.handlePlay}
          modalVisible={this.state.modalVisible}
          hideModal={() => this.setState({ modalVisible: false })}
          userIsInRoom={this.props.currentRoom !== ''}
        />
      </View>
    );
  }
}

Song.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  artists: PropTypes.string.isRequired,
  images: PropTypes.instanceOf(Array).isRequired
};

const styles = {
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 5
  },
  albumArt: {
    height: 50,
    width: 50,
  },
  songInfoContainer: {
    flex: 1,
    flexDirection: 'column',
    position: 'absolute',
    left: 50,
    marginLeft: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  artists: {
    fontSize: 14
  },
  moreButton: {
    alignSelf: 'flex-end'
  }
};

const mapStateToProps = ({ auth, pendingRoom, currentRoom }) => ({
  accessToken: auth.accessToken,
  pendingRoom,
  currentRoom
});

export default connect(mapStateToProps, actions)(Song);
