import { LoadingOutlined, SyncOutlined } from '@ant-design/icons';
import notification from 'antd/es/notification';
import { confirmAlert } from 'react-confirm-alert';
import LocalStorage from './storage';
import { limit, TOKEN_COOKIE } from './constants';
import moment from 'moment';
import { CHECK_API } from './api';

export const isUnset = o => typeof o === 'undefined' || o === null;

export function encodeValue(val) {
	if (typeof val === 'string') {
		return val;
	}

	return JSON.stringify(val);
}

export function decodeValue(val) {
	if (typeof val === 'string') {
		try {
			return JSON.parse(val);
		} catch (_) {}
	}

	return val;
}

const checkStatus = async response => {
	if (!response.ok) {
		if (response.statusText === 'UNAUTHORIZED') {
			// prettier-ignore
			const token = (new LocalStorage()).getItem(TOKEN_COOKIE);
			if (token) {
				// prettier-ignore
				(new LocalStorage()).removeItem(TOKEN_COOKIE);

				window.location.reload();
			}
		}
		const message = await response.text();
		const err = JSON.parse(message);
		throw Object.freeze({ message: err.message || err.error || err });
	}

	return response;
};
const checkKey = async () => {
	try {
		const response = await fetch(`${CHECK_API}`);
		if (!response.ok) {
			const errorData = await response.json();
			return { ok: false, message: errorData.message }; // Return the message from backend
		}
		return { ok: true };
	} catch (error) {
		console.error('Error making request:', error);
		return { ok: false, message: 'Network or other error' }; // Handle network or other errors
	}
};

const parseJSON = response => response.json();

export async function request(uri, { body, ...customConfig } = {}) {
	let headers = {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	};

	// prettier-ignore
	const token = (new LocalStorage()).getItem(TOKEN_COOKIE);

	if (token) {
		const jwt = `Bearer ${token}`;
		headers = customConfig.uploader
			? { Authorization: jwt }
			: { ...headers, Authorization: jwt };
	}

	const config = {
		method: body ? 'POST' : 'GET',
		...customConfig,
		headers: { ...headers },
	};

	if (body) {
		config.body = customConfig.uploader ? body : JSON.stringify(body);
	}

	const response = await fetch(uri, config);
	const result = await checkStatus(response);

	return parseJSON(result);
}

export function createHeaders(uploader) {
	const headers = {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	};

	const token = new LocalStorage().getItem(TOKEN_COOKIE);

	if (token) {
		const jwt = `Bearer ${token}`;
		return uploader
			? { Authorization: jwt }
			: { ...headers, Authorization: jwt };
	}

	return headers;
}

export async function asyncFetch(uri) {
	let headers = {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	};

	// prettier-ignore
	const token = (new LocalStorage()).getItem(TOKEN_COOKIE);

	if (token) {
		headers = { ...headers, Authorization: `Bearer ${token}` };
	}

	return fetch(uri, { method: 'GET', headers: { ...headers } });
}

export const notifyWithIcon = (type, description, duration = 4.5) => {
	notification[type]({ message: type, description, duration });
};

export const changeHTMLAttribute = (attribute, value) => {
	if (document.documentElement) {
		document.documentElement.setAttribute(attribute, value);
	}

	return true;
};

export const checkPermission = (permissions, permission) => {
	return permissions.find(p => p?.name === permission);
};

export const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
export const antIconSync = <SyncOutlined style={{ fontSize: 24 }} spin />;

export function confirmAction(
	action,
	payload,
	alertText,
	type = 'delete',
	alertHead
) {
	const icons = {
		delete: 'gsqxdxog',
		import: 'dxnllioo',
	};

	confirmAlert({
		customUI: ({ onClose }) => {
			const onClick = async () => {
				action(payload);
				onClose();
			};

			return (
				<div className="custom-ui p-5 text-center">
					<lord-icon
						src={`https://cdn.lordicon.com/${icons[type]}.json`}
						trigger="loop"
						colors="primary:#405189,secondary:#f06548"
						style={{ width: '90px', height: '90px' }}
					></lord-icon>
					<div className="mt-4 text-center">
						<h4>{alertHead ? alertHead : 'Are you sure?'}</h4>
						<p className="text-muted fs-15 mb-4">
							{alertText ? alertText : 'You want to delete this item'}
						</p>
						<div className="hstack gap-2 justify-content-center remove">
							<button className="btn btn-danger" onClick={onClose}>
								No
							</button>
							<button className="btn btn-success" onClick={onClick}>
								Yes
							</button>
						</div>
					</div>
				</div>
			);
		},
	});
}

export function formatDate(date, format = 'DD-MMM-YYYY') {
	return date ? moment(date).format(format) : '--';
}

export function formatDateTime(date, format = 'DD-MMM-YYYY HH:mm:ss') {
	return date ? moment(date).format(format) : '--';
}

export function checkIfContainsEdit(value) {
	return (
		value.toLowerCase().includes('edit') ||
		value.toLowerCase().includes('add') ||
		value.toLowerCase().includes('bulk')
	);
}

export const changeLimit = (e, query, location, navigate, filters) => {
	let queries = [];

	if (Number(e.target.value) !== limit) {
		queries = [...queries, `entries_per_page=${e.target.value}`];
	}

	if (query.get('q')) {
		queries = [...queries, `q=${query.get('q')}`];
	}

	const _query = queries.length > 0 ? `?${queries.join('&')}` : '';

	const _filterHashString = getHashString(filters);
	const _filterHash = _filterHashString !== '' ? `#${_filterHashString}` : '';

	navigate(`${location.pathname}${_query}${_filterHash}`);
};

export const getQueryString = query => {
	let queries = [];

	if (query.get('entries_per_page')) {
		queries = [...queries, `entries_per_page=${query.get('entries_per_page')}`];
	}

	if (query.get('q')) {
		queries = [...queries, `q=${query.get('q')}`];
	}

	return queries.join('&');
};

export const doSearch = (searchTerm, query, location, navigate, filters) => {
	const _limit = query.get('entries_per_page');
	const _limitQuery = _limit ? `entries_per_page=${_limit}&` : '';

	const _filterHashString = getHashString(filters);
	const _filterHash = _filterHashString !== '' ? `#${_filterHashString}` : '';

	navigate(`${location.pathname}?${_limitQuery}q=${searchTerm}${_filterHash}`);
};

export const doClearSearch = (query, location, navigate) => {
	const _limit = query.get('entries_per_page');
	const _limitQuery =
		_limit && Number(_limit) !== limit ? `?entries_per_page=${_limit}` : '';

	navigate(`${location.pathname}${_limitQuery}`);
};

export const formatEmployeeName = (employee, show_middlename = false) => {
	const middlename =
		show_middlename && employee.middle_name ? ` ${employee.middle_name}` : '';
	return employee
		? `${employee.first_name}${middlename} ${employee.last_name} (${employee.pf_num})`
		: '';
};
export const formatPoiName = (poi, show_middlename = false) => {
	const middlename =
		show_middlename && poi.middle_name ? ` ${poi.middle_name}` : '';
	return poi
		? `${poi.first_name}${middlename} ${poi.last_name} (${poi.ref_numb})`
		: '';
};

export const dateChecker = date => {
	const currentDate = new Date();
	const expectedDateOfReturn = new Date(date);

	// Compare dates
	return expectedDateOfReturn > currentDate;
};
export const formatGetInitialsName = employee => {
	if (employee) {
		const firstNameInitial = employee.first_name
			? employee.first_name.charAt(0)
			: '';
		const lastNameInitial = employee.last_name
			? employee.last_name.charAt(0)
			: '';

		return `${firstNameInitial}${lastNameInitial}`;
	}

	return '';
};

export const formatFullName = employee => {
	if (employee) {
		const firstNameInitial = employee.first_name
			? `${employee.first_name.toUpperCase()} `
			: '';
		const middleNameInitial = employee.middle_name
			? `${employee.middle_name.toUpperCase()} `
			: '';
		const lastNameInitial = employee.last_name
			? employee.last_name.toUpperCase()
			: '';

		return `${firstNameInitial} ${middleNameInitial} ${lastNameInitial}`;
	}

	return '';
};

export const formatOrgName = org => {
	if (org) {
		return org.org_name.toUpperCase();
	}

	return '';
};

export const formatGetInitialsString = name => {
	// Split the name into words
	const words = name.split(' ');

	// Extract the first letter of each word
	return words.map(word => word.charAt(0).toUpperCase()).join('');
};

export const groupBy = function (xs, key) {
	return xs.reduce(function (rv, x) {
		(rv[x[key]] = rv[x[key]] || []).push(x);
		return rv;
	}, {});
};

export const trucateString = text => {
	return text.length > 20
		? text.substring(0, 20) + '...' // Add ellipses if the string is longer
		: text;
};

export const calculateCompletionPercentage = obj => {
	// Count the number of non-null properties
	// Exclude the 'deleted_at' property
	const { deleted_at, ...filteredObj } = obj;

	// Count the number of non-null properties
	const nonNullCount = Object.values(filteredObj).filter(
		value => value !== null
	).length;

	// Calculate the total number of properties in the object (excluding 'deleted_at')
	const totalProperties = Object.keys(filteredObj).length;

	// Calculate the percentage of non-null properties
	const nonNullPercentage = (nonNullCount / totalProperties) * 100;

	return nonNullPercentage;
};

export const formatCadre = id => {
	if (id === 1) {
		return 'OPS';
	} else if (id === 2) {
		return 'PRO';
	} else {
		return 'GEN';
	}
};
export const formatDateWord = dateString => {
	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];

	if (dateString) {
		const date = new Date(dateString);
		const day = date.getDate();
		const month = months[date.getMonth()];
		const year = date.getFullYear();

		// Function to add suffix to day
		const getDayWithSuffix = day => {
			if (day === 1 || day === 21 || day === 31) {
				return day + 'st';
			} else if (day === 2 || day === 22) {
				return day + 'nd';
			} else if (day === 3 || day === 23) {
				return day + 'rd';
			} else {
				return day + 'th';
			}
		};

		return `${getDayWithSuffix(day)} ${month}, ${year}`;
	}
	return '';
};

export const formatDateYear = dateString => {
	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];

	const date = new Date(dateString);
	const year = date.getFullYear();

	// Function to add suffix to day

	return `${year}`;
};

export const briefStatus = status => {
	if (status === 1) {
		return 'Approved';
	}
	if (status === 0) {
		return 'Pending';
	}
	if (status === 2) {
		return 'Declined';
	} else {
		return status;
	}
};

export const parseHashString = hash => {
	if (hash === '' || hash.substring(0, 1) === '') {
		return null;
	}
	const split = hash
		.substring(1)
		.split('&')
		.map(h => Object.assign({}, h.split('|')));
	return Object.fromEntries(split);
};

export const getHashString = obj => {
	if (!obj) {
		return '';
	}
	return Object.entries(obj).join('&').replaceAll(',', '|');
};

// Utility function to calculate age from date of birth
export function calculateAge(dobString) {
	// Parse the date of birth string to a JavaScript Date object
	const birthDate = new Date(dobString);

	// Check if the date is valid
	if (isNaN(birthDate)) {
		throw new Error('Invalid date format provided.');
	}

	// Get today's date
	const today = new Date();

	// Calculate age
	let age = today.getFullYear() - birthDate.getFullYear();

	// Adjust the age if the birth date hasn't occurred yet this year
	const monthDifference = today.getMonth() - birthDate.getMonth();
	if (
		monthDifference < 0 ||
		(monthDifference === 0 && today.getDate() < birthDate.getDate())
	) {
		age--;
	}

	return age;
}

export const formatName = employee => {
	if (employee) {
		const firstNameInitial = employee.first_name
			? employee.first_name.charAt(0)
			: '';
		const lastNameInitial = employee.last_name
			? employee.last_name.charAt(0)
			: '';

		return `${firstNameInitial}${lastNameInitial}`;
	}

	return '';
};
