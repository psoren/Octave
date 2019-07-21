import React from 'react';
import {
  Text, View, Image, TouchableOpacity, Dimensions
} from 'react-native';
import { withNavigation } from 'react-navigation';

const { width: imageSize } = Dimensions.get('window');

const LibrarySongsThumbnail = props => (
  <TouchableOpacity onPress={() => props.navigation.navigate('CreateRoomLibrarySongs')}>
    <View style={styles.container}>
      <Image source={require('../assets/spotify_icon.png')} style={styles.image} />
      <Text style={styles.name}>Your Songs</Text>
    </View>
  </TouchableOpacity>
);

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

export default withNavigation(LibrarySongsThumbnail);
