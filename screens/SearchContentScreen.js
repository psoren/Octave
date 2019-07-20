import React, { Component } from 'react';
import {
  Text, View, TextInput, SectionList
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import qs from 'qs';
import { connect } from 'react-redux';
import * as actions from '../actions';

import Song from '../components/Song';
import SearchResult from '../components/SearchResult';

class SearchContentScreen extends Component {
  state = {
    search: '',
    songs: [],
    artists: [],
    playlists: []
  };

  componentDidMount = async () => {
    const accessToken = await AsyncStorage.getItem('accessToken');
    this.setState({ accessToken });
  }

  performSearch = async (search) => {
    this.setState({ search }, async () => {
      // Search songs
      const query = {
        q: this.state.search,
        type: 'track',
        limit: 3
      };
      const config = { headers: { Authorization: `Bearer ${this.state.accessToken}` } };
      const { data: songData } = await axios.get(`https://api.spotify.com/v1/search?${qs.stringify({ ...query })}`, config);
      const songs = songData.tracks.items.map(item => item.uri);
      this.setState({ songs });

      // Search Artists
      const { data: artistData } = await axios.get(`https://api.spotify.com/v1/search?${qs.stringify({
        ...query, type: 'artist'
      })}`, config);
      const artists = artistData.artists.items.map(item => item.uri);
      this.setState({ artists });

      // Search Playlists
      const { data: playlistData } = await axios.get(`https://api.spotify.com/v1/search?${qs.stringify({
        ...query, type: 'playlist'
      })}`, config);
      const playlists = playlistData.playlists.items.map(item => item.uri);
      this.setState({ playlists });
    });
  }

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
            onPress={() => this.props.navigation.navigate('CreateRoom')}
            icon={(<Icon type="material" name="close" />)}
          />
        </View>
        <View style={styles.list}>
          <SectionList
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionHeader}>{title}</Text>
            )}
            sections={[
              {
                id: 0,
                title: 'Songs',
                data: this.state.songs,
                renderItem: ({ item }) => (
                  <Song
                    uri={item}
                    key={item}
                    playNow={() => this.props.prependSongToQueue(item)}
                    playLater={() => this.props.appendSongToQueue(item)}
                  />
                )
              }, {
                id: 1,
                title: 'Artists',
                data: this.state.artists,
                renderItem: ({ item }) => (
                  <SearchResult
                    uri={item}
                    key={item}
                  />
                )
              }, {
                id: 2,
                title: 'Playlists',
                data: this.state.playlists,
                renderItem: ({ item }) => (
                  <SearchResult
                    uri={item}
                    key={item}
                  />
                )
              }
            ]}
            keyExtractor={item => item}
          />
        </View>
      </View>
    );
  }
}

const styles = {
  container: {
    marginTop: 50,
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchContainer: {
    width: 400,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  input: {
    marginLeft: 25,
    fontSize: 24,
    width: 300
  },
  list: {
    flex: 1,
    flexDirection: 'row'
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#555'
  }
};

export default connect(null, actions)(SearchContentScreen);
