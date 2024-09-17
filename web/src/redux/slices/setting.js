import { createSlice } from '@reduxjs/toolkit';

export const settingSlice = createSlice({
	name: 'setting',
	initialState: {
		preloading: true,
		is404: false,
	},
	reducers: {
		togglePreloading: (state, action) => {
			state.preloading = action.payload;
		},
		toggleIs404: (state, action) => {
			state.is404 = action.payload;
		},
	},
});

export const { togglePreloading, toggleIs404 } = settingSlice.actions;

export default settingSlice.reducer;
