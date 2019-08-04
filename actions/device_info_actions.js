import { SET_USER_LOCATION } from './types';

export const setLocation = location => ({
  type: SET_USER_LOCATION,
  payload: location
});
