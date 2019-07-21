import React, { Component } from 'react';
import { Text, View, ScrollView } from 'react-native';
import axios from 'axios';
import qs from 'qs';
import { connect } from 'react-redux';

import Thumbnail from './Thumbnail';
import LibrarySongsThumbnail from './LibrarySongsThumbnail';

class LibraryPlaylists extends Component {
  state = { playlists: [] };

  componentDidMount = async () => {
    const { accessToken } = this.props;
    // Get user info
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    const { data: { id } } = await axios.get('https://api.spotify.com/v1/me/', config);
    // Get playlist total
    const { data: { total } } = await axios.get(`https://api.spotify.com/v1/users/${id}/playlists?`, config);
    const playlists = await this.getPlaylists(id, total, config);
    this.setState({ playlists });
  }

  getPlaylists = async (id, total, config) => {
    // Construct strings of requests
    const requests = [];
    const limit = 50;
    let offset = 0;
    while (offset <= total) {
      const request = `https://api.spotify.com/v1/users/${id}/playlists?${qs.stringify({ limit, offset })}`;
      requests.push(request);
      offset += limit;
    }

    const playlists = [];
    // // We now have strings of requests, we need to await each of them
    await Promise.all(requests.map(async (req) => {
      const { data: playlistData } = await axios.get(req, config);
      const playlist = playlistData.items.map(item => item.uri);
      playlists.push(...playlist);
    }));
    return playlists;
  }

  selectAlbum = uri => console.log(`go to playlist with uri${uri}`);

  goToLibrary = () => console.log('go to library');

  render() {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>Your Playlists</Text>
          <View style={styles.playlistsContainer}>
            <LibrarySongsThumbnail onPress={this.goToLibrary} />
            {this.state.playlists.map(uri => (
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center'
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'orange',
    height: 200
  },
  playlistsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  }
};

const mapStateToProps = ({ auth }) => ({ accessToken: auth.accessToken });

export default connect(mapStateToProps, null)(LibraryPlaylists);
