import React, { Component } from 'react';
import {
  Text, View, Image, TouchableOpacity
} from 'react-native';
import { Icon } from 'react-native-elements';
import { withNavigation } from 'react-navigation';

class SearchResult extends Component {
  navigate = () => {
    const { id, type } = this.props;
    switch (this.props.type) {
      case 'artist':
        this.props.navigation.navigate('CreateRoomSearchArtist', { id, type });
        break;
      case 'playlist':
        this.props.navigation.navigate('CreateRoomSearchPlaylist', { id, type });
        break;
      default:
        console.error('type was not as expected, type should be either artist or playlist');
    }
  }

  render() {
    const { type } = this.props;
    const contentType = type.charAt(0).toUpperCase() + type.slice(1);

    return (
      <TouchableOpacity onPress={this.navigate}>
        <View style={styles.container}>
          <Image
            source={this.props.imageExists
              ? { uri: this.props.albumArt }
              : require('../assets/default_album.png')}
            style={styles.image}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{this.props.name}</Text>
            <Text style={styles.type}>{contentType}</Text>
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
  }
};

export default withNavigation(SearchResult);
