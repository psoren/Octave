import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import axios from 'axios';
import qs from 'qs';
import { connect } from 'react-redux';

import Song from '../components/Song';
import getSongData from '../functions/getSongData';

class LibrarySongsScreen extends Component {
  state = { songs: [], limit: 50 };

  componentDidMount = async () => {
    const { accessToken } = this.props;
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    this.setState({ config });
    const params = qs.stringify({ limit: this.state.limit });
    const { data } = await axios.get(`https://api.spotify.com/v1/me/tracks?${params}`, config);
    const songs = data.items.map(item => getSongData(item.track));
    this.setState({ songs, next: data.next });
  }

  onEndReached = async () => {
    const { data } = await axios.get(this.state.next, this.state.config);
    const newSongs = data.items.map(item => getSongData(item));
    const currentSongs = this.state.songs;
    this.setState({ songs: [...currentSongs, ...newSongs], next: data.next });
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          onPress={() => console.log('close current songs')}
          style={styles.button}
          type="clear"
          icon={(
            <Icon
              type="material"
              name="close"
              size={30}
              color="#555"
            />
          )}
        />
        <FlatList
          data={this.state.songs}
          keyExtractor={item => item.id}
          onEndReachedThreshold={0.5}
          onEndReached={this.onEndReached}
          extraData={this.state}
          renderItem={({ item }) => (
            <Song
              id={item.id}
              name={item.name}
              artists={item.artists}
              imageExists={item.imageExists}
              albumArt={item.albumArt}
            />
          )}
        />
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  button: {
    marginTop: 25,
    alignSelf: 'flex-start'
  }
};

const mapStateToProps = ({ auth }) => ({ accessToken: auth.accessToken });

export default connect(mapStateToProps, null)(LibrarySongsScreen);
