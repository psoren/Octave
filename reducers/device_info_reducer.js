
import {
  SET_USER_LOCATION
} from '../actions/types';

const INITIAL_STATE = { location: '' };

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_USER_LOCATION:
      return { ...state, location: action.payload };
    default:
      return state;
  }
}
