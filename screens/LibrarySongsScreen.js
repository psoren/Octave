import React, { PureComponent } from 'react';
import { Text, View, FlatList } from 'react-native';
import axios from 'axios';
import qs from 'qs';
import { connect } from 'react-redux';

import Song from '../components/Song';
import getSongData from '../functions/getSongData';

class LibrarySongsScreen extends PureComponent {
  state = { songs: [], limit: 50 };

  componentDidMount = async () => {
    const { accessToken } = this.props;
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    this.setState({ config });
    const params = qs.stringify({ limit: this.state.limit });
    const { data } = await axios.get(`https://api.spotify.com/v1/me/tracks?${params}`, config);
    const songs = data.items.map(item => getSongData(item, { type: 'playlist' }));
    if (!Object.prototype.hasOwnProperty.call(data, 'next')) {
      this.setState({ songs, next: null });
    } else {
      this.setState({ songs, next: data.next });
    }
  }

  onEndReached = async () => {
    if (this.state.next) {
      const { data } = await axios.get(this.state.next, this.state.config);
      if (data.next !== this.state.next) {
        const newSongs = data.items.map(item => getSongData(item, { type: 'playlist' }));
        this.setState(prevState => ({ songs: [...prevState.songs, ...newSongs], next: data.next }));
      }
    }
  }

  render() {
    return (
      <View
        style={styles.container}
        contentContainerStyle={{ flex: 1 }}
      >
        <Text style={styles.title}>Your Songs</Text>
        <FlatList
          data={this.state.songs}
          keyExtractor={item => item.id}
          onEndReachedThreshold={0.3}
          onEndReached={() => this.onEndReached()}
          renderItem={({ item }) => (
            <Song
              id={item.id}
              name={item.name}
              artists={item.artists}
              images={item.images}
              popularity={item.popularity}
              duration_ms={item.duration_ms}
              preview_url={item.preview_url}
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
  title: {
    alignSelf: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    margin: 15
  }
};

const mapStateToProps = ({ auth }) => ({ accessToken: auth.accessToken });

export default connect(mapStateToProps, null)(LibrarySongsScreen);
