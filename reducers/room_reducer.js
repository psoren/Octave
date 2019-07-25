import { UPDATE_ROOM } from '../actions/types';

const INITIAL_STATE = {
  roomName: '',
  listeners: [],
  songs: []
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case UPDATE_ROOM:
      return action.payload;
    default:
      return state;
  }
}
