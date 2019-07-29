import React from 'react';
import { View, Image, Dimensions } from 'react-native';
import { Badge, Icon } from 'react-native-elements';

const { width: screenWidth } = Dimensions.get('window');

const RoomCardImageContainer = props => (
  <View style={styles.imageContainer}>
    <View style={styles.iconViewLeft}>
      <Icon
        type="material"
        name="people"
        size={40}
        color="#fff"
      />
      <Badge
        value={props.numListeners}
        containerStyle={{ position: 'absolute', top: -5, right: -5 }}
      />
    </View>
    <Image
      source={{ url: props.currentSong.images[0].url }}
      style={styles.image}
    />
    <View style={styles.iconViewRight}>
      <Icon
        type="material"
        name="queue-music"
        size={40}
        color="#fff"
      />
      <Badge
        value={props.numSongs}
        containerStyle={{ position: 'absolute', top: -5, right: -5 }}
      />
    </View>
  </View>
);

const styles = {
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  image: {
    width: 0.45 * screenWidth,
    height: 0.45 * screenWidth,
    borderRadius: 10
  },
  iconViewLeft: {
    marginRight: 10
  },
  iconViewRight: {
    marginLeft: 10
  }
};

export default RoomCardImageContainer;
