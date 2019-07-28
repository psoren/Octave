import Spotify from 'rn-spotify-sdk';

import { UPDATE_ROOM, LEAVE_ROOM } from './types';

export const updateRoom = data => ({ type: UPDATE_ROOM, payload: data });

export const leaveRoom = (navigation, id) => async (dispatch) => {
  await navigation.navigate('Home');
  await dispatch({ type: LEAVE_ROOM });

  // 1. Leave the room in firebase

  // 2. Stop playback
  await Spotify.setPlaying(false);

  // 3. Reset redux state

  // 4. Navigate to the home screen
};
