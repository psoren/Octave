import Spotify from 'rn-spotify-sdk';
import * as firebase from 'firebase';
import 'firebase/firestore';

import { UPDATE_ROOM, LEAVE_ROOM } from './types';

export const updateRoom = data => ({ type: UPDATE_ROOM, payload: data });

export const leaveRoom = (navigation, roomID) => async (dispatch) => {
  // 1. Leave the room in firebase
  const db = firebase.firestore();
  const roomRef = db.collection('rooms').doc(roomID);
  db.collection('rooms').doc(roomID);

  try {
    const room = await roomRef.get();
    if (room.exists) {
      const roomData = room.data();
      const userInfo = await Spotify.getMe();
      // Creator
      if (roomData.roomCreatorID === userInfo.id) {
        // Delete room
        if (roomData.listeners.length === 0) {
          try {
            await db.collection('rooms').doc(room.id).delete();
          } catch (err) {
            console.error(`Could not delete room${err}`);
          }
        }
        // Promote oldest listener
      } else {
        // Listener
        console.log('listener case');
      }
    } else {
      console.error('Could not find room.');
    }
  } catch (err) {
    console.error(err);
  }

  // 2. Stop playback
  await Spotify.setPlaying(false);

  // 3. Reset redux state
  await dispatch({ type: LEAVE_ROOM });

  // 4. Navigate to the home screen
  await navigation.navigate('Home');
};
