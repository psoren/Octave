import _ from 'lodash';

import {
  CHANGE_PENDING_ROOM_NAME,
  PREPEND_SONG_TO_CREATE_ROOM_QUEUE,
  APPEND_SONG_TO_CREATE_ROOM_QUEUE,
  CREATE_ROOM,
  LEAVE_ROOM
} from '../actions/types';

const INITIAL_STATE = {
  currentRoom: '',
  roomName: '',
  songs: []
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case CHANGE_PENDING_ROOM_NAME:
      return { ...state, roomName: action.payload };
    case PREPEND_SONG_TO_CREATE_ROOM_QUEUE:
      return { ...state, songs: _.uniq([action.payload, ...state.songs]) };
    case APPEND_SONG_TO_CREATE_ROOM_QUEUE:
      return { ...state, songs: _.uniq([...state.songs, action.payload]) };
    case CREATE_ROOM:
      return {
        ...INITIAL_STATE,
        currentRoom: action.payload
      };
    case LEAVE_ROOM:
      return INITIAL_STATE;
    default:
      return state;
  }
}
