import { createSlice } from '@reduxjs/toolkit';

import { togglePreloading } from './setting';
import { request } from '../../services/utilities';
import { USER_API } from '../../services/api';

export const fetchAuthUser = id => async dispatch => {
	try {
		const url = USER_API.replaceAll(':id', id);
		const rs = await request(url);
		dispatch(loginUser(rs.user_data));
		dispatch(setPermissions(rs.role_permission));
		dispatch(togglePreloading(false));
	} catch (e) {
		dispatch(signOut());
		dispatch(togglePreloading(false));
	}
};

const initialState = {
	account: null,
	loggedIn: false,
	permissions: null,
};

export const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		loginUser: (state, action) => {
			state.account = action.payload;
			state.loggedIn = true;
		},
		setUser: (state, action) => {
			state.account = action.payload;
		},
		setPermissions: (state, action) => {
			state.permissions = action.payload;
		},
		signOut: () => {
			return initialState;
		},
	},
});

export const { loginUser, setUser, setPermissions, signOut } =
	userSlice.actions;

export default userSlice.reducer;
