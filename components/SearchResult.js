import React, { Component } from 'react';
import {
  Text, View, Image, TouchableOpacity
} from 'react-native';
import { Icon } from 'react-native-elements';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';

class SearchResult extends Component {
  state = {
    imageExists: false,
    image: '../assets/default_album.png'
  };

  componentDidMount = async () => {
    const infoArr = this.props.uri.split(':');
    const id = infoArr[2];
    const type = `${infoArr[1]}s`;
    const accessToken = await AsyncStorage.getItem('accessToken');
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    const { data } = await axios.get(`https://api.spotify.com/v1/${type}/${id}`, config);
    const contentType = type.charAt(0).toUpperCase()
      + type.slice(1, type.length - 1);

    if (data.images
      && data.images[0]
      && data.images[0].url) {
      this.setState({ imageExists: true, image: data.images[0].url });
    }
    this.setState({ contentType, name: data.name });
  }

  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress}>
        <View style={styles.container}>
          {
            this.state.imageExists
              ? (<Image source={{ uri: this.state.image }} style={styles.image} />)
              : (<Image source={require('../assets/default_album.png')} style={styles.image} />)
          }
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{this.state.name}</Text>
            <Text style={styles.type}>{this.state.contentType}</Text>
          </View>
          <Icon
            type="material"
            name="keyboard-arrow-right"
            size={30}
          />
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = {
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 5
  },
  image: {
    height: 50,
    width: 50,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
    position: 'absolute',
    left: 50,
    marginLeft: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  artists: {
    fontSize: 14
  },
  moreButton: {
    alignSelf: 'flex-end'
  },
};

export default SearchResult;
