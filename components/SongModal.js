import React from 'react';
import {
  Text, View, Modal, Dimensions
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PropTypes from 'prop-types';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';

const { height } = Dimensions.get('window');
const modalHeight = height / 4;
const marginHeight = 3 * (height / 4);

const SongModal = props => (
  <Modal
    animationType="slide"
    visible={props.modalVisible}
    style={styles.modal}
    transparent
  >
    <BlurView style={styles.blur} />
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      colors={['#00c9ff', '#92fe9d']}
      style={styles.modalContainer}
    >
      <Button
        buttonStyle={styles.closeButton}
        type="clear"
        onPress={props.hideModal}
        icon={(
          <Icon
            type="material"
            name="close"
            size={30}
            color="#000"
          />
        )}
      />
      <View style={styles.songInfoContainer}>
        <Text style={styles.song}>{props.song}</Text>
        <Text style={styles.artist}>{props.artist}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Play Next"
          type="outline"
          titleStyle={{ fontSize: 12 }}
          containerStyle={styles.buttonView}
          raised
          onPress={() => props.handlePlay(true)}
        />
        <Button
          title="Play Later"
          type="outline"
          titleStyle={{ fontSize: 12 }}
          containerStyle={styles.buttonView}
          raised
          onPress={() => props.handlePlay(false)}
        />
      </View>
    </LinearGradient>
  </Modal>
);

SongModal.propTypes = {
  handlePlay: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
  song: PropTypes.string.isRequired,
  artist: PropTypes.string.isRequired
};

const styles = {
  blur: {
    height: marginHeight
  },
  modalContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: modalHeight,
    flex: 0,
  },
  songInfoContainer: {
    flex: 2,
    flexDirection: 'column',
    marginLeft: 25
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'space-between',
    marginRight: 25,
  },
  closeButton: {
    alignSelf: 'flex-start',
    position: 'relative'
  },
  modal: {
    flex: 0
  },
  song: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  artist: {
    fontSize: 16,
    color: '#fff'
  },
  buttonView: {
    margin: 10
  }
};

export default SongModal;
