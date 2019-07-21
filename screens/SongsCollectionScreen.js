import React, { Component } from 'react';
import {
  Text, View, Image, FlatList
} from 'react-native';
import axios from 'axios';
import { connect } from 'react-redux';

import Song from '../components/Song';

class SongsCollectionScreen extends Component {
  state = { imageExists: false, uris: [] };

  componentDidMount = async () => {
    let infoArr;
    if (this.props.uri) {
      infoArr = this.props.uri.split(':');
    } else {
      infoArr = this.props.navigation.getParam('uri').split(':');
    }

    const id = infoArr[2];
    const type = `${infoArr[1]}s`;
    const { accessToken } = this.props;

    // Get playlist
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    const { data: playlistData } = await axios.get(`https://api.spotify.com/v1/${type}/${id}`, config);

    if (playlistData.images
      && playlistData.images[0]
      && playlistData.images[0].url) {
      this.setState({
        imageExists: true,
        albumArt: playlistData.images[0].url
      });
    }
    this.setState({ name: playlistData.name });

    // Get songs
    const { data: songsData } = await axios.get(`https://api.spotify.com/v1/${type}/${id}/tracks`, config);
    let uris = [];
    if (type === 'playlists') {
      uris = songsData.items.map(songObj => songObj.track.uri);
    } else {
      uris = songsData.items.map(songObj => songObj.uri);
    }
    this.setState({ uris });
  }

  keyExtractor = item => item;

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{this.state.name}</Text>
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
        <FlatList
          data={this.state.uris}
          renderItem={({ item }) => <Song uri={item} />}
          keyExtractor={this.keyExtractor}
        />
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#fff'
  },
  albumArt: {
    height: 200,
    width: 200,
    alignSelf: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center'
  }
};

const mapStateToProps = ({ auth }) => ({ accessToken: auth.accessToken });

export default connect(mapStateToProps, null)(SongsCollectionScreen);
