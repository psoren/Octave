import React, { Component } from 'react';
import {
  Text, View, Image, TouchableOpacity, Dimensions
} from 'react-native';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import PropTypes from 'prop-types';

const { width: imageSize } = Dimensions.get('window');

class Thumbnail extends Component {
  navigate = () => {
    const { id, type } = this.props;
    switch (this.props.type) {
      case 'album':
        this.props.navigation.navigate('CreateRoomSearchAlbum', { id, type });
        break;
      case 'playlist':
        this.props.navigation.navigate('CreateRoomSearchAlbum', { id, type });
        break;
      default:
    }
  }

  render() {
    console.log(this.props);

    let { name } = this.props;
    name = name.length > 20 ? `${name.slice(0, 20)}...` : name;

    return (
      <TouchableOpacity onPress={this.navigate}>
        <View style={styles.container}>
          {
            (this.props.imageExists)
              ? (<Image source={{ uri: this.props.imageSource }} style={styles.image} />)
              : (<Image source={require('../assets/default_album.png')} style={styles.image} />)
          }
          <Text style={styles.name}>{name}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

Thumbnail.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  imageExists: PropTypes.bool.isRequired,
  imageSource: PropTypes.string.isRequired
};

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
