import {
  SET_USER_INFO,
  CLEAR_USER_INFO
} from '../actions/types';

const INITIAL_STATE = {
  id: '',
  display_name: '',
  email: '',
  images: []
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_USER_INFO:
      return { ...action.payload };
    case CLEAR_USER_INFO:
      return { ...INITIAL_STATE };
    default:
      return state;
  }
}
