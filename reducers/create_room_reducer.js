import _ from 'lodash';

import {
  CHANGE_PENDING_ROOM_NAME,
  PREPEND_SONGS_TO_CREATE_ROOM_QUEUE,
  APPEND_SONGS_TO_CREATE_ROOM_QUEUE,
  CREATE_ROOM
} from '../actions/types';

const INITIAL_STATE = {
  name: '',
  songs: []
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case CHANGE_PENDING_ROOM_NAME:
      return { ...state, name: action.payload };
    case PREPEND_SONGS_TO_CREATE_ROOM_QUEUE:
      return { ...state, songs: _.uniqBy([...action.payload, ...state.songs], 'id') };
    case APPEND_SONGS_TO_CREATE_ROOM_QUEUE:
      return { ...state, songs: _.uniqBy([...state.songs, ...action.payload], 'id') };
    case CREATE_ROOM:
      return INITIAL_STATE;
    default:
      return state;
  }
}
