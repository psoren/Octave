import React, { Component } from 'react';
import {
  Text, View, Alert, Image
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import Spotify from 'rn-spotify-sdk';
import { connect } from 'react-redux';
import * as actions from '../actions';

import MinimizedRoom from '../components/MinimizedRoom';

class SettingsScreen extends Component {
    static navigationOptions = () => ({
      title: 'Me',
      tabBarIcon: ({ tintColor }) => (
        <Icon
          type="material"
          name="person"
          size={30}
          color={tintColor}
        />
      )
    });

    state={ displayName: '', images: [] };

    logout = () => {
      Alert.alert('Are you sure you want to log out?', '',
        [{ text: 'Cancel', style: 'cancel' }, {
          text: 'OK',
          onPress: async () => {
            await Spotify.logout();
            this.props.navigation.navigate('Login');
          },
        }]);
    }

    componentDidMount= async () => {
      const userInfo = await Spotify.getMe();
      const { images, display_name: name } = userInfo;
      const displayName = name || '';
      this.setState({ images, displayName });
    }

    render() {
      let NowPlaying = null;
      if (this.props.currentRoom.id !== '') {
        const { songs, currentSongIndex, name: roomName } = this.props.currentRoom;
        NowPlaying = (
          <MinimizedRoom
            songs={songs}
            currentSongIndex={currentSongIndex}
            roomName={roomName}
            goToRoom={() => this.props.navigation.navigate('NowPlaying')}
          />
        );
      }

      return (
        <View style={styles.container}>
          <View style={styles.userCard}>
            <Text style={styles.name}>
              Logged in as
              {'\n'}
              {this.state.displayName}
            </Text>
            <Image
              source={this.state.images.length > 0
                ? { uri: this.state.images[0].url }
                : require('../assets/default_album.png')}
              style={styles.image}
            />
          </View>
          <Button
            containerStyle={styles.logoutContainerButton}
            buttonStyle={styles.logoutButton}
            titleStyle={{ fontWeight: 'bold', fontSize: 24 }}
            title="LOG OUT"
            onPress={this.logout}
          />
          <View style={styles.nowPlaying}>
            {NowPlaying}
          </View>
        </View>
      );
    }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  userCard: {
    width: 300,
    height: 300,
    borderColor: '#444',
    borderRadius: 50,
    borderWidth: 1,
    margin: 25,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 25
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  logoutContainerButton: {
    flex: 1,
    margin: 20,
    width: 200,
    height: 100
  },
  logoutButton: {
    borderRadius: 100,
    backgroundColor: '#ed2939'
  },
  button: {
    margin: 15
  },
  nowPlaying: {
    position: 'absolute',
    bottom: 0,
    left: 0
  }
};

const mapStateToProps = ({ currentRoom }) => ({ currentRoom });


export default connect(mapStateToProps, actions)(SettingsScreen);
