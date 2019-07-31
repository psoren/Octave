import React, { Component } from 'react';
import {
  Text, View, TextInput, SectionList
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import axios from 'axios';
import qs from 'qs';
import { connect } from 'react-redux';
import * as actions from '../actions';

import Song from './Song';
import SearchResult from './SearchResult';
import getSongData from '../functions/getSongData';
import getSearchResultData from '../functions/getSearchResultData';

class SearchContent extends Component {
  state = {
    search: '',
    songs: [],
    artists: [],
    playlists: []
  };

  performSearch = async (search) => {
    const { accessToken } = this.props;

    this.setState({ search }, async () => {
      // Search songs
      const ROOT_URL = 'https://api.spotify.com/v1/search?';
      const query = { q: this.state.search, type: 'track', limit: 3 };
      const config = { headers: { Authorization: `Bearer ${accessToken}` } };
      const { data: songsData } = await axios.get(`${ROOT_URL}${qs.stringify({ ...query })}`, config);
      const songs = songsData.tracks.items.map(item => getSongData(item, null));
      this.setState({ songs });

      // Search Artists
      const { data: artistData } = await axios.get(`${ROOT_URL}${qs.stringify({
        ...query, type: 'artist'
      })}`, config);
      const artists = artistData.artists.items.map(item => getSearchResultData(item));
      this.setState({ artists });

      // Search Playlists
      const { data: playlistData } = await axios.get(`${ROOT_URL}${qs.stringify({
        ...query, type: 'playlist'
      })}`, config);
      const playlists = playlistData.playlists.items.map(item => getSearchResultData(item));
      this.setState({ playlists });
    });
  }

  clearSearch = () => this.setState({
    search: '',
    songs: [],
    artists: [],
    playlists: []
  });

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Icon
            type="material"
            name="search"
            size={30}
            color="#222"
          />
          <TextInput
            style={styles.input}
            placeholder="Search..."
            onChangeText={search => this.performSearch(search)}
            value={this.state.search}
          />
          <Button
            type="clear"
            onPress={() => this.clearSearch()}
            icon={(
              <Icon
                type="material"
                name="close"
                size={30}
                color="#222"
              />
            )}
          />
        </View>
        <View style={styles.list}>
          {this.state.search !== ''
            ? (
              <SectionList
                renderSectionHeader={({ section: { title } }) => (
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>{title}</Text>
                  </View>
                )}
                keyExtractor={item => item.id}
                sections={[
                  {
                    id: 0,
                    title: 'Songs',
                    data: this.state.songs,
                    renderItem: ({ item }) => (
                      <Song
                        id={item.id}
                        name={item.name}
                        artists={item.artists}
                        images={item.images}
                        popularity={item.popularity}
                        duration_ms={item.duration_ms}
                        preview_url={item.preview_url}
                      />
                    )
                  }, {
                    id: 1,
                    title: 'Artists',
                    data: this.state.artists,
                    renderItem: ({ item }) => (
                      <SearchResult
                        id={item.id}
                        name={item.name}
                        type={item.type}
                        imageExists={item.imageExists}
                        albumArt={item.albumArt}
                      />
                    )
                  }, {
                    id: 2,
                    title: 'Playlists',
                    data: this.state.playlists,
                    renderItem: ({ item }) => (
                      <SearchResult
                        id={item.id}
                        name={item.name}
                        type={item.type}
                        imageExists={item.imageExists}
                        albumArt={item.albumArt}
                      />
                    )
                  }
                ]}
              />
            ) : <Text style={styles.search}>Search for songs, artists, and playlists</Text>}

        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchContainer: {
    width: 400,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  input: {
    marginLeft: 10,
    fontSize: 24,
    width: 300
  },
  list: {
    flex: 1,
    flexDirection: 'row'
  },
  sectionHeader: {
    height: 50,
    backgroundColor: 'rgba(0,201,255, 0.5)',
    justifyContent: 'center'
  },
  sectionHeaderText: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff'
  },
  search: {
    marginTop: 100,
    fontSize: 36,
    fontWeight: 'bold',
    marginRight: 25,
    marginLeft: 25
  }
};

const mapStateToProps = ({ auth }) => ({ accessToken: auth.accessToken });

export default connect(mapStateToProps, actions)(SearchContent);
