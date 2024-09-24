import React, { useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';

import ModalWrapper from '../container/ModalWrapper';
import {
	formatEmployeeName,
	notifyWithIcon,
	request,
} from '../services/utilities';
import {
	CREATE_EMPLOYEE_TRAINING_API,
	FETCH_EMPLOYEES_API,
	FETCH_TRAININGS_API,
	UPDATE_EMPLOYEE_TRAINING_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';
import { trainingCategory } from '../services/constants';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';

const ManageEmployeeTraining = ({ closeModal, update, employeeTraining }) => {
	const [loaded, setLoaded] = useState(false);
	const [employee, setEmployee] = useState(null);
	const [training, setTraining] = useState(null);
	const [category, setCategory] = useState(null);
	const [dateAttended, setDateAttended] = useState(null);

	useEffect(() => {
		if (!loaded) {
			if (employeeTraining) {
				setEmployee(employeeTraining.employee);
				setTraining(employeeTraining.training);
				setDateAttended(new Date(employeeTraining.date_attended));
				setCategory(
					trainingCategory.find(
						category => category.id === employeeTraining.category_id
					)
				);
			}
			setLoaded(true);
		}
	}, [employeeTraining, loaded]);

	const getEmployees = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_EMPLOYEES_API}?q=${q}`);
		return rs?.employees || [];
	};

	const getTrainings = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_TRAININGS_API}?q=${q}`);
		return rs?.trainings || [];
	};

	const onSubmit = async values => {
		try {
			const config = {
				method: employeeTraining ? 'PUT' : 'POST',
				body: {
					...values,
					employee: undefined,
					training: undefined,
					deleted_at: undefined,
					category_id: category.id,
				},
			};
			const uri = employeeTraining
				? UPDATE_EMPLOYEE_TRAINING_API.replace(
						':employee_training_id',
						employeeTraining.id
					)
				: CREATE_EMPLOYEE_TRAINING_API;
			const rs = await request(uri, config);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			return {
				[FORM_ERROR]: e.message || 'could not create employee training',
			};
		}
	};

	return (
		<ModalWrapper
			title={`${employeeTraining ? 'Edit' : 'Add'} Training`}
			closeModal={closeModal}
		>
			<Form
				initialValues={{ ...employeeTraining }}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					if (!values.employee_id && employee == null) {
						errors.employee_id = 'select employee';
					}
					if (!values.training_id && training == null) {
						errors.training_id = 'select training';
					}
					if (!values.category_id && category == null) {
						errors.category_id = 'select category';
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
												defaultOptions
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
									<label htmlFor="training_id" className="form-label">
										Training
									</label>
									<Field id="training_id" name="training_id">
										{({ input, meta }) => (
											<AsyncSelect
												isClearable
												getOptionValue={option => option.id}
												getOptionLabel={option => option.name}
												defaultOptions
												value={training}
												className={error(meta)}
												loadOptions={getTrainings}
												onChange={e => {
													setTraining(e);
													e ? input.onChange(e.id) : input.onChange('');
												}}
												placeholder="Search training"
											/>
										)}
									</Field>
									<ErrorBlock name="training_id" />
								</div>
								<div className="col-lg-12">
									<label
										htmlFor="expected_date_of_return"
										className="form-label"
									>
										Date attended
									</label>
									<Field id="date_attended" name="date_attended">
										{({ input, meta }) => (
											<Flatpickr
												className={`form-control ${error(meta)}`}
												placeholder="Select expected date of return"
												value={dateAttended}
												defaultValue={dateAttended}
												onChange={([date]) => {
													input.onChange(moment(date).format('YYYY-MM-DD'));
													setDateAttended(date);
												}}
											/>
										)}
									</Field>
									<ErrorBlock name="date_attended" />
								</div>
								<div className="col-lg-12">
									<label htmlFor="category_id" className="form-label">
										Category
									</label>
									<Field id="category_id" name="category_id">
										{({ input, meta }) => (
											<Select
												{...input}
												options={trainingCategory}
												className={error(meta)}
												placeholder="Select Category"
												getOptionValue={option => option.id}
												getOptionLabel={option => option.name}
												value={category}
												onChange={e => {
													setCategory(e);
													e ? input.onChange(e.id) : input.onChange('');
												}}
											/>
										)}
									</Field>
									<ErrorBlock name="category_id" />
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
									Save Training
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageEmployeeTraining;
