import React, { Component } from 'react';
import { View, TextInput, SectionList } from 'react-native';
import { Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import qs from 'qs';

import Song from '../components/Song';

class SearchContentScreen extends Component {
    state = { search: '', uris: [] };

    componentDidMount = async () => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      this.setState({ accessToken });
    }

    performSearch = async (search) => {
      this.setState({ search }, async () => {
        // Perform Song Search
        const query = qs.stringify({
          q: this.state.search,
          type: 'track',
          limit: 10
        });
        const config = { headers: { Authorization: `Bearer ${this.state.accessToken}` } };
        const { data } = await axios.get(`https://api.spotify.com/v1/search?${query}`, config);

        console.log(data);

        const uris = data.tracks.items.map(item => ({
          uri: item.uri
        }));
        this.setState({ uris });

        // Perform Artist Search
        // Perform Playlist Search
      });
    }

renderSong = ({ item }) => <Song uri={item.uri} key={item.uri} />;

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
      </View>
      <View style={styles.list}>

        <SectionList
          sections={[
            { title: 'Songs', data: this.state.uris, renderItem: this.renderSong }
          ]}
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
  }
};

export default SearchContentScreen;
