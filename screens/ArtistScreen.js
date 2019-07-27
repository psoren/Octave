import React, { Component } from 'react';
import {
  Text, View, Image, ScrollView
} from 'react-native';
import axios from 'axios';
import qs from 'qs';
import { connect } from 'react-redux';

import Song from '../components/Song';
import Thumbnail from '../components/Thumbnail';
import getSongData from '../functions/getSongData';

class ArtistScreen extends Component {
  state = { songs: [], albums: [] };

  componentDidMount = async () => {
    const { accessToken, navigation } = this.props;
    const id = navigation.getParam('id');

    // Get artist info
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    const { data: artistData } = await axios.get(`https://api.spotify.com/v1/artists/${id}`, config);
    this.setState({ name: artistData.name, artistImage: artistData.images[1].url });

    // Get top tracks
    const { data: songsData } = await axios.get(`https://api.spotify.com/v1/artists/${id}/top-tracks?`,
      { ...config, params: { country: 'US' } });
    const songs = songsData.tracks.map(item => getSongData(item));
    this.setState({ songs });

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
    const albums = albumData.items.map((item) => {
      const { name, id: albumId, type } = item;
      let imageSource = '../assets/default_album.png';
      let imageExists = false;
      if (item.images && item.images[0] && item.images[0].url) {
        imageExists = true;
        imageSource = item.images[0].url;
      }
      return {
        name, albumId, imageExists, imageSource, type
      };
    });
    this.setState({ albums });
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.name}>{this.state.name}</Text>
          <Image
            source={{ uri: this.state.artistImage }}
            style={styles.image}
          />
          <View>
            {this.state.songs.map(item => (
              <Song
                id={item.id}
                name={item.name}
                artists={item.artists}
                images={item.images}
                key={item.id}
              />
            ))}
          </View>
          <View style={styles.albumsContainer}>
            {this.state.albums.map(item => (
              <Thumbnail
                key={item.albumId}
                id={item.albumId}
                name={item.name}
                imageExists={item.imageExists}
                imageSource={item.imageSource}
                type={item.type}
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
  albumsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  }
};

const mapStateToProps = ({ auth }) => ({ accessToken: auth.accessToken });

export default connect(mapStateToProps, null)(ArtistScreen);
