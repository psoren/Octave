import React from 'react';
import { View, Modal } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PropTypes from 'prop-types';

const SongModal = props => (
  <Modal
    animationType="slide"
    visible={props.modalVisible}
  >
    <View style={styles.modal}>
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
      <Button
        title="Play Now"
        onPress={props.handlePlayNow}
      />
      <Button
        title="Play Later"
        onPress={props.handlePlayLater}
      />
    </View>
  </Modal>
);

SongModal.propTypes = {
  handlePlayNow: PropTypes.func.isRequired,
  handlePlayLater: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired
};

const styles = {
  modal: {
    flex: 1,
    margin: 50,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 500,
    width: 300
  },
  closeButton: {
    alignSelf: 'flex-start',
    position: 'relative',
    left: -30
  }
};

export default SongModal;
