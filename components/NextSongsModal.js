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
      >
        <View style={styles.container}>
          <Button
            containerStyle={styles.closeButton}
            onPress={this.props.closeModal}
            type="clear"
            icon={(<Icon type="material" name="cancel" size={45} />)}
          />
          <ScrollView>
            <Text style={styles.title}>Up Next</Text>
            {
              this.props.songs.length !== 1
                ? (
                  <View>
                    {this.props.songs.map((song, index) => (
                      index === 0 ? null
                        : (
                          <Song
                            id={song.id}
                            name={song.name}
                            artists={song.artists}
                            images={song.images}
                            key={song.id}
                          />
                        )
                    ))}
                  </View>
                )
                : (
                  <View style={styles.noMoreSongsContainer}>
                    <Text style={styles.noMoreSongs}>
                      Add songs to the queue!
                    </Text>
                  </View>
                )
              }
          </ScrollView>
        </View>
      </Modal>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    marginTop: 35
  },
  closeButton: {
    position: 'absolute',
    left: 5,
    top: 5,
    zIndex: 10
  },
  title: {
    alignSelf: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    margin: 15
  },
  noMoreSongs: {
    fontSize: 28,
    fontWeight: 'bold'
  },
  noMoreSongsContainer: {
    alignItems: 'center',
    flex: 1
  }
};

export default NextSongsModal;
