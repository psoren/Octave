import React from 'react';
import { View, Dimensions } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PropTypes from 'prop-types';

const { width } = Dimensions.get('window');

const ControlsContainer = props => (
  <View style={styles.controlsContainer}>
    <Button
      onPress={() => props.changeSong(-1)}
      type="clear"
      icon={(<Icon type="material" size={60} name="skip-previous" />)}
    />
    <Button
      onPress={props.togglePlay}
      type="clear"
      icon={(
        <Icon
          type="material"
          size={60}
          name={props.playing
            ? 'pause-circle-outline'
            : 'play-circle-outline'}
        />
    )}
    />
    <Button
      onPress={() => props.changeSong(1)}
      type="clear"
      icon={(<Icon type="material" size={60} name="skip-next" />)}
    />
  </View>
);

ControlsContainer.propTypes = {
  togglePlay: PropTypes.func.isRequired,
  changeSong: PropTypes.func.isRequired,
  playing: PropTypes.bool.isRequired
};

const styles = {
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
    width
  }
};

export default ControlsContainer;
