import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import { Link } from 'react-router-dom';

import { APP_NAME, PREVIOUS_PATH } from '../../services/constants';
import { useAuth } from '../../hooks/auth';
import { notifyWithIcon, request } from '../../services/utilities';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import working from '../../assets/images/animate.gif';
import { LOGIN_API } from '../../services/api';
import LocalStorage from '../../services/storage';

const storage = new LocalStorage();

const Login = () => {
	const [passwordShow, setPasswordShow] = useState(false);

	const navigate = useNavigate();

	const { setAuthUser } = useAuth();

	const onSubmit = async values => {
		try {
			const config = { method: 'POST', body: { ...values } };
			const rs = await request(LOGIN_API, config);
			setAuthUser(rs);
			notifyWithIcon('success', 'user logged in!');
			const previous_path = storage.getItem(PREVIOUS_PATH);
			const to = rs.user.is_first_time ? '/set-password' : previous_path || '/';
			navigate(to, { replace: true });
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not login user' };
		}
	};

	return (
		<div className="d-flex w-100 flex-column p-4">
			<div>
				<p className="text-md m-0 pt-[24px] text-center">Welcome Back!</p>
				<p className="text-muted">Sign in to continue to {APP_NAME}.</p>
			</div>

			<div className="mt-4">
				<Form
					initialValues={{}}
					onSubmit={onSubmit}
					validate={values => {
						const errors = {};
						if (!values.username) {
							errors.username = 'enter your username';
						}
						if (!values.password) {
							errors.password = 'enter your password';
						}
						return errors;
					}}
					render={({ handleSubmit, submitError, submitting }) => (
						<form onSubmit={handleSubmit}>
							<FormSubmitError error={submitError} />
							<div className="mb-3">
								<label
									className="form-label text-start d-block"
									htmlFor="username">
									Username
								</label>
								<Field id="username" name="username">
									{({ input, meta }) => (
										<input
											{...input}
											type="text"
											className={`form-control ${error(meta)}`}
											id="username"
											placeholder="Enter username"
										/>
									)}
								</Field>
								<ErrorBlock name="username" />
							</div>

							<div className="mb-3">
								{/* <div className="float-end">
									<Link to="/forgot-password" className="text-muted">
										Forgot password?
									</Link>
								</div> */}
								<label
									className="form-label text-start d-block"
									htmlFor="password">
									Password
								</label>
								<div className="position-relative auth-pass-inputgroup mb-3">
									<Field id="password" name="password">
										{({ input, meta }) => (
											<input
												{...input}
												type={passwordShow ? 'text' : 'password'}
												className={`form-control pe-5 password-input ${error(
													meta
												)}`}
												placeholder="Enter password"
												id="password"
											/>
										)}
									</Field>
									<button
										onClick={() => setPasswordShow(!passwordShow)}
										className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
										type="button"
										id="password-addon">
										<i className="ri-eye-fill align-middle"></i>
									</button>
									<ErrorBlock name="password" />
								</div>
							</div>
							<div className="mt-4">
								<button className="w-100 btn btn-info" type="submit">
									{submitting ? <img src={working} alt="" /> : 'Sign In'}
								</button>
							</div>
						</form>
					)}
				/>
			</div>
		</div>
	);
};

export default Login;
