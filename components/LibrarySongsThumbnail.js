import React from 'react';
import {
  Text, View, Image, TouchableOpacity, Dimensions
} from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

const { width: imageSize } = Dimensions.get('window');

const navigate = (props) => {
  if (props.currentRoom.id === '') {
    props.navigation.navigate('CreateRoomLibrarySongs');
  } else {
    props.navigation.navigate('LibrarySongsRoom');
  }
};

const LibrarySongsThumbnail = props => (
  <TouchableOpacity onPress={() => navigate(props)}>
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

const mapStateToProps = ({ currentRoom }) => ({ currentRoom });

export default connect(mapStateToProps, null)(withNavigation(LibrarySongsThumbnail));
