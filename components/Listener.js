import React from 'react';
import { Text, View, Image } from 'react-native';

const Listener = props => (
  <View style={styles.container}>
    <Image
      source={props.images.length > 0
        ? { uri: props.images[props.images.length - 1].url }
        : require('../assets/default_person.png')}
      style={styles.picture}
    />
    <View style={styles.nameContainer}>
      <Text style={styles.name}>{props.name}</Text>
    </View>
  </View>
);

const styles = {
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 5
  },
  picture: {
    height: 50,
    width: 50,
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'column',
    position: 'absolute',
    left: 50,
    marginLeft: 15,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold'
  }
};

export default Listener;
