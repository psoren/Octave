import Spotify from 'rn-spotify-sdk';
import * as firebase from 'firebase';
import 'firebase/firestore';

import {
  UPDATE_ROOM,
  JOIN_ROOM,
  LEAVE_ROOM
} from './types';

export const updateRoom = data => ({ type: UPDATE_ROOM, payload: data });

export const leaveRoom = (navigation, roomID, joiningNewRoom) => async (dispatch) => {
  // 1. Leave the room in firebase
  const db = firebase.firestore();
  const roomRef = db.collection('rooms').doc(roomID);
  try {
    const room = await roomRef.get();
    if (room.exists) {
      const { id: userID } = await Spotify.getMe();
      // Creator
      if (room.data().creator.id === userID) {
        // Delete room
        if (room.data().listeners.length === 0) {
          try {
            await db.collection('currentSong').doc(room.data().playlistID).delete();
            const {
              playlistID, creator, name, position, currentSongIndex
            } = room.data();
            db.collection('pastRooms').doc(playlistID).set({
              playlistID,
              name,
              creator,
              position,
              currentSongIndex
            }, { merge: true });
            await db.collection('rooms').doc(room.id).delete();
          } catch (err) {
            console.error(`Could not delete room: ${err}`);
          }
        } else {
          // Promote oldest listener and update the
          // currentSong document with the new creator id
          const { listeners, creator } = room.data();
          const newCreator = listeners.shift();
          const pastRoomRef = db.collection('pastRooms').doc(room.data().playlistID);
          pastRoomRef.set({
            listeners: firebase.firestore.FieldValue.arrayUnion(creator)
          }, { merge: true });
          await db.collection('currentSong').doc(room.data().playlistID).update({
            creatorID: newCreator.id
          });
          roomRef.update({ creator: newCreator, listeners });
        }
      } else {
        // Delete them from the room
        const { listeners } = room.data();
        const oldListenersArr = listeners.filter(listener => userID === listener.id);
        const oldListener = oldListenersArr[0];
        const pastRoomRef = db.collection('pastRooms').doc(room.data().playlistID);
        pastRoomRef.set({
          listeners: firebase.firestore.FieldValue.arrayUnion(oldListener)
        }, { merge: true });
        const newListeners = listeners.filter(listener => userID !== listener.id);
        roomRef.update({ listeners: newListeners });

        // Update status collection in firestore
        const { uri } = await Spotify.getMe();
        console.log('removing from status...');
        db.collection('status').doc(uri).update({
          roomID: firebase.firestore.FieldValue.delete()
        });
      }
    } else {
      console.error('Could not find room.');
    }
  } catch (err) {
    console.error(`room_actions: ${err}`);
  }

  // 2. Stop playback
  await Spotify.setPlaying(false);

  // 3. Reset redux state
  await dispatch({ type: LEAVE_ROOM });

  // 4. Navigate to the home screen
  if (joiningNewRoom) {
    await navigation.navigate('NowPlaying');
  } else {
    await navigation.navigate('Home');
  }
};

export const joinRoom = (navigation, roomID) => async (dispatch) => {
  // 1. Get data from Spotify
  const {
    id, uri, display_name: name, images
  } = await Spotify.getMe();
  const newListener = {
    id, uri, name, images
  };

  // 2. Join the room in firebase
  const db = firebase.firestore();
  const roomRef = db.collection('rooms').doc(roomID);

  // 3. Update status collection in firestore
  db.collection('status').doc(uri).update({ roomID });

  try {
    const room = await roomRef.get();
    if (room.exists) {
      roomRef.update({
        listeners: firebase.firestore.FieldValue.arrayUnion(newListener)
      });

      // 4. Set redux state
      await dispatch({ type: JOIN_ROOM, payload: roomID });

      // 5. Navigate to NowPlayingScreen
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
