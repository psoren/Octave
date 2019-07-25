import * as firebase from 'firebase';
import 'firebase/firestore';

import {
  UPDATE_ROOM,
  TOGGLE_PLAYBACK,
  NEXT_SONG,
  PREVIOUS_SONG
} from './types';

export const updateRoom = data => ({
  type: UPDATE_ROOM,
  payload: data
});
