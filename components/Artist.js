import React, { Component } from 'react';
import {
  Text, View, Image, ScrollView
} from 'react-native';
import axios from 'axios';
import qs from 'qs';
import { connect } from 'react-redux';

import Song from './Song';
import Thumbnail from './Thumbnail';

class Artist extends Component {
    state = { songUris: [], albumUris: [] };

    componentDidMount = async () => {
      const infoArr = this.props.uri.split(':');
      const id = infoArr[2];
      const { accessToken } = this.props;

      // Get artist info
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      const { data: artistData } = await axios.get(`https://api.spotify.com/v1/artists/${id}`, config);
      this.setState({ name: artistData.name, artistImage: artistData.images[1].url });

      // Get top tracks
      const { data: songsData } = await axios.get(`https://api.spotify.com/v1/artists/${id}/top-tracks?`,
        { ...config, params: { country: 'US' } });
      const songUris = songsData.tracks.map(item => item.uri);
      this.setState({ songUris });

      // Get albums
      const { data: albumData } = await axios.get(`https://api.spotify.com/v1/artists/${id}/albums?`,
        {
          ...config,
          params: qs.stringify({
            limit: 25,
            country: 'US',
            include_groups: 'album'
          })
        });
      const albumUris = albumData.items.map(item => item.uri);
      this.setState({ albumUris });
    }

    selectAlbum = uri => console.log(`go to album with uri${uri}`);

    render() {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.name}>{this.state.name}</Text>
            <Image
              source={{ uri: this.state.artistImage }}
              style={styles.image}
            />
            <View style={styles.songsContainer}>
              {this.state.songUris.map(uri => (
                <Song
                  uri={uri}
                  key={uri}
                  playNow={() => {}}
                  playLater={() => {}}
                />
              ))}
            </View>
            <View style={styles.albumsContainer}>
              {this.state.albumUris.map(uri => (
                <Thumbnail
                  uri={uri}
                  key={uri}
                  onPress={() => this.selectAlbum(uri)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      );
    }
}

const styles = {
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 50,
    height: 500,
  },
  scrollContainer: {
    flexWrap: 'wrap'
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center'
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center'
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'orange',
    height: 200
  },
  songsContainer: {

  },
  albumsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  }
};

const mapStateToProps = ({ auth }) => ({ accessToken: auth.accessToken });

export default connect(mapStateToProps, null)(Artist);
