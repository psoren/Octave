import React, { Component } from 'react';
import {
  Text, View, Image, TouchableHighlight, ActivityIndicator, Dimensions
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';

const { width: imageSize } = Dimensions.get('window');

class AlbumThumbnail extends Component {
  state= { name: '', albumArt: '', loading: true };

  componentDidMount = async () => {
    const infoArr = this.props.uri.split(':');
    const id = infoArr[2];
    const accessToken = await AsyncStorage.getItem('accessToken');

    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    const { data } = await axios.get(`https://api.spotify.com/v1/albums/${id}`, config);

    let { name } = data;
    name = name.length > 20 ? `${name.slice(0, 20)}...` : name;

    const albumArt = data.images[1].url;
    this.setState({ name, albumArt, loading: false });
  }

  render() {
    if (this.state.loading) {
      return (<ActivityIndicator size="large" color="#fff" />);
    }

    return (
      <TouchableHighlight onPress={this.props.onPress}>
        <View style={styles.container}>
          <Image
            source={{ uri: this.state.albumArt }}
            style={styles.image}
          />
          <Text style={styles.name}>{this.state.name}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}

const styles = {
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20
  },
  name: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  image: {
    width: imageSize / 3,
    height: imageSize / 3
  }
};

export default AlbumThumbnail;
