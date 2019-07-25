import React from 'react';
import { View, Dimensions } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import PropTypes from 'prop-types';

const { width } = Dimensions.get('window');

const ControlsContainer = props => (
  <View style={styles.controlsContainer}>
    <Button
      onPress={props.previous}
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
      onPress={props.next}
      type="clear"
      icon={(<Icon type="material" size={60} name="skip-next" />)}
    />
  </View>
);

ControlsContainer.propTypes = {
  previous: PropTypes.func.isRequired,
  togglePlay: PropTypes.func.isRequired,
  next: PropTypes.func.isRequired,
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
