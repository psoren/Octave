import React from 'react';
import { Modal } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';

import RoomSongsContainer from './RoomSongsContainer';

const QueueModal = (props) => {
  const previousSongs = props.songs.slice(0, props.currentSongIndex);
  const nextSongs = props.songs.slice(props.currentSongIndex + 1);

  return (
    <Modal
      animationType="slide"
      visible={props.visible}
    >
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={props.colors}
        style={styles.buttonsContainer}
      >
        <Button
          onPress={props.closeModal}
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
          onPress={props.savePlaylist}
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
        {props.isCreator ? (
          <Button
            onPress={props.clearQueue}
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
        songs={nextSongs}
        title="Up Next"
        next
      />
      <RoomSongsContainer
        songs={previousSongs}
        title="Already Played"
      />
    </Modal>
  );
};

const styles = {
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 100,
  }
};

export default QueueModal;
