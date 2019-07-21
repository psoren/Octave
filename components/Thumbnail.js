import React, { Component } from 'react';
import {
  Text, View, Image, TouchableOpacity, Dimensions
} from 'react-native';
import axios from 'axios';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';

const { width: imageSize } = Dimensions.get('window');

class Thumbnail extends Component {
  state = { name: '', loading: true, };

  componentDidMount = async () => {
    const infoArr = this.props.uri.split(':');
    const type = `${infoArr[1]}s`;
    const id = infoArr[2];
    const { accessToken } = this.props;

    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    const { data } = await axios.get(`https://api.spotify.com/v1/${type}/${id}`, config);

    let { name } = data;
    name = name.length > 20 ? `${name.slice(0, 20)}...` : name;

    if (data.images
      && data.images[0]
      && data.images[0].url) {
      this.setState({ imageExists: true, image: data.images[0].url });
    }
    this.setState({ name, loading: false, type });
  }

  navigate = () => {
    switch (this.state.type) {
      case 'albums':
        this.props.navigation.navigate('CreateRoomSearchAlbum',
          { uri: this.props.uri });
        break;
      case 'playlists':
        this.props.navigation.navigate('CreateRoomSearchAlbum',
          { uri: this.props.uri });
        break;
      default:
    }
  }

  render() {
    return (
      <TouchableOpacity onPress={this.navigate}>
        <View style={styles.container}>
          {
            (!this.state.imageExists || this.state.loading)
              ? (<Image source={require('../assets/default_album.png')} style={styles.image} />)
              : (<Image source={{ uri: this.state.image }} style={styles.image} />)
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

const mapStateToProps = ({ auth }) => ({ accessToken: auth.accessToken });

export default connect(mapStateToProps, null)(withNavigation(Thumbnail));
