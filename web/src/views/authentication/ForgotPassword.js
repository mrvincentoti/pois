import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import { Link } from 'react-router-dom';

import { APP_NAME } from '../../services/constants';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import working from '../../assets/images/animate.gif';

const ForgotPassword = () => {
	const navigate = useNavigate();

	const onSubmit = async values => {
		try {
			navigate('/reset-link-sent', { replace: true });
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not send reset email' };
		}
	};

	return (
		<div className="p-lg-5 p-4">
			<h5 className="text-primary">Forgot Password?</h5>
			<p className="text-muted">Reset password with {APP_NAME}</p>

			<div className="mt-2 text-center">
				<lord-icon
					src="https://cdn.lordicon.com/aycieyht.json"
					trigger="loop"
					colors="primary:#0ab39c"
					className="avatar-xl"
					delay="1000"
					style={{ width: '120px', height: '120px' }}
				></lord-icon>
			</div>

			<div
				className="alert border-0 alert-warning text-center mb-2 mx-2"
				role="alert"
			>
				Enter your email and instructions will be sent to you!
			</div>
			<div className="p-2">
				<Form
					initialValues={{}}
					onSubmit={onSubmit}
					validate={values => {
						const errors = {};
						if (!values.email) {
							errors.email = 'enter your email address';
						}
						return errors;
					}}
					render={({ handleSubmit, submitError, submitting }) => (
						<form onSubmit={handleSubmit}>
							<FormSubmitError error={submitError} />
							<div className="mb-4">
								<label className="form-label" htmlFor="email">
									Email
								</label>
								<Field id="email" name="email">
									{({ input, meta }) => (
										<input
											{...input}
											type="email"
											className={`form-control ${error(meta)}`}
											id="email"
											placeholder="Enter your email address"
										/>
									)}
								</Field>
								<ErrorBlock name="email" />
							</div>

							<div className="text-center mt-4">
								<button className="w-100 btn btn-success" type="submit">
									{submitting ? (
										<img src={working} alt="" />
									) : (
										'Send Reset Link'
									)}
								</button>
							</div>
						</form>
					)}
				/>
			</div>
			<div className="mt-5 text-center">
				<p className="mb-0">
					Remembered your password?{' '}
					<Link
						to="/login"
						className="fw-bold text-primary text-decoration-underline"
					>
						Login here
					</Link>
				</p>
			</div>
		</div>
	);
};

export default ForgotPassword;
