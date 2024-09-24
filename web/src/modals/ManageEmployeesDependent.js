import React, { useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';

import ModalWrapper from '../container/ModalWrapper';
import {
	formatEmployeeName,
	notifyWithIcon,
	request,
} from '../services/utilities';
import {
	CREATE_EMPLOYEE_DEPENDENTS_API,
	FETCH_EMPLOYEES_API,
	UPDATE_EMPLOYEE_DEPENDENTS_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import { dependentStatus, dependentTypes } from '../services/constants';

const ManageEmployeeDependent = ({ closeModal, update, selectedDependent }) => {
	const [loaded, setLoaded] = useState(false);
	const [dob, setDob] = useState();
	const [employee, setEmployee] = useState(null);
	const [status, setStatus] = useState(null);
	const [type, setType] = useState(null);

	const getEmployees = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_EMPLOYEES_API}?q=${q}`);
		return rs?.employees || [];
	};

	useEffect(() => {
		if (!loaded) {
			if (selectedDependent) {
				setEmployee(selectedDependent.employee);
				setDob(new Date(selectedDependent.date_of_birth));
				setStatus(
					dependentStatus.find(status => status.id === selectedDependent.status)
				);
				setType(
					dependentTypes.find(
						type => type.id === selectedDependent.dependent_type
					)
				);
			}
			setLoaded(true);
		}
	}, [loaded, selectedDependent]);

	const onSubmit = async values => {
		try {
			const config = {
				method: selectedDependent ? 'PUT' : 'POST',
				body: {
					...values,
				},
			};
			const uri = selectedDependent
				? UPDATE_EMPLOYEE_DEPENDENTS_API.replace(
						':employee_dependent_id',
						selectedDependent.id
					)
				: CREATE_EMPLOYEE_DEPENDENTS_API;
			const rs = await request(uri, config);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not create dependent' };
		}
	};

	return (
		<ModalWrapper
			title={`${selectedDependent ? 'Edit' : 'Add'} Dependent`}
			closeModal={closeModal}
		>
			<Form
				initialValues={
					selectedDependent
						? {
								...selectedDependent,
								employee_id: selectedDependent.employee.id,
							}
						: {}
				}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					if (!values.employee_id) {
						errors.employee_id = 'select employee';
					}
					if (!values.status) {
						errors.status = 'select status';
					}
					if (!values.dependent_type) {
						errors.dependent_type = 'select type';
					}
					if (!values.name) {
						errors.name = 'enter dependent name';
					}
					if (!values.relationship) {
						errors.relationship = 'enter relationship';
					}
					if (!values.date_of_birth) {
						errors.date_of_birth = 'enter dependent date of birth';
					}

					return errors;
				}}
				render={({ handleSubmit, submitError, submitting }) => (
					<FormWrapper onSubmit={handleSubmit} submitting={submitting}>
						<div className="modal-body">
							<FormSubmitError error={submitError} />
							<div className="row g-3">
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
													e ? input.onChange(e.id) : input.onChange('');
												}}
												placeholder="Search employee"
											/>
										)}
									</Field>
									<ErrorBlock name="employee_id" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="name" className="form-label">
										Dependent Name
									</label>
									<Field id="name" name="name">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												id="name"
												placeholder="Enter dependent name"
											/>
										)}
									</Field>
									<ErrorBlock name="dependent name" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="dependent_type" className="form-label">
										Dependent Type
									</label>
									<Field id="dependent_type" name="dependent_type">
										{({ input, meta }) => (
											<Select
												{...input}
												options={dependentTypes}
												className={error(meta)}
												placeholder="Select Dependent type"
												getOptionValue={option => option.id}
												getOptionLabel={option => option.name}
												value={type}
												onChange={e => {
													setType(e);
													e ? input.onChange(e.id) : input.onChange('');
												}}
											/>
										)}
									</Field>
									<ErrorBlock name="type" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="relationship" className="form-label">
										Relationship
									</label>
									<Field id="relationship" name="relationship">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												id="name"
												placeholder="Enter relationship"
											/>
										)}
									</Field>
									<ErrorBlock name="relationship" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="status" className="form-label">
										Status
									</label>
									<Field id="status" name="status">
										{({ input, meta }) => (
											<Select
												{...input}
												options={dependentStatus}
												className={error(meta)}
												placeholder="Select Dependent status"
												getOptionValue={option => option.id}
												getOptionLabel={option => option.name}
												value={status}
												onChange={e => {
													setStatus(e);
													e ? input.onChange(e.id) : input.onChange('');
												}}
											/>
										)}
									</Field>
									<ErrorBlock name="status" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="date_of_birth" className="form-label">
										Date of Birth
									</label>
									<Field id="date_of_birth" name="date_of_birth">
										{({ input, meta }) => (
											<Flatpickr
												className={`form-control ${error(meta)}`}
												options={{
													dateFormat: 'd M, Y',
													maxDate: new Date(),
												}}
												placeholder="Select date of birth"
												value={dob}
												defaultValue={dob}
												onChange={([date]) => {
													input.onChange(moment(date).format('YYYY-MM-DD'));
													setDob(date);
												}}
											/>
										)}
									</Field>
									<ErrorBlock name="dob" />
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
									{`${selectedDependent ? 'Update' : 'Add'} Dependent`}
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageEmployeeDependent;
