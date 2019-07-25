import * as firebase from 'firebase';
import 'firebase/firestore';

import {
  CHANGE_ROOM_NAME,
} from './types';

export const changeRoomName = ({ newRoomName, roomID }) => async (dispatch) => {
  const db = firebase.firestore();
  const roomRef = db.collection('rooms').doc(roomID);

  try {
    await roomRef.update({ name: newRoomName });
  } catch (err) {
    console.error(`Probably could not find room ${err}`);
  }

  dispatch({
    type: CHANGE_ROOM_NAME,
    payload: { newRoomName, roomID }
  });
};
