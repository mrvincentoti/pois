import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';

import rootReducer from './slices';

let middlewares = [];

if (process.env.NODE_ENV !== 'production') {
	const logger = createLogger({ collapsed: true });

	middlewares = [...middlewares, logger];
}

export default function configureAppStore(preloadedState) {
	const store = configureStore({
		devTools: process.env.NODE_ENV !== 'production',
		middleware: getDefaultMiddleware =>
			getDefaultMiddleware().concat(middlewares),
		preloadedState,
		reducer: rootReducer,
	});

	return store;
}
