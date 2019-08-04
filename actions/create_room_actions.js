import * as firebase from 'firebase';
import 'firebase/firestore';
import * as geofirex from 'geofirex';

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

    const { id: newRoomID } = await db.collection('rooms').add({
      songs,
      name: roomName,
      creator,
      currentSongIndex: 0,
      playing: true,
      listeners: [],
      currentPosition: 0,
      colors,
      position: point.data
    });
    dispatch({
      type: CREATE_ROOM,
      payload: { newRoomID }
    });
    navigation.navigate('NowPlaying', { test: false });
  } catch (err) {
    console.error(err);
  }
};
