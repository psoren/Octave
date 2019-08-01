import * as firebase from 'firebase';
import 'firebase/firestore';

import {
  CHANGE_PENDING_ROOM_NAME,
  APPEND_SONG_TO_CREATE_ROOM_QUEUE,
  PREPEND_SONG_TO_CREATE_ROOM_QUEUE,
  CREATE_ROOM,
} from './types';

export const changePendingRoomName = roomName => ({
  type: CHANGE_PENDING_ROOM_NAME,
  payload: roomName
});
export const prependSongToPendingQueue = song => ({
  type: PREPEND_SONG_TO_CREATE_ROOM_QUEUE,
  payload: song
});

export const appendSongToPendingQueue = song => ({
  type: APPEND_SONG_TO_CREATE_ROOM_QUEUE,
  payload: song
});

export const createRoom = ({
  songs,
  roomName,
  creator,
  navigation
}) => async (dispatch) => {
  try {
    const db = firebase.firestore();
    const { id: newRoomID } = await db.collection('rooms').add({
      songs,
      name: roomName,
      creator,
      currentSongIndex: 0,
      playing: true,
      listeners: [],
      currentPosition: 0
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
