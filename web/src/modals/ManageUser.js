import React, { useCallback, useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';

import ModalWrapper from '../container/ModalWrapper';
import {formatEmployeeName, notifyWithIcon, request} from '../services/utilities';
import {
	CREATE_USER_API, FETCH_EMPLOYEES_API,
	FETCH_ROLE_API,
	UPDATE_USER_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';
import Select from 'react-select';
import AsyncSelect from "react-select/async";

const ManageUser = ({ closeModal, update, selectedUser }) => {
	const [loaded, setLoaded] = useState(false);
	const [roles, setRoles] = useState([]);
	const [role, setRole] = useState(null);
	const [username, setUsername] = useState(null);
	const [employee, setEmployee] = useState(null);
	const [isDisabled, setIsDisabled] = useState(null);


	const getEmployees = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_EMPLOYEES_API}?q=${q}`);
		return rs?.employees || [];
	};


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
				setUsername(selectedUser.username)
			}
			loadRoles().then(_ => setLoaded(true));
		}
	}, [loadRoles, loaded, selectedUser]);

	const onSubmit = async values => {

		try {
			const config = {
				method: selectedUser ? 'PUT' : 'POST',
				body: { ...values, username: username,
					...(employee?.first_name ? { first_name: employee.first_name } : {}),
					...(employee?.last_name ? { last_name: employee.last_name } : {}),
  					...(employee?.pf_num ? { pfs_num: employee.pf_num } : {})
				},
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
					if (!values.role && role==null) {
						errors.role_id = 'select role';
					}
					return errors;
				}}
				render={({ handleSubmit, submitError, submitting }) => (
					<FormWrapper onSubmit={handleSubmit} submitting={submitting}>
						<div className="modal-body">
							<FormSubmitError error={submitError} />
							<div className="row g-3">
								<div className="col-lg-12">
									<label htmlFor="username" className="form-label">
										Username
									</label>
									<Field id="username" name="username">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												value={username}
												className={`form-control ${error(meta)}`}
												id="username"
												disabled={true}
												placeholder="Enter username"
											/>
										)}
									</Field>
									<ErrorBlock name="username" />
								</div>
								{
									!selectedUser ?
										<>
										<div className="col-lg-12">
									<label htmlFor="employee_id" className="form-label">
										Employee
									</label>
									<Field id="employee_id" name="employee_id">
										{({ input, meta }) => (
											<AsyncSelect
												isClearable
												getOptionValue={option => option.id}
												getOptionLabel={option => formatEmployeeName(option)}
												value={employee}
												className={error(meta)}
												loadOptions={getEmployees}
												onChange={e => {
													setEmployee(e);
													setUsername(e?.pf_num)
													e ? input.onChange(e.id) : input.onChange('');
												}}
												placeholder="Search employee"
											/>
										)}
									</Field>
									<ErrorBlock name="employee_id" />
								</div>

										</>: ""
								}

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
													e ? input.onChange(e.id) : input.onChange('');
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
												id="email"
												placeholder="Enter email"
											/>
										)}
									</Field>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<div className="hstack gap-2 justify-content-end">
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
