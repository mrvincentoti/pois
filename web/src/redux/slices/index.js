import settingReducer from './setting';
import userReducer from './user';
import layoutReducer from './layout';
import employeeSlice from './employee';

const reducers = {
	setting: settingReducer,
	layout: layoutReducer,
	user: userReducer,
	employee: employeeSlice,
};

export default reducers;
