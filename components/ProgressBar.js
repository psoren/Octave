import React, { Component } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Easing
} from 'react-native';
import PropTypes from 'prop-types';

class ProgressBar extends Component {
    static defaultProps = {
      height: 10,
      width: 100,
      startColor: '#00c9ff',
      endColor: '#92fe9d',
      duration: 100
    };

    state = { animation: new Animated.Value(0) };

    componentDidMount() {
      Animated.timing(this.state.animation, {
        toValue: this.props.progress,
        duration: 500,
        easing: Easing.linear
      }).start();
    }

    componentDidUpdate = () => {
      Animated.timing(this.state.animation, {
        toValue: this.props.progress,
        duration: this.props.duration,
        easing: Easing.linear
      }).start();
    }

    render() {
      const progressInterpolate = this.state.animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp'
      });

      const colorInterpolate = this.state.animation.interpolate({
        inputRange: [0, 1],
        outputRange: [this.props.startColor, this.props.endColor]
      });

      const progressStyle = {
        width: progressInterpolate,
        bottom: 0,
        backgroundColor: colorInterpolate,
      };

      return (
        <View style={[styles.container, {
          height: this.props.height,
          width: this.props.width
        }]}
        >
          <View style={StyleSheet.absoluteFill}>
            <Animated.View style={[styles.progress, progressStyle]}></Animated.View>
          </View>
        </View>
      );
    }
}

ProgressBar.propTypes = {
  height: PropTypes.number,
  width: PropTypes.number,
  startColor: PropTypes.string,
  endColor: PropTypes.string,
  duration: PropTypes.number
};

const styles = {
  container: {
    height: 10,
    width: 100,
    backgroundColor: 'transparent',
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 60,
    paddingVertical: 10,
    overflow: 'hidden'
  },
  progress: {
    position: 'absolute',
    left: 0,
    top: 0
  }
};

export default ProgressBar;
