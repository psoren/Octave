import { combineReducers } from 'redux';
import auth from './auth_reducer';
import newRoom from './create_room_reducer';
import room from './room_reducer';

export default combineReducers({ auth, newRoom, room });
