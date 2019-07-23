import React, { Component } from 'react';
import { Text, View, Image } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import SongModal from './SongModal';

class Song extends Component {
  state = { modalVisible: false };

  handlePlayNow = async () => {
    this.setState({ modalVisible: false });
    console.log(`Play ${this.props.id} now...`);
  }

  handlePlayLater = async () => {
    this.setState({ modalVisible: false });
    console.log(`Play ${this.props.id} later...`);
  }

  toggleModal = () => {
    const currentModalVisible = this.state.modalVisible;
    this.setState({ modalVisible: !currentModalVisible });
  }

  hideModal = () => this.setState({ modalVisible: false });

  render() {
    return (
      <View
        style={styles.container}
        onPress={this.hideModal}
      >
        <Image
          source={this.props.imageExists
            ? { uri: this.props.albumArt }
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
          handlePlayNow={this.handlePlayNow}
          handlePlayLater={this.handlePlayLater}
          modalVisible={this.state.modalVisible}
          hideModal={this.hideModal}
        />
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
  }
};

const mapStateToProps = ({ auth }) => ({ accessToken: auth.accessToken });

export default connect(mapStateToProps, null)(Song);
