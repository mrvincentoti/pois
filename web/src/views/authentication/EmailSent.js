import React from 'react';
import { Link } from 'react-router-dom';

const EmailSent = () => {
	return (
		<div className="p-lg-5 p-4 text-center">
			<div className="avatar-lg mx-auto mt-2">
				<div className="avatar-title bg-light text-success display-3 rounded-circle">
					<i className="ri-checkbox-circle-fill"></i>
				</div>
			</div>
			<div className="mt-4 pt-2">
				<h4>Email sent!</h4>
				<p className="text-muted mx-4">
					Please check your email and follow the link sent to you to change your
					password.
				</p>
				<div className="mt-4">
					<Link to="/login" className="btn btn-info w-100">
						Back to Login
					</Link>
				</div>
			</div>
		</div>
	);
};

export default EmailSent;
