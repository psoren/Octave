import { SPOTIFY_LOGIN_SUCCESS } from '../actions/types';

const INITIAL_STATE = {
  accessToken: '',
  refreshToken: '',
  expireTime: ''
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case SPOTIFY_LOGIN_SUCCESS:
      return action.payload;
    default:
      return state;
  }
}
