import {
  CREATE_ROOM,
  UPDATE_ROOM,
  LEAVE_ROOM,
  JOIN_ROOM
} from '../actions/types';

const INITIAL_STATE = {
  currentSongIndex: 0,
  playing: true,
  roomCreatorID: '',
  name: '',
  songs: [],
  id: ''
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case CREATE_ROOM:
      return {
        ...INITIAL_STATE,
        id: action.payload.newRoomID,
        test: action.payload.test
      };
    case JOIN_ROOM:
      return { ...INITIAL_STATE, id: action.payload };
    case UPDATE_ROOM:
      return { ...state, ...action.payload };
    case LEAVE_ROOM:
      return INITIAL_STATE;
    default:
      return state;
  }
}
