import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { APP_NAME, APP_SHORT_NAME } from '../services/constants';
import GsapWrapper from '../container/GsapWrapper';
// import logo from '../assets/images/image.svg';
import logo from '../assets/images/logo-sm.png';

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
		<main className="mx-auto vh-100">
			<div
				className="position-relative d-flex h-100 w-100 text-center"
				style={{
					background:
						'linear-gradient(0deg, #132649 0%, #4000BF 50%, #35007F 60.81%, #000000 93.75%)',
				}}
			>
				<GsapWrapper>
					<div className="d-flex h-100 flex-column align-items-center justify-content-center">
						<div
							className="position-relative z-3 d-flex flex-column min-h-[300px] rounded bg-white"
							style={{ width: '373px' }}
						>
							<div className="position-absolute top-[-32px] d-flex w-100 flex-column align-items-center justify-content-center">
								<img className="w-16" src={logo} alt="logo" />
							</div>
							{children}
							<div className="text-center p-4 mt-4">
								<p className="mb-0">
									&copy; {new Date().getFullYear()} {APP_NAME} ({APP_SHORT_NAME}
									).
								</p>
							</div>
						</div>
					</div>
				</GsapWrapper>
			</div>
		</main>
	);
};

export default GuestLayout;
