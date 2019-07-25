import * as firebase from 'firebase';
import 'firebase/firestore';

import {
  CHANGE_PENDING_ROOM_NAME,
  APPEND_SONG_TO_CREATE_ROOM_QUEUE,
  PREPEND_SONG_TO_CREATE_ROOM_QUEUE,
  CREATE_ROOM
} from './types';

export const changeRoomName = roomName => ({
  type: CHANGE_PENDING_ROOM_NAME,
  payload: roomName
});
export const prependSongToQueue = song => ({
  type: PREPEND_SONG_TO_CREATE_ROOM_QUEUE,
  payload: song
});

export const appendSongToQueue = song => ({
  type: APPEND_SONG_TO_CREATE_ROOM_QUEUE,
  payload: song
});

export const createRoom = ({
  songs,
  roomName,
  roomCreatorID,
  navigation
}) => async (dispatch) => {
  try {
    const db = firebase.firestore();
    const { id: newRoomId } = await db.collection('rooms').add({
      songs, roomName, roomCreatorID
    });
    dispatch({
      type: CREATE_ROOM,
      payload: newRoomId
    });
    navigation.navigate('NowPlaying');
  } catch (err) {
    console.error(err);
  }
};
