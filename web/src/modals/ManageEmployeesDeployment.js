import React, { useCallback, useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';

import ModalWrapper from '../container/ModalWrapper';
import {
	formatEmployeeName,
	notifyWithIcon,
	request,
} from '../services/utilities';
import {
	CREATE_EMPLOYEE_DEPLOYMENTS_API,
	FETCH_DEPARTMENTS_API,
	FETCH_DIRECTORATES_API,
	FETCH_EMPLOYEES_API,
	FETCH_UNITS_API,
	UPDATE_EMPLOYEE_DEPLOYMENTS_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import { deploymentTypes } from '../services/constants';

const ManageEmployeesDeployment = ({
	closeModal,
	update,
	selectedDeployment,
}) => {
	const [loaded, setLoaded] = useState(false);
	const [departments, setDepartments] = useState([]);
	const [units, setUnits] = useState([]);
	const [department, setDepartment] = useState(null);
	const [directorate, setDirectorate] = useState(null);
	const [unit, setUnit] = useState(null);
	const [employee, setEmployee] = useState(null);
	const [dateOfAssumption, setDateOfAssumption] = useState();
	const [dateOfReturn, setDateOfReturn] = useState();
	const [type, setType] = useState(null);

	const getEmployees = async q => {
		if (!q || q.length <= 1) {
			return [];
		}
		const rs = await request(`${FETCH_EMPLOYEES_API}?q=${q}`);
		return rs?.employees || [];
	};

	const fetchUnits = useCallback(async id => {
		try {
			const rs = await request(
				`${FETCH_UNITS_API}?department_id=${id}&page=1&per_page=50`
			);
			setUnits(rs.units);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const getDirectorates = async q => {
		if (!q || q.length <= 1) {
			return [];
		}
		const rs = await request(`${FETCH_DIRECTORATES_API}?q=${q}`);
		return rs?.directorates || [];
	};

	const fetchDepartments = useCallback(async id => {
		try {
			if (!id) {
				return;
			}
			const rs = await request(
				`${FETCH_DEPARTMENTS_API}?directorate_id=${id}&page=1&per_page=50`
			);
			setDepartments(rs.departments);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	useEffect(() => {
		if (!loaded) {
			if (selectedDeployment) {
				setUnit(selectedDeployment.unit);
				setEmployee(selectedDeployment.employee);
				setDirectorate(selectedDeployment.directorate);
				setDateOfAssumption(selectedDeployment.date_of_assumption);
				setDateOfReturn(selectedDeployment.expected_date_of_return);
				setType(
					deploymentTypes.find(type => type.name === selectedDeployment.type)
				);

				setDepartment(selectedDeployment.department);
			}

			setLoaded(true);
		}
	}, [loaded, selectedDeployment]);

	const onSubmit = async values => {
		try {
			const config = {
				method: selectedDeployment ? 'PUT' : 'POST',
				body: selectedDeployment
					? {
							employee_id: employee.id,
							type: type.id,

							expected_date_of_return: values.expected_date_of_return,
							date_of_assumption: values.date_of_assumption,
							...(type.id === 1 && { deployed_to: values.deployed_to }),
							...(type.id === 3 && { deployed_to: values.deployed_to }),
							...(type.id === 2 && { department_id: values.department_id }),
							deleted_at: undefined,
						}
					: { ...values },
			};
			const apiURL = selectedDeployment
				? UPDATE_EMPLOYEE_DEPLOYMENTS_API.replace(':id', selectedDeployment.id)
				: CREATE_EMPLOYEE_DEPLOYMENTS_API;

			const rs = await request(apiURL, config);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'Could not save Unit' };
		}
	};

	return (
		<ModalWrapper
			title={`${selectedDeployment ? 'Edit' : 'Add'} Deployment`}
			closeModal={closeModal}
		>
			<Form
				initialValues={
					selectedDeployment
						? {
								...selectedDeployment,
								employee_id: selectedDeployment.employee.id,
								type: selectedDeployment.type,
							}
						: {}
				}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					if (!values.employee_id) {
						errors.employee_id = 'select an employee';
					}

					if (!values.type) {
						errors.type = 'select type';
					}
					if (!values.date_of_assumption) {
						errors.date_of_assumption = 'enter assumption date';
					}

					if (values.type === 2 && !values.directorate_id) {
						errors.directorate_id = 'select directorate ';
					}
					// if (!values.expected_date_of_return) {
					// 	errors.expected_date_of_return = 'enter expected date of return';
					// }

					return errors;
				}}
				render={({ handleSubmit, submitError, submitting, form }) => (
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
									<label htmlFor="type" className="form-label">
										Type
									</label>
									<Field id="type" name="type">
										{({ input, meta }) => (
											<Select
												{...input}
												options={deploymentTypes}
												className={error(meta)}
												placeholder="Select Type"
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

								{(type && type.id === 1) || (type && type.id === 3) ? (
									<div className="col-lg-12">
										<label htmlFor="deployed_to" className="form-label">
											Deployed To
										</label>
										<Field id="deployed_to" name="deployed_to">
											{({ input, meta }) => (
												<input
													{...input}
													type="text"
													className={`form-control ${error(meta)}`}
													id="deployed_to"
													placeholder="Enter Deployment"
												/>
											)}
										</Field>
										<ErrorBlock name="deployed_to" />
									</div>
								) : (
									''
								)}

								{type && type.id === 2 ? (
									<>
										<div className="col-lg-12">
											<label className="form-label" htmlFor="directorate_id">
												Directorate <span style={{ color: 'red' }}>*</span>
											</label>
											<Field id="directorate_id" name="directorate_id">
												{({ input, meta }) => (
													<AsyncSelect
														isClearable
														getOptionValue={option => option.id}
														getOptionLabel={option => option.name}
														defaultOptions
														value={directorate}
														className={error(meta)}
														loadOptions={getDirectorates}
														onChange={e => {
															setDirectorate(e);
															e ? input.onChange(e.id) : input.onChange('');
															fetchDepartments(e?.id);
															setDepartments([]);
															setDepartment(null);
															setUnits([]);
															form.change('department_id', undefined);
															form.change('unit', undefined);
														}}
														placeholder="Search directorate"
													/>
												)}
											</Field>
											<ErrorBlock name="directorate_id" />
										</div>

										<div className="col-lg-12">
											<label htmlFor="department_id" className="form-label">
												Department
											</label>
											<Field id="department_id" name="department_id">
												{({ input, meta }) => (
													<Select
														{...input}
														options={departments}
														className={error(meta)}
														placeholder="Select department"
														getOptionValue={option => option.id}
														getOptionLabel={option => option.name}
														value={department}
														onChange={e => {
															setDepartment(e);
															e ? input.onChange(e.id) : input.onChange('');
															if (e && e.id !== department?.id) {
																form.change('unit', undefined);
																fetchUnits(e?.id);
															}
														}}
													/>
												)}
											</Field>
											<ErrorBlock name="department_id" />
										</div>

										<div className="col-lg-12">
											<label className="form-label" htmlFor="unit_id">
												Unit
											</label>
											<Field id="unit_id" name="unit_id">
												{({ input, meta }) => (
													<Select
														{...input}
														options={units}
														className={error(meta)}
														placeholder="Select Type"
														getOptionValue={option => option.id}
														getOptionLabel={option => option.name}
														value={unit}
														onChange={e => {
															setUnit(e);
															e ? input.onChange(e.id) : input.onChange('');
														}}
													/>
												)}
											</Field>
											<ErrorBlock name="unit_id" />
										</div>
									</>
								) : (
									''
								)}

								<div className="col-lg-12">
									<label htmlFor="date_of_assumption" className="form-label">
										Assumption date
									</label>
									<Field id="date_of_assumption" name="date_of_assumption">
										{({ input, meta }) => (
											<Flatpickr
												className={`form-control ${error(meta)}`}
												placeholder="Select date of assumption"
												value={dateOfAssumption}
												defaultValue={dateOfAssumption}
												onChange={([date]) => {
													input.onChange(moment(date).format('YYYY-MM-DD'));
													setDateOfAssumption(date);
												}}
											/>
										)}
									</Field>
									<ErrorBlock name="date_of_assumption" />
								</div>

								<div className="col-lg-12">
									<label
										htmlFor="expected_date_of_return"
										className="form-label"
									>
										Date of return
									</label>
									<Field
										id="expected_date_of_return"
										name="expected_date_of_return"
									>
										{({ input, meta }) => (
											<Flatpickr
												className={`form-control ${error(meta)}`}
												placeholder="Select date of return"
												options={{
													dateFormat: 'd M, Y',
													minDate: new Date(dateOfAssumption),
												}}
												value={dateOfReturn}
												defaultValue={dateOfReturn}
												onChange={([date]) => {
													input.onChange(moment(date).format('YYYY-MM-DD'));
													setDateOfReturn(date);
												}}
											/>
										)}
									</Field>
									<ErrorBlock name="expected_date_of_return" />
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
									{`${selectedDeployment ? 'Update' : 'Add'} Deployment`}
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageEmployeesDeployment;
