import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import reportWebVitals from './reportWebVitals';
import configureStore from './redux/store';
import LocalStorage from './services/storage';
import { LOGGED_IN_UID, TOKEN_COOKIE } from './services/constants';
import { togglePreloading } from './redux/slices/setting';
import { fetchAuthUser } from './redux/slices/user';
import { fetchCategories } from './redux/slices/category';

import 'react-confirm-alert/src/react-confirm-alert.css';
import './assets/scss/themes.scss';

const storage = new LocalStorage();
const store = configureStore();

if (storage.getItem(TOKEN_COOKIE)) {
	const id = storage.getItem(LOGGED_IN_UID);
	if (!id || typeof id === 'undefined' || (id && id === '')) {
		store.dispatch(togglePreloading(false));
	} else {
		store.dispatch(fetchAuthUser(id));
		store.dispatch(fetchCategories());
	}
} else {
	store.dispatch(togglePreloading(false));
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<Provider store={store}>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</Provider>
);

// If you want to start measuring performance in your app, pass a function
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
