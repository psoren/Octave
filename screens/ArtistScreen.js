import React, { Component } from 'react';
import {
  Text, View, Image, ScrollView
} from 'react-native';
import { Button } from 'react-native-elements';
import axios from 'axios';
import qs from 'qs';
import { connect } from 'react-redux';
import * as firebase from 'firebase';
import 'firebase/firestore';

import * as actions from '../actions';
import Song from '../components/Song';
import Thumbnail from '../components/Thumbnail';
import getSongData from '../functions/getSongData';
import spotifyCredentials from '../secrets';

class ArtistScreen extends Component {
  state = { songs: [], albums: [] };

  componentDidMount = async () => {
    const { accessToken, navigation } = this.props;
    const id = navigation.getParam('id');

    // Get artist info
    const config = { headers: { Authorization: `Bearer ${accessToken}` } };
    const { data: artistData } = await axios.get(`https://api.spotify.com/v1/artists/${id}`, config);
    this.setState({ name: artistData.name, artistImage: artistData.images[1].url });

    // Get top tracks
    const { data: songsData } = await axios.get(`https://api.spotify.com/v1/artists/${id}/top-tracks?`,
      { ...config, params: { country: 'US' } });
    const songs = songsData.tracks.map(item => getSongData(item));
    this.setState({ songs });

    // Get albums
    const { data: albumData } = await axios.get(`https://api.spotify.com/v1/artists/${id}/albums?`,
      {
        ...config,
        params: qs.stringify({
          limit: 25,
          country: 'US',
          include_groups: 'album'
        })
      });
    const albums = albumData.items.map((item) => {
      const { name, id: albumId, type } = item;
      let imageSource = '../assets/default_album.png';
      let imageExists = false;
      if (item.images && item.images[0] && item.images[0].url) {
        imageExists = true;
        imageSource = item.images[0].url;
      }
      return {
        name, albumId, imageExists, imageSource, type
      };
    });
    this.setState({ albums });
  }

  playTopSongs = async (shouldPrepend) => {
    if (this.props.currentRoom.id === '') {
      if (shouldPrepend) {
        this.props.prependSongsToPendingQueue(this.state.songs);
      } else {
        this.props.appendSongsToPendingQueue(this.state.songs);
      }
    } else {
      // Add to firebase
      const db = firebase.firestore();


      if (this.props.currentRoom.id == '') {
        console.log('empty artist screen 74');
      }

      const roomRef = db.collection('rooms').doc(this.props.currentRoom.id);
      try {
        const room = await roomRef.get();
        if (room.exists) {
          const uris = this.state.songs.map(song => `spotify:track:${song.id}`);

          const { playlistID, currentSongIndex } = room.data();

          const data = shouldPrepend ? {
            position: currentSongIndex + 2, uris
          } : { uris };

          const { playlistRefreshURL } = spotifyCredentials;
          const { data: refreshData } = await axios({
            url: playlistRefreshURL,
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          });
          const { access_token: playlistAccessToken } = refreshData;
          await axios({
            method: 'post',
            url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
            headers: { Authorization: `Bearer ${playlistAccessToken}` },
            data
          });
        } else {
          console.error('Could not find room');
        }
      } catch (err) {
        console.error(`(Song.js) We could not update the room.${err}`);
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <Text style={styles.name}>{this.state.name}</Text>
          <Image
            source={{ uri: this.state.artistImage }}
            style={styles.image}
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Play Next"
              onPress={() => this.playTopSongs(true)}
            />
            <Button
              title="Play Later"
              onPress={() => this.playTopSongs(false)}
            />
          </View>
          <View>
            {this.state.songs.map(item => (
              <Song
                key={item.id}
                id={item.id}
                name={item.name}
                artists={item.artists}
                images={item.images}
                popularity={item.popularity}
                duration_ms={item.duration_ms}
                preview_url={item.preview_url}
              />
            ))}
          </View>
          <View style={styles.albumsContainer}>
            {this.state.albums.map(item => (
              <Thumbnail
                key={item.albumId}
                id={item.albumId}
                name={item.name}
                imageExists={item.imageExists}
                imageSource={item.imageSource}
                type={item.type}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 50,
    height: 500,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15

  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center'
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center'
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'orange',
    height: 200
  },
  albumsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

const mapStateToProps = ({ auth, currentRoom, pendingRoom }) => ({
  accessToken: auth.accessToken,
  currentRoom,
  pendingRoom
});

export default connect(mapStateToProps, actions)(ArtistScreen);
