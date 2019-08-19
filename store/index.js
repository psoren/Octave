import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reduxCatch from 'redux-catch';

import reducers from '../reducers';

function errorHandler(error, getState, lastAction) {
  console.error(error);
  console.debug('current state', getState());
  console.debug('last action was', lastAction);
  // optionally dispatch an action due to the error using the dispatch parameter
}

const middlewares = [reduxCatch(errorHandler), thunk];

const store = createStore(
  reducers,
  applyMiddleware(...middlewares)
);

export default store;
