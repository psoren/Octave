import React, { Component } from 'react';
import { Text, View, Image } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import _ from 'lodash';

import * as actions from '../actions';
import 'firebase/firestore';
import SongModal from './SongModal';

class Song extends Component {
  state = { modalVisible: false };

  handlePlay = async (playNow) => {
    const {
      id, name, artists, images
    } = this.props;
    const newSong = {
      id, name, artists, images
    };
    if (!this.props.currentRoom.id) {
      if (playNow) {
        this.props.prependSongToPendingQueue(newSong);
      } else { this.props.appendSongToPendingQueue(newSong); }
    } else {
      const db = firebase.firestore();
      const roomRef = db.collection('rooms').doc(this.props.currentRoom.id);
      try {
        const room = await roomRef.get();
        if (room.exists) {
          let { songs } = room.data();
          if (playNow) {
            songs.splice(1, 0, newSong);
          } else {
            songs.push(newSong);
          }
          songs = _.uniqBy(songs, 'id');

          await roomRef.update({ songs });
        } else {
          console.error('Could not find room');
        }
      } catch (err) {
        console.error(`${err}. We could not update the room.`);
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
          userIsInRoom={this.props.currentRoomID !== ''}
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

const mapStateToProps = ({ auth, currentRoom }) => ({
  accessToken: auth.accessToken, currentRoom
});

export default connect(mapStateToProps, actions)(Song);
