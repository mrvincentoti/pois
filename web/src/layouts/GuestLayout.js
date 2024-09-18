import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { APP_NAME, APP_SHORT_NAME } from '../services/constants';
import AuthSlider from '../components/AuthSlider';

const GuestLayout = ({ children }) => {
	const layoutModeType = useSelector(state => state.layout.layoutModeType);

	useEffect(() => {
		if (layoutModeType === 'dark') {
			document.body.setAttribute('data-bs-theme', 'dark');
		} else {
			document.body.setAttribute('data-bs-theme', 'light');
		}

		return () => {
			document.body.removeAttribute('data-bs-theme');
		};
	}, [layoutModeType]);

	return (
		<div className="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
			<div className="bg-overlay"></div>
			<div className="auth-page-content overflow-hidden pt-lg-5">
				<div className="container">
					<div className="row">
						<div className="col-lg-6 offset-lg-3">
							<div className="card overflow-hidden">
								<div className="row g-0">
									{/* <AuthSlider /> */}
									<div className="col-lg-12">{children}</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<footer className="footer">
				<div className="container">
					<div className="row">
						<div className="col-lg-12">
							<div className="text-center">
								<p className="mb-0">
									&copy; {new Date().getFullYear()} {APP_NAME} ({APP_SHORT_NAME}
									).
								</p>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default GuestLayout;
