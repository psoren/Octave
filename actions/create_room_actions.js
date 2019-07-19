import {
  ADD_SONG_TO_PENDING_ROOM_QUEUE,
  CHANGE_PENDING_ROOM_NAME
} from './types';

export const addSongToPendingQueue = uri => ({
  type: ADD_SONG_TO_PENDING_ROOM_QUEUE,
  payload: { uri }
});

export const changeRoomName = roomName => ({
  type: CHANGE_PENDING_ROOM_NAME,
  payload: roomName
});
