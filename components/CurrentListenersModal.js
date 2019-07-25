import React, { Component } from 'react';
import { Text, View, Modal } from 'react-native';
import { Button, Icon } from 'react-native-elements';

class CurrentListenersModal extends Component {
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
          <Text>Next songs</Text>
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
  }
};

export default CurrentListenersModal;
