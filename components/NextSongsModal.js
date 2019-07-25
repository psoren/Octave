import React, { Component } from 'react';
import {
  Text, View, Modal, ScrollView
} from 'react-native';
import { Button, Icon } from 'react-native-elements';

import Song from './Song';

class NextSongsModal extends Component {
  render() {
    return (
      <Modal
        animationType="slide"
        visible={this.props.visible}
        style={styles.modal}
      >
        <View>
          <Button
            containerStyle={styles.closeButton}
            onPress={this.props.closeModal}
            type="clear"
            icon={(<Icon type="material" name="cancel" size={45} />)}
          />
          <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <Text style={styles.title}>Up Next</Text>
              <View style={styles.playlistsContainer}>
                {this.props.songs.map(song => (
                  <Song
                    id={song.id}
                    name={song.name}
                    artists={song.artists}
                    images={song.images}
                    key={song.id}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

        </View>
      </Modal>
    );
  }
}

const styles = {
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButton: {
    position: 'absolute',
    left: 25,
    top: 25,
    zIndex: 10
  },
  title: {
    alignSelf: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    margin: 15
  },
  container: {
    marginTop: 50
  }
};

export default NextSongsModal;
