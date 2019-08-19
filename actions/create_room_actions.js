/* eslint-disable no-await-in-loop */
import * as firebase from 'firebase';
import 'firebase/firestore';
import * as geofirex from 'geofirex';
import Geocoder from 'react-native-geocoder';
import Spotify from 'rn-spotify-sdk';
import axios from 'axios';
import spotifyCredentials from '../secrets';

import {
  CHANGE_PENDING_ROOM_NAME,
  APPEND_SONGS_TO_CREATE_ROOM_QUEUE,
  PREPEND_SONGS_TO_CREATE_ROOM_QUEUE,
  CLEAR_PENDING_QUEUE,
  CREATE_ROOM,
} from './types';

export const changePendingRoomName = roomName => ({
  type: CHANGE_PENDING_ROOM_NAME,
  payload: roomName
});

export const clearPendingQueue = () => ({
  type: CLEAR_PENDING_QUEUE
});

export const appendSongsToPendingQueue = songs => ({
  type: APPEND_SONGS_TO_CREATE_ROOM_QUEUE,
  payload: songs
});

export const prependSongsToPendingQueue = songs => ({
  type: PREPEND_SONGS_TO_CREATE_ROOM_QUEUE,
  payload: songs
});

export const createRoom = ({
  songs,
  roomName,
  creator,
  navigation,
  colors,
  location
}) => async (dispatch) => {
  try {
    const db = firebase.firestore();
    const geo = geofirex.init(firebase);
    const { latitude, longitude } = location.coords;
    const point = geo.point(latitude, longitude);

    // Do the reverse geocding and store the address here since
    // that information will never change
    let address = '';
    if (location) {
      const {
        latitude: lat,
        longitude: lng
      } = location.coords;

      // Position Geocoding
      const config = { lat, lng };

      try {
        // Do reverse geocoding here
        const res = await Geocoder.geocodePosition(config);
        const { locality, adminArea, countryCode } = res[0];
        address = `${locality} ${adminArea} ${countryCode}`;
      } catch (err) {
        address = 'Somewhere far away';
      }
    }

    // Create playlist
    // 1. Get a new access token from testing account
    try {
      const { playlistRefreshURL } = spotifyCredentials;
      const { data: refreshData } = await axios({
        url: playlistRefreshURL,
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const { access_token: playlistAccessToken } = refreshData;

      // 2. Get user id
      const { id } = await Spotify.getMe();

      // 3. Create the specified playlist using that access token
      const name = `Secret Octave playlist for user ${id}`;
      const { data } = await axios({
        method: 'POST',
        url: 'https://api.spotify.com/v1/users/prbevbro7l3sq74lpm9q2tfxt/playlists',
        headers: {
          Authorization: `Bearer ${playlistAccessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name,
          collaborative: true,
          public: false
        }
      });
      const { id: playlistID } = data;

      console.log(`playlist ${playlistID} created`);

      // 1. Create an array of promises where we add
      // the songs in the song list to the user's library
      const songURIs = songs.map(song => `spotify:track:${song.id}`);

      // // Split them so we can every 50 in the correct order
      const splitSongURIs = [];
      for (let i = 0; i < songURIs.length; i += 50) {
        splitSongURIs.push(songURIs.slice(i, i + 50));
      }
      const songsToAdd = splitSongURIs.map(uris => ({
        method: 'POST',
        url: `https://api.spotify.com/v1/playlists/${playlistID}/tracks`,
        headers: {
          Authorization: `Bearer ${playlistAccessToken}`,
          'Content-Type': 'application/json'
        },
        data: { uris }
      }));

      // // 2. Add them to the library
      songsToAdd.reduce((promiseChain, currentTask) => promiseChain.then(async chainResults =>
        // eslint-disable-next-line implicit-arrow-linebreak
        axios(currentTask).then(currentResult =>
          // eslint-disable-next-line implicit-arrow-linebreak
          [...chainResults, currentResult])),
      // eslint-disable-next-line no-unused-vars
      Promise.resolve([])).then(async (arrayOfResults) => {
        // Create room

        console.log('songs have been added');

        const { id: newRoomID } = await db.collection('rooms').add({
          name: roomName,
          creator,
          currentSongIndex: 0,
          playing: true,
          listeners: [],
          currentPosition: 0,
          colors,
          position: point.data,
          address,
          playlistID
        });

        // Update status collection in firestore
        const { uri } = await Spotify.getMe();

        db.collection('status').doc(uri).set({
          roomID: newRoomID,
          state: 'online',
          last_changed: new Date()
        });

        // Create currentSongIndex in currentSong collection
        await db.collection('currentSong').doc(playlistID).set({
          playlistID, currentSongIndex: 0
        });

        dispatch({
          type: CREATE_ROOM,
          payload: { newRoomID }
        });

        navigation.navigate('NowPlaying', { test: false });
      });
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.error(err);
  }
};
