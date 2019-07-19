import AsyncStorage from '@react-native-community/async-storage';

import { SPOTIFY_LOGIN_SUCCESS } from './types';

export const storeTokens = sessionInfo => async (dispatch) => {
  const { accessToken, refreshToken, expireTime } = sessionInfo;
  await AsyncStorage.setItem('accessToken', accessToken);
  await AsyncStorage.setItem('refreshToken', refreshToken);
  await AsyncStorage.setItem('expireTime', expireTime);

  dispatch({
    type: SPOTIFY_LOGIN_SUCCESS,
    payload: {
      accessToken,
      refreshToken,
    },
  });
};
