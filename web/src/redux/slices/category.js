import { createSlice } from '@reduxjs/toolkit';

import { request } from '../../services/utilities';
import { FETCH_CATEGORIES_API } from '../../services/api';

export const fetchCategories = () => async dispatch => {
	try {
		const rs = await request(`${FETCH_CATEGORIES_API}?page=0`);
		dispatch(setCategories(rs.categories));
	} catch (e) {
		console.log(e);
	}
};

export const categorySlice = createSlice({
	name: 'category',
	initialState: {
		list: [],
	},
	reducers: {
		setCategories: (state, action) => {
			state.list = action.payload;
		},
	},
});

export const { setCategories } = categorySlice.actions;

export default categorySlice.reducer;
