import React, { Component } from 'react';
import {
  Text, View, Image, TouchableOpacity, ActivityIndicator, Dimensions
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-community/async-storage';

const { width: imageSize } = Dimensions.get('window');

class Thumbnail extends Component {
  state = {
    name: '',
    loading: true,
    image: '../assets/default_album.png'
  };

  componentDidMount = async () => {
    const infoArr = this.props.uri.split(':');
    const type = `${infoArr[1]}s`;
    const id = infoArr[2];
    const accessToken = await AsyncStorage.getItem('accessToken');

    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    const { data } = await axios.get(`https://api.spotify.com/v1/${type}/${id}`, config);

    let { name } = data;
    name = name.length > 20 ? `${name.slice(0, 20)}...` : name;

    if (data.images
      && data.images[0]
      && data.images[0].url) {
      this.setState({ imageExists: true, image: data.images[0].url });
    }

    this.setState({ name, loading: false });
  }

  render() {
    if (this.state.loading) {
      return (<ActivityIndicator size="large" color="#fff" />);
    }

    return (
      <TouchableOpacity onPress={this.props.onPress}>
        <View style={styles.container}>
          {
            this.state.imageExists
              ? (<Image source={{ uri: this.state.image }} style={styles.image} />)
              : (<Image source={require('../assets/default_album.png')} style={styles.image} />)
          }
          <Text style={styles.name}>{this.state.name}</Text>
        </View>
      </TouchableOpacity>
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

export default Thumbnail;
