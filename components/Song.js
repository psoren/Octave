import React, { Component } from 'react';
import {
  Text, View, Image, Modal
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class Song extends Component {
  state = {
    imageExists: false,
    modalVisible: false
  };

  componentDidMount = async () => {
    const {
      id, name, artists, imageExists, albumArt
    } = this.props;
    this.setState({
      id, name, artists, imageExists, albumArt
    });
  }

  handlePlayNow = async () => {
    this.setState({ modalVisible: false });
    console.log(`play ${this.state.id}now...`);
  }

  handlePlayLater = async () => {
    this.setState({ modalVisible: false });
    console.log(`play ${this.state.id}later...`);
  }

  toggleModal = () => {
    if (!this.state.modalVisible) {
      this.setState({ modalVisible: true });
    }
  }

  hideModal = () => this.setState({ modalVisible: false });

  render() {
    return (
      <View style={styles.container}>
        {this.state.imageExists
          ? (
            <Image
              source={{ uri: this.state.albumArt }}
              style={styles.albumArt}
            />
          )
          : (
            <Image
              source={require('../assets/default_album.png')}
              style={styles.albumArt}
            />
          )
        }
        <View style={styles.songInfoContainer}>
          <Text style={styles.name}>{this.state.name}</Text>
          <Text style={styles.artists}>{this.state.artists}</Text>
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
        <Modal
          animationType="slide"
          visible={this.state.modalVisible}
        >
          <View style={styles.modal}>
            <Button
              buttonStyle={styles.closeButton}
              type="clear"
              onPress={this.hideModal}
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
              onPress={this.handlePlayNow}
            />
            <Button
              title="Play Later"
              onPress={this.handlePlayLater}
            />
          </View>
        </Modal>
      </View>
    );
  }
}

Song.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  artists: PropTypes.string.isRequired,
  imageExists: PropTypes.bool.isRequired,
  albumArt: PropTypes.string.isRequired,
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
  },
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

const mapStateToProps = ({ auth }) => ({ accessToken: auth.accessToken });

export default connect(mapStateToProps, null)(Song);
