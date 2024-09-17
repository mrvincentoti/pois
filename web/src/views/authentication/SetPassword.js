import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';

import {
	APP_NAME,
	APP_SHORT_NAME,
	LOGGED_IN_UID,
} from '../../services/constants';
import working from '../../assets/images/animate.gif';
import LocalStorage from '../../services/storage';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import { request } from '../../services/utilities';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../redux/slices/user';
import { SET_PASSWORD_API } from '../../services/api';

const storage = new LocalStorage();

const SetPassword = () => {
	document.title = `Set Password - ${APP_SHORT_NAME}`;

	const [passwordShow, setPasswordShow] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();

	const user = useSelector(state => state.user.account);

	const onSubmit = async values => {
		try {
			const userId = storage.getItem(LOGGED_IN_UID);
			const config = { method: 'POST', body: { ...values } };
			await request(SET_PASSWORD_API.replace(':id', userId), config);
			dispatch(setUser({ ...user, is_first_time: false }));
			const to = location.state?.from?.pathname || '/';
			navigate(to, { replace: true });
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not set password' };
		}
	};

	return (
		<div className="p-lg-5 p-4">
			<h5 className="text-primary">Set Password</h5>
			<p className="text-muted">Set your password to continue to {APP_NAME}.</p>

			<div className="p-2">
				<Form
					initialValues={{}}
					onSubmit={onSubmit}
					validate={values => {
						const errors = {};
						if (!values.password) {
							errors.password = 'enter your password';
						}
						if (!values.repassword) {
							errors.repassword = 're-enter your password';
						}
						if (
							values.password &&
							values.repassword &&
							values.password !== values.repassword
						) {
							errors.repassword = 'your password does not match';
						}
						return errors;
					}}
					render={({ handleSubmit, submitError, submitting }) => (
						<form onSubmit={handleSubmit}>
							<FormSubmitError error={submitError} />
							<div className="mb-3">
								<label className="form-label" htmlFor="password">
									Password
								</label>
								<div className="position-relative auth-pass-inputgroup">
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
									>
										<i className="ri-eye-fill align-middle"></i>
									</button>
									<ErrorBlock name="password" />
								</div>
							</div>
							<div className="mb-3">
								<label className="form-label" htmlFor="repassword">
									Repeat Password
								</label>
								<div className="position-relative auth-pass-inputgroup">
									<Field id="repassword" name="repassword">
										{({ input, meta }) => (
											<input
												{...input}
												type={passwordShow ? 'text' : 'password'}
												className={`form-control pe-5 password-input ${error(
													meta
												)}`}
												placeholder="Repeat password"
												id="repassword"
											/>
										)}
									</Field>
									<button
										onClick={() => setPasswordShow(!passwordShow)}
										className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted password-addon"
										type="button"
									>
										<i className="ri-eye-fill align-middle"></i>
									</button>
									<ErrorBlock name="repassword" />
								</div>
							</div>
							<div className="mt-4">
								<button className="btn btn-success w-100" type="submit">
									{submitting ? <img src={working} alt="" /> : 'Save Password'}
								</button>
							</div>
						</form>
					)}
				/>
			</div>
		</div>
	);
};

export default SetPassword;
