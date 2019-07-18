import { SPOTIFY_LOGIN_SUCCESS } from '../actions/types';

export default function (state = {}, action) {
    switch (action.type) {
        case SPOTIFY_LOGIN_SUCCESS:
            return action.payload;
        default:
            return state;
    }
}