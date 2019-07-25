import * as firebase from 'firebase';
import 'firebase/firestore';
import Spotify from 'rn-spotify-sdk';

import {
  CHANGE_PENDING_ROOM_NAME,
  APPEND_SONG_TO_CREATE_ROOM_QUEUE,
  PREPEND_SONG_TO_CREATE_ROOM_QUEUE,
  CREATE_ROOM,
  LEAVE_ROOM
} from './types';

export const leaveRoom = ({ navigation }) => async (dispatch) => {
  try {
    await Spotify.setPlaying(false);
    dispatch({
      type: LEAVE_ROOM,
      payload: {}
    });
    navigation.navigate('Home');
  } catch (err) {
    console.error(err);
  }
};

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
