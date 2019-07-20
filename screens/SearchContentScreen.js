import React, { Component } from 'react';
import { View, TextInput, SectionList } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
import qs from 'qs';
import { connect } from 'react-redux';
import * as actions from '../actions';

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
      const uris = data.tracks.items.map(item => item.uri);
      this.setState({ uris });


      // Perform Artist Search
      // Perform Playlist Search
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
            icon={(
              <Icon
                type="material"
                name="close"
              />
            )}
          />
        </View>
        <View style={styles.list}>
          <SectionList
            sections={[
              {
                id: 0,
                title: 'Songs',
                data: this.state.uris,
                renderItem: ({ item }) => (
                  <Song
                    uri={item}
                    key={item}
                    playNow={() => this.props.prependSongToQueue(item)}
                    playLater={() => this.props.appendSongToQueue(item)}
                  />
                )
              }
            ]}
            keyExtractor={item => item.uri}
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

export default connect(null, actions)(SearchContentScreen);
