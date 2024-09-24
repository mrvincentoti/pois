import React from 'react';

import { APP_NAME, APP_SHORT_NAME } from '../services/constants';

const Footer = () => {
	return (
		<footer className="footer">
			<div className="container-fluid">
				<div className="row">
					<div className="col-sm-6">
						&copy; {new Date().getFullYear()} {APP_NAME} ({APP_SHORT_NAME}).
					</div>
					<div className="col-sm-6 text-end">
						<p>
							App by <a className="text-primary">RIDU</a>.
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
