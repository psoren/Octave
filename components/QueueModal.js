import React, { Component } from 'react';
import { Modal } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';

import RoomSongsContainer from './RoomSongsContainer';

class QueueModal extends Component {
  state = { loading: true };

  componentDidMount = () => this.getSongData();

  componentDidUpdate(prevProps) {
    if (!prevProps.visible && this.props.visible) {
      this.getSongData();
    }
  }

  getSongData = async () => {
    const { currentSongIndex, playlistID, accessToken } = this.props;
    const prevSongsStartIndex = Math.max(0, currentSongIndex - 50);
    const nextSongsStartIndex = currentSongIndex + 1;
    const NUM_SONGS = 50;
    const previousSongs = [];
    const nextSongs = [];

    const numPreviousSongs = currentSongIndex - prevSongsStartIndex;

    if (numPreviousSongs > 0) {
      const { data: prevData } = await axios({
        url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { limit: numPreviousSongs, offset: prevSongsStartIndex }
      });
      prevData.items.forEach((item) => {
        previousSongs.push(item.track);
      });
    }

    const { data: nextData } = await axios({
      url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: NUM_SONGS, offset: nextSongsStartIndex }
    });

    nextData.items.forEach((item) => {
      nextSongs.push(item.track);
    });
    this.setState({ loading: false, nextSongs, previousSongs });
  }

  render() {
    if (this.state.loading) {
      return null;
    }

    return (
      <Modal
        animationType="slide"
        visible={this.props.visible}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={this.props.colors}
          style={styles.buttonsContainer}
        >
          <Button
            onPress={this.props.closeModal}
            type="clear"
            icon={(
              <Icon
                type="material"
                name="cancel"
                color="#fff"
                size={45}
              />
            )}
          />
          <Button
            onPress={this.props.savePlaylist}
            type="clear"
            icon={(
              <Icon
                type="material"
                name="playlist-add-check"
                color="#fff"
                size={45}
              />
            )}
          />
          {this.props.isCreator ? (
            <Button
              onPress={this.props.clearQueue}
              type="clear"
              icon={(
                <Icon
                  type="material"
                  name="remove-from-queue"
                  color="#fff"
                  size={45}
                />
              )}
            />
          ) : null}

        </LinearGradient>
        <RoomSongsContainer
          songs={this.state.nextSongs}
          title="Up Next"
          next
        />
        <RoomSongsContainer
          songs={this.state.previousSongs}
          title="Already Played"
        />
      </Modal>
    );
  }
}

const styles = {
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 100,
  }
};

export default QueueModal;
