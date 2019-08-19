import React from 'react';
import { View, Dimensions } from 'react-native';

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

const RoomCardLoading = () => (
  <View style={[styles.container, {
    width: 0.75 * deviceWidth,
    height: 0.6 * deviceHeight
  }]}
  />
);

const styles = {
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 15,
    shadowColor: '#000',
    backgroundColor: '#ccc',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  }
};

export default RoomCardLoading;
