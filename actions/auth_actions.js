import AsyncStorage from '@react-native-community/async-storage';

import {
  SPOTIFY_LOGIN_SUCCESS,
  REFRESH_TOKENS
} from './types';

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
      expireTime
    },
  });
};

export const refreshTokens = sessionInfo => async (dispatch) => {
  const { accessToken, refreshToken, expireTime } = sessionInfo;
  await AsyncStorage.setItem('accessToken', accessToken);
  await AsyncStorage.setItem('refreshToken', refreshToken);
  await AsyncStorage.setItem('expireTime', expireTime);
  dispatch({
    type: REFRESH_TOKENS,
    payload: {
      accessToken,
      refreshToken,
      expireTime
    }
  });
};
