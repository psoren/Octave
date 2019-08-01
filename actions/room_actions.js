import Spotify from 'rn-spotify-sdk';
import * as firebase from 'firebase';
import 'firebase/firestore';

import {
  UPDATE_ROOM,
  JOIN_ROOM,
  LEAVE_ROOM
} from './types';

export const updateRoom = data => ({ type: UPDATE_ROOM, payload: data });

export const leaveRoom = (navigation, roomID) => async (dispatch) => {
  // 1. Leave the room in firebase
  const db = firebase.firestore();

  // all of the test room IDs are short numbers, so just
  // check that their length as a string is less that 4 digits
  const roomIDStr = roomID.toString();
  const collection = roomIDStr.length < 4 ? 'testRooms' : 'rooms';

  const roomRef = db.collection(collection).doc(roomID);
  try {
    const room = await roomRef.get();
    if (room.exists) {
      const roomData = room.data();
      const userInfo = await Spotify.getMe();
      // Creator
      if (roomData.creator.id === userInfo.id) {
        // Delete room
        if (roomData.listeners.length === 0) {
          try {
            await db.collection(collection).doc(room.id).delete();
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
    console.error(`room_actions${err}`);
  }

  // 2. Stop playback
  await Spotify.setPlaying(false);

  // 3. Reset redux state
  await dispatch({ type: LEAVE_ROOM });

  // 4. Navigate to the home screen
  await navigation.navigate('Home');
};

export const joinRoom = (navigation, roomID) => async (dispatch) => {
  // 1. Get data from Spotify
  const { id, display_name: name, images } = await Spotify.getMe();
  const newListener = { id, name, images };

  // 2. Join the room in firebase
  const db = firebase.firestore();
  const roomRef = db.collection('rooms').doc(roomID);

  try {
    const room = await roomRef.get();
    if (room.exists) {
      roomRef.update({
        listeners: firebase.firestore.FieldValue.arrayUnion(newListener)
      });

      // 3. Set redux state
      await dispatch({ type: JOIN_ROOM, payload: roomID });

      // 4. Navigate to NowPlayingScreen
      // We have to pass the test parameter so that
      // The now playing screen knows to check which database
      await navigation.navigate('NowPlaying');
    } else {
      console.error('Could not find room.');
    }
  } catch (err) {
    console.error(`room_actions${err}`);
  }
};
