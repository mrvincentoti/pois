import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import lottie from 'lottie-web';
import { defineElement } from '@lordicon/element';

import ScrollToTop from './container/ScrollToTop';
import AuthProvider from './provider/AuthProvider';
import Splash from './views/Splash';
import AppRoutes from './Routes';
import { useLocation } from 'react-router-dom';
import LocalStorage from './services/storage';
import { PREVIOUS_PATH } from './services/constants';

const storage = new LocalStorage();

const App = () => {
	const location = useLocation();

	useEffect(() => {
		if (
			location.state?.from?.pathname !== '/login' &&
			location.pathname !== '/login'
		) {
			const pathname = location.pathname;
			const query = location.search !== '' ? location.search : '';
			const hash = location.hash !== '' ? location.hash : '';

			const path = `${pathname}${query}${hash}`;
			storage.setItem(PREVIOUS_PATH, path);
		}
	}, [location]);

	defineElement(lottie.loadAnimation);

	const preloading = useSelector(state => state.setting.preloading);

	return preloading ? (
		<Splash />
	) : (
		<ScrollToTop>
			<AuthProvider>
				<AppRoutes />
			</AuthProvider>
		</ScrollToTop>
	);
};

export default App;
