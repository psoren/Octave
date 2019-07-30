import React, { Component } from 'react';
import {
  Text, View, Modal, ScrollView
} from 'react-native';
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
          <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <Text style={styles.title}>Current Listeners</Text>
              {
                this.props.listeners.length > 0
                  ? (
                    <View style={styles.listenersContainer}>
                      {this.props.listeners.map((listeners, index) => (
                        <Text key="sdfasfd">Listener 1</Text>
                      ))}
                    </View>
                  )
                  : (
                    <View style={styles.listenersContainer}>
                      <Text style={styles.noListeners}>
                      Invite people to your room!
                      </Text>
                    </View>
                  )
              }
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
  },
  noListeners: {
    fontSize: 28,
    fontWeight: 'bold'
  },
  listenersContainer: {
    alignItems: 'center'
  }
};

export default CurrentListenersModal;
