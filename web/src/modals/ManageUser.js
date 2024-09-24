import React, { useCallback, useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';

import ModalWrapper from '../container/ModalWrapper';
import { notifyWithIcon, request } from '../services/utilities';
import {
	CREATE_USER_API,
	FETCH_ROLE_API,
	UPDATE_USER_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';
import Select from 'react-select';

const ManageUser = ({ closeModal, update, selectedUser }) => {
	const [loaded, setLoaded] = useState(false);
	const [roles, setRoles] = useState([]);
	const [role, setRole] = useState(null);

	const loadRoles = useCallback(async () => {
		try {
			const rs = await request(FETCH_ROLE_API);
			setRoles(rs.roles);
		} catch (e) {
			notifyWithIcon('error', e.message);
		}
	}, []);

	useEffect(() => {
		if (!loaded) {
			if (selectedUser) {
				const userRole = {
					id: selectedUser.role?.id,
					name: selectedUser.role?.name,
				};
				setRole(userRole);
			}
			loadRoles().then(() => setLoaded(true));
		}
	}, [loadRoles, loaded, selectedUser]);

	const onSubmit = async values => {
		try {
			const config = {
				method: selectedUser ? 'PUT' : 'POST',
				body: { ...values },
			};

			const apiURL = selectedUser
				? UPDATE_USER_API.replace(':id', selectedUser.id)
				: CREATE_USER_API;

			const rs = await request(apiURL, config);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'Could not save User' };
		}
	};

	return (
		<ModalWrapper
			title={`${selectedUser ? 'Edit' : 'Add'} User`}
			closeModal={closeModal}
		>
			<Form
				initialValues={{ ...selectedUser }}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					if (!values.role && role === null) {
						errors.role_id = 'Select role';
					}
					return errors;
				}}
				render={({ handleSubmit, submitError, submitting }) => (
					<FormWrapper onSubmit={handleSubmit} submitting={submitting}>
						<div className="modal-body">
							<FormSubmitError error={submitError} />
							<div className="row g-3">
								{/* Existing Fields */}
								<div className="col-lg-12">
									<label htmlFor="username" className="form-label">
										Username
									</label>
									<Field id="username" name="username">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												placeholder="Enter username"
											/>
										)}
									</Field>
									<ErrorBlock name="username" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="firstname" className="form-label">
										First Name
									</label>
									<Field id="first_name" name="first_name">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												placeholder="Enter first name"
											/>
										)}
									</Field>
									<ErrorBlock name="first_name" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="lastname" className="form-label">
										Last Name
									</label>
									<Field id="last_name" name="last_name">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												placeholder="Enter last name"
											/>
										)}
									</Field>
									<ErrorBlock name="last_name" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="role_id" className="form-label">
										Role
									</label>
									<Field id="role_id" name="role_id">
										{({ input, meta }) => (
											<Select
												{...input}
												options={roles}
												className={error(meta)}
												placeholder="Select role"
												getOptionValue={option => option.id}
												getOptionLabel={option => option.name}
												value={role}
												onChange={e => {
													setRole(e);
													input.onChange(e?.id || '');
												}}
											/>
										)}
									</Field>
									<ErrorBlock name="role_id" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="email" className="form-label">
										Email Address
									</label>
									<Field id="email" name="email">
										{({ input, meta }) => (
											<input
												{...input}
												type="email"
												className={`form-control ${error(meta)}`}
												placeholder="Enter email"
											/>
										)}
									</Field>
									<ErrorBlock name="email" />
								</div>

								{/* New Password Field */}
								<div className="col-lg-12">
									<label htmlFor="password" className="form-label">
										Password
									</label>
									<Field id="password" name="password">
										{({ input, meta }) => (
											<input
												{...input}
												type="password"
												className={`form-control ${error(meta)}`}
												placeholder="Enter password"
											/>
										)}
									</Field>
									<ErrorBlock name="password" />
								</div>

								{/* New PFS Field */}
								<div className="col-lg-12">
									<label htmlFor="pfs_num" className="form-label">
										PFS Number
									</label>
									<Field id="pfs_num" name="pfs_num">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												placeholder="Enter PFS Number"
											/>
										)}
									</Field>
									<ErrorBlock name="pfs_num" />
								</div>
							</div>
						</div>

						<div className="modal-footer">
							<div className="hstack gap-2 justify-content-end">
								<button
									type="button"
									className="btn btn-light"
									onClick={() => closeModal()}
								>
									Close
								</button>
								<button
									type="submit"
									className="btn btn-success"
									disabled={submitting}
								>
									{`${selectedUser ? 'Update' : 'Add'} User`}
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageUser;
