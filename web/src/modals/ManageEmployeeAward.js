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
	CREATE_EMPLOYEE_AWARD_API,
	FETCH_EMPLOYEES_API,
	FETCH_IMPLICATIONS_API,
	FETCH_AWARDS_API,
	UPDATE_EMPLOYEE_AWARD_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';

import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import { hasImplications } from '../services/constants';

const ManageEmployeeAward = ({ closeModal, update, employeeAward }) => {
	const [loaded, setLoaded] = useState(false);
	const [employee, setEmployee] = useState(null);
	const [award, setAward] = useState(null);
	const [implication, setImplication] = useState(null);
	const [type, setType] = useState(null);
	const [dateGiven, setDateGiven] = useState(null);

	useEffect(() => {
		if (!loaded) {
			if (employeeAward) {
				setType(employeeAward.type);
				setDateGiven(employeeAward.date_given);
				setImplication(employeeAward.implication);
				setEmployee(employeeAward.employee);
				setAward(employeeAward.award);
			}
			setLoaded(true);
		}
	}, [employeeAward, loaded]);

	const getEmployees = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_EMPLOYEES_API}?q=${q}`);
		return rs?.employees || [];
	};

	const getImplications = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_IMPLICATIONS_API}?type=${1}`);
		return rs?.implications || [];
	};

	const getAwards = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_AWARDS_API}?q=${q}`);
		return rs?.awards || [];
	};

	const onSubmit = async values => {
		try {
			const config = {
				method: employeeAward ? 'PUT' : 'POST',
				body: {
					...values,
					employee: undefined,
					award: undefined,
					deleted_at: undefined,
				},
			};
			const uri = employeeAward
				? UPDATE_EMPLOYEE_AWARD_API.replace(
						':employee_id',
						employeeAward.employee_id
					).replace(':id', employeeAward.id)
				: CREATE_EMPLOYEE_AWARD_API;
			const rs = await request(uri, config);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			return {
				[FORM_ERROR]: e.message || 'could not create employee Award',
			};
		}
	};

	return (
		<ModalWrapper
			title={`${employeeAward ? 'Edit' : 'Add'} Award`}
			closeModal={closeModal}
		>
			<Form
				initialValues={
					employeeAward
						? {
								...employeeAward,
								employee_id: employeeAward.employee.id,
								award_id: employeeAward.award.id,
								implication_id: employeeAward.implication_id,
							}
						: {}
				}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					if (!values.employee_id) {
						errors.employee_id = 'select employee';
					}
					if (!values.award_id) {
						errors.award_id = 'select award';
					}
					if (values.type === 2 && !values.implication_id) {
						errors.implication_id = 'select implication';
					}
					if (!values.reason) {
						errors.reason = 'select reason';
					}
					if (!values.date_given) {
						errors.date_given = 'select date_given';
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
									<label htmlFor="award_id" className="form-label">
										Award
									</label>
									<Field id="award_id" name="award_id">
										{({ input, meta }) => (
											<AsyncSelect
												isClearable
												getOptionValue={option => option.id}
												getOptionLabel={option => option.name}
												defaultOptions
												value={award}
												className={error(meta)}
												loadOptions={getAwards}
												onChange={e => {
													setAward(e);
													e ? input.onChange(e.id) : input.onChange('');
												}}
												placeholder="Search award"
											/>
										)}
									</Field>
									<ErrorBlock name="award_id" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="type" className="form-label">
										Type
									</label>
									<Field id="type" name="type">
										{({ input, meta }) => (
											<Select
												{...input}
												isDisabled={
													employeeAward && employeeAward.type.id === 2
												}
												options={hasImplications}
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

								{type && type.id === 2 ? (
									<div className="col-lg-12">
										<label htmlFor="implication_id" className="form-label">
											Action
										</label>
										<Field id="implication_id" name="implication_id">
											{({ input, meta }) => (
												<AsyncSelect
													isClearable
													getOptionValue={option => option.id}
													getOptionLabel={option => option.name}
													defaultOptions
													value={implication}
													isDisabled={
														employeeAward && employeeAward.type.id === 2
													}
													className={error(meta)}
													loadOptions={getImplications}
													onChange={e => {
														setImplication(e);
														e ? input.onChange(e.id) : input.onChange('');
													}}
													placeholder="Search Action"
												/>
											)}
										</Field>
										<ErrorBlock name="implication_id" />
									</div>
								) : (
									''
								)}

								<div className="col-lg-12">
									<label htmlFor="reason" className="form-label">
										Reason
									</label>
									<Field id="reason" name="reason">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												id="reason"
												placeholder="reason"
											/>
										)}
									</Field>
									<ErrorBlock name="reason" />
								</div>
								<div className="col-lg-12">
									<label htmlFor="date_given" className="form-label">
										Date Given
									</label>
									<Field id="date_given" name="date_given">
										{({ input, meta }) => (
											<Flatpickr
												className={`form-control ${error(meta)}`}
												placeholder="Select date of award"
												value={dateGiven}
												defaultValue={dateGiven}
												onChange={([date]) => {
													input.onChange(moment(date).format('YYYY-MM-DD'));
													setDateGiven(date);
												}}
											/>
										)}
									</Field>
									<ErrorBlock name="date_given" />
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
									{`${employeeAward ? 'Update' : 'Add'} Award`}
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageEmployeeAward;
