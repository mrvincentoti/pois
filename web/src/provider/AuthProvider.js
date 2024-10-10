import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { AuthContext } from '../hooks/auth';
import { loginUser, setPermissions, signOut } from '../redux/slices/user';
import {
	LOGGED_IN_UID,
	PREVIOUS_PATH,
	TOKEN_COOKIE,
	TOKEN_EXPIRATION,
} from '../services/constants';
import LocalStorage from '../services/storage';
import { notifyWithIcon } from '../services/utilities';
import { fetchCategories } from '../redux/slices/category';

const storage = new LocalStorage();

const AuthProvider = ({ children }) => {
	const user = useSelector(state => state.user.account);

	const dispatch = useDispatch();

	const setTokens = data => {
		dispatch(loginUser({ ...data.user }));
		dispatch(setPermissions(data.role_permission));
		storage.setItem(TOKEN_COOKIE, data.token);
		storage.setItem(TOKEN_EXPIRATION, data.expiration);
		storage.setItem(LOGGED_IN_UID, data.user.user_id);
		dispatch(fetchCategories());
	};

	const logout = callback => {
		dispatch(signOut());
		storage.removeItem(TOKEN_COOKIE);
		storage.removeItem(TOKEN_EXPIRATION);
		storage.removeItem(LOGGED_IN_UID);
		storage.removeItem(PREVIOUS_PATH);
		notifyWithIcon('success', 'user logged out!');
		callback();
	};

	return (
		<AuthContext.Provider value={{ user, setAuthUser: setTokens, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;
