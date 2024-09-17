import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	clearFilter: false,
};

export const employeeSlice = createSlice({
	name: 'employee',
	initialState,
	reducers: {
		doClearFilter: (state, action) => {
			state.clearFilter = action.payload;
		},
	},
});

export const { doClearFilter } = employeeSlice.actions;

export default employeeSlice.reducer;
