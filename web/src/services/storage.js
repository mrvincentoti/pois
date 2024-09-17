import { decodeValue, encodeValue } from './utilities';

export default class LocalStorage {
	setItem(key, value) {
		this.setLocalStorage(key, value);
	}

	getItem(key) {
		return this.getLocalStorage(key);
	}

	removeItem(key) {
		this.removeLocalStorage(key);
	}

	// ------------------------------------
	// Local storage
	// ------------------------------------
	setLocalStorage(key, value) {
		if (typeof localStorage === 'undefined') {
			return;
		}

		try {
			localStorage.setItem(key, encodeValue(value));
		} catch (e) {}
	}

	getLocalStorage(key) {
		if (typeof localStorage === 'undefined') {
			return null;
		}

		const value = localStorage.getItem(key);
		return decodeValue(value);
	}

	removeLocalStorage(key) {
		if (typeof localStorage === 'undefined') {
			return;
		}

		localStorage.removeItem(key);
	}
}
