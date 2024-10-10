import settingReducer from './setting';
import userReducer from './user';
import layoutReducer from './layout';
import employeeSlice from './employee';
import categorySlice from './category';

const reducers = {
	setting: settingReducer,
	layout: layoutReducer,
	user: userReducer,
	employee: employeeSlice,
	category: categorySlice,
};

export default reducers;
