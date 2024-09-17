import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../../services/constants';

const Logout = () => {
	return (
		<div className="p-lg-5 p-4 text-center">
			<lord-icon
				src="https://cdn.lordicon.com/hzomhqxz.json"
				trigger="loop"
				colors="primary:#405189,secondary:#08a88a"
				style={{ width: '180px', height: '180px' }}
			></lord-icon>

			<div className="mt-4 pt-2">
				<h5>You are Logged Out</h5>
				<p className="text-muted">
					Thank you for using <span className="fw-semibold">{APP_NAME}</span>
				</p>
				<div className="mt-4">
					<Link to="/login" className="btn btn-info w-100">
						Sign In
					</Link>
				</div>
			</div>
		</div>
	);
};

export default Logout;
