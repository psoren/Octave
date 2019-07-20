import {
  CHANGE_PENDING_ROOM_NAME,
  APPEND_SONG_TO_CREATE_ROOM_QUEUE,
  PREPEND_SONG_TO_CREATE_ROOM_QUEUE
} from './types';

export const changeRoomName = roomName => ({
  type: CHANGE_PENDING_ROOM_NAME,
  payload: roomName
});
export const prependSongToQueue = uri => ({
  type: PREPEND_SONG_TO_CREATE_ROOM_QUEUE,
  payload: uri
});

export const appendSongToQueue = uri => ({
  type: APPEND_SONG_TO_CREATE_ROOM_QUEUE,
  payload: uri
});
