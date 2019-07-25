import { UPDATE_ROOM } from './types';

export const updateRoom = data => ({
  type: UPDATE_ROOM,
  payload: data
});
