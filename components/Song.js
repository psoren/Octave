import React, { Component } from 'react';
import {
  Text, View, Image, Modal
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';
import PropTypes from 'prop-types';

class Song extends Component {
  state = {
    albumArtExists: false,
    modalVisible: false
  };

  componentDidMount = async () => {
    const infoArr = this.props.uri.split(':');
    const id = infoArr[2];
    this.setState({ id });
    const accessToken = await AsyncStorage.getItem('accessToken');
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    const { data } = await axios.get(`https://api.spotify.com/v1/tracks/${id}`, config);
    let albumArt = '../assets/default_album.png';
    if (data.album
      && data.album.images
      && data.album.images[2]
      && data.album.images[2].url) {
      this.setState({ albumArtExists: true });
      albumArt = data.album.images[2].url;
    }
    let artists = '';
    data.artists.forEach((_, index) => {
      artists += data.artists[index].name;
      if (index !== data.artists.length - 1) {
        artists += ', ';
      }
    });

    let { name } = data;
    name = name.length > 20 ? `${name.slice(0, 20)}...` : name;
    artists = artists.length > 20 ? `${artists.slice(0, 20)}...` : artists;
    this.setState({ name, albumArt, artists });
  }

  handlePlayNow = async () => {
    this.setState({ modalVisible: false });
    this.props.playNow(this.state.id);
  }

  handlePlayLater = async () => {
    this.setState({ modalVisible: false });
    this.props.playLater(this.state.id);
  }

  toggleModal = () => {
    if (!this.state.modalVisible) {
      this.setState({ modalVisible: true });
    }
  }

  hideModal = () => {
    console.log('hide modal');
    this.setState({ modalVisible: false });
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.albumArtExists
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
  playNow: PropTypes.func.isRequired,
  playLater: PropTypes.func.isRequired
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

export default Song;
