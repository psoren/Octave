import { combineReducers } from 'redux';
import auth from './auth_reducer';
import pendingRoom from './create_room_reducer';
import currentRoom from './room_reducer';

export default combineReducers({ auth, pendingRoom, currentRoom });
