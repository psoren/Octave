import _ from 'lodash';

import {
  ADD_SONG_TO_PENDING_ROOM_QUEUE,
  CHANGE_PENDING_ROOM_NAME
} from '../actions/types';

const INITIAL_STATE = {
  roomName: '',
  songs: []
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case ADD_SONG_TO_PENDING_ROOM_QUEUE:
      return { ...state, songs: _.uniqBy([action.payload, ...state], 'uri') };
    case CHANGE_PENDING_ROOM_NAME:
      return { ...state, roomName: action.payload };
    default:
      return state;
  }
}
