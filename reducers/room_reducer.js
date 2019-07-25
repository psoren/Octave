import {
  APPEND_TO_QUEUE,
  PREPEND_TO_QUEUE,
  CHANGE_ROOM_NAME
} from '../actions/types';

const INITIAL_STATE = {
  roomName: '',
  listeners: [],
  songs: []
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case APPEND_TO_QUEUE:
      return {
        ...state,
        songs: [...state.songs, action.payload]
      };
    case PREPEND_TO_QUEUE:
      return {
        ...state,
        songs: [action.payload, ...state.songs]
      };
    case CHANGE_ROOM_NAME:
      return {
        ...state,
        roomName: action.payload
      };
    default:
      return state;
  }
}
