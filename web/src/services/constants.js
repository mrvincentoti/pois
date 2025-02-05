export const IS_DOCKER_PROD = process.env.NODE_ENV === 'production' && process.env.REACT_APP_HOST_ENV === 'docker';

export const APP_NAME = IS_DOCKER_PROD
	? window.REACT_APP_NAME
	: process.env.REACT_APP_NAME;
export const APP_SHORT_NAME = IS_DOCKER_PROD
	? window.REACT_APP_SHORT_NAME
	: process.env.REACT_APP_SHORT_NAME;

export const BASE_AUTH_URL = IS_DOCKER_PROD
	? window.REACT_APP_BASE_AUTH_URL
	: process.env.REACT_APP_BASE_AUTH_URL;
export const BASE_EMPLOYEE_URL = process.env.REACT_APP_BASE_EMPLOYEE_URL;
export const BASE_AUDIT_URL = IS_DOCKER_PROD
	? window.REACT_APP_BASE_AUDIT_URL
	: process.env.REACT_APP_BASE_AUDIT_URL;

export const FILE_CDN = IS_DOCKER_PROD
	? window.REACT_APP_CDN
	: process.env.REACT_APP_CDN;

export const TOKEN_COOKIE = 'eims:token:cookie';
export const TOKEN_EXPIRATION = 'eims:token:expire';
export const LOGGED_IN_UID = 'eims:uid';
export const PREVIOUS_PATH = 'hr:path';

// gsap animation
export const COMPACT_VERTICAL_SPACE = 20;
export const LINE_WIDTH = 1.5;
export const TRIAL_SIZE_PERCENTAGE = '100%';
export const GRADIENT_SUFFIXES = ['01', '02', '03', '04'];
export const DURATION = 2;

// Poi
export const BASE_POI_URL = IS_DOCKER_PROD ? window.REACT_APP_BASE_POI_URL : process.env.REACT_APP_BASE_POI_URL;

export const limits = [2, 4, 9, 12, 16, 20];
export const limit = 9;
export const paginate = {
	total: 0,
	current_page: 1,
	pages: 0,
	per_page: limit,
};

export const fulldate = 'DD-MMM-YYYY h:mma';
export const gradeLevels = [
	{ id: 3, name: '3' },
	{ id: 4, name: '4' },
	{ id: 5, name: '5' },
	{ id: 6, name: '6' },
	{ id: 7, name: '7' },
	{ id: 8, name: '8' },
	{ id: 9, name: '9' },
	{ id: 10, name: '10' },
	{ id: 12, name: '12' },
	{ id: 13, name: '13' },
	{ id: 14, name: '14' },
	{ id: 15, name: '15' },
	{ id: 16, name: '16' },
	{ id: 17, name: '17' },
];

export const deploymentTypes = [
	{ id: 1, name: 'External' },
	{ id: 2, name: 'Internal' },
	{ id: 3, name: 'Secondment' },
];

export const maritalStatusList = [
	{ id: 1, name: 'Single' },
	{ id: 2, name: 'Married' },
	{ id: 3, name: 'Seperated' },
	{ id: 4, name: 'Widowed' },
	{ id: 5, name: 'Engaged' },
];

export const passportCategoryList = [
	{ id: 1, name: 'Official' },
	{ id: 2, name: 'Standard' },
];

export const employeeStatusList = [
	{ id: 11, name: 'Active' },
	{ id: 1, name: 'Retired' },
	{ id: 2, name: 'Deceased' },
	{ id: 3, name: 'Terminated' },
];

export const hasImplications = [
	{ id: 1, name: 'No Action' },
	{ id: 2, name: 'Has Action' },
];

export const statusTypes = [
	{ id: 1, name: 'Ongoing' },
	{ id: 2, name: 'Completed' },
];

export const postingTypes = [
	{ id: 1, name: 'Extension' },
	{ id: 2, name: 'Recalled' },
	{ id: 3, name: 'Cross-posting' },
	{ id: 4, name: 'Ended' },
	{ id: 5, name: 'Cross-posted' },
	{ id: 6, name: 'Extended' },
];
export const dependentStatus = [
	{ id: 1, name: 'Active' },
	{ id: 2, name: 'Deceased' },
];

export const nextOfKinCategory = [
	{ id: 1, name: 'Primary' },
	{ id: 2, name: 'Alternate' },
];
export const trainingCategory = [
	{ id: 1, name: 'GTI' },
	{ id: 2, name: 'Sponsorship' },
	{ id: 3, name: 'Basic' },
];
export const dependentTypes = [
	{ id: 1, name: 'Spouse' },
	{ id: 2, name: 'Child' },
];

export const confirmationList = [
	{ id: 1, name: 'Yes' },
	{ id: 2, name: 'No' },
];

export const stagnationList = [
	{ id: 0, name: 'No' },
	{ id: 3, name: 'Yes' },
];

export const categoryList = [
	{ id: 1, name: 'CITU' },
	{ id: 2, name: 'ANALYST' },
	{ id: 3, name: 'RIDU' },
];
