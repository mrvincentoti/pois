import React, { useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import AsyncSelect from 'react-select/async';

import ModalWrapper from '../container/ModalWrapper';
import {
	formatEmployeeName,
	notifyWithIcon,
	request,
} from '../services/utilities';
import {
	CREATE_EMPLOYEE_CONFERENCE_API,
	FETCH_EMPLOYEES_API,
	FETCH_CONFERENCES_API,
	UPDATE_EMPLOYEE_CONFERENCE_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';
import Flatpickr from 'react-flatpickr';
import moment from 'moment/moment';

const ManageEmployeeConference = ({
	closeModal,
	update,
	employeeConference,
}) => {
	const [loaded, setLoaded] = useState(false);
	const [employee, setEmployee] = useState(null);
	const [conference, setConference] = useState(null);
	const [dateAttended, setDateAttended] = useState(null);

	useEffect(() => {
		if (!loaded) {
			if (employeeConference) {
				setEmployee(employeeConference.employee);
				setConference(employeeConference.conference);
				setDateAttended(new Date(employeeConference.date_attended));
			}
			setLoaded(true);
		}
	}, [employeeConference, loaded]);

	const getEmployees = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_EMPLOYEES_API}?q=${q}`);
		return rs?.employees || [];
	};

	const getConferences = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_CONFERENCES_API}?q=${q}`);
		return rs?.conferences || [];
	};

	const onSubmit = async values => {
		try {
			const config = {
				method: employeeConference ? 'PUT' : 'POST',
				body: {
					...values,
					employee: undefined,
					conference: undefined,
					deleted_at: undefined,
				},
			};
			const uri = employeeConference
				? UPDATE_EMPLOYEE_CONFERENCE_API.replace(
						':employee_id',
						employeeConference.employee_id
					).replace(':id', employeeConference.id)
				: CREATE_EMPLOYEE_CONFERENCE_API;
			const rs = await request(uri, config);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			return {
				[FORM_ERROR]: e.message || 'could not create employee conference',
			};
		}
	};

	return (
		<ModalWrapper
			title={`${employeeConference ? 'Edit' : 'Add'} Conference`}
			closeModal={closeModal}
		>
			<Form
				initialValues={
					employeeConference
						? {
								...employeeConference,
								employee_id: employeeConference.employee.id,
								conference_id: employeeConference.conference.id,
								dateAttended: employeeConference.date_attended,
							}
						: {}
				}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					if (!values.employee_id) {
						errors.employee_id = 'select employee';
					}
					if (!values.conference_id) {
						errors.conference_id = 'select conference';
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
									<label htmlFor="conference_id" className="form-label">
										Conference
									</label>
									<Field id="conference_id" name="conference_id">
										{({ input, meta }) => (
											<AsyncSelect
												isClearable
												getOptionValue={option => option.id}
												getOptionLabel={option => option.name}
												defaultOptions
												value={conference}
												className={error(meta)}
												loadOptions={getConferences}
												onChange={e => {
													setConference(e);
													e ? input.onChange(e.id) : input.onChange('');
												}}
												placeholder="Search conference"
											/>
										)}
									</Field>
									<ErrorBlock name="conference_id" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="date_attended" className="form-label">
										Date attended
									</label>
									<Field id="date_attended" name="date_attended">
										{({ input, meta }) => (
											<Flatpickr
												className={`form-control ${error(meta)}`}
												placeholder="Select Date attended"
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
							</div>
						</div>
						<div className="modal-footer">
							<div className="hstack gap-2 justify-content-end">
								<button
									type="submit"
									className="btn btn-success"
									disabled={submitting}
								>
									Save Conference
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageEmployeeConference;
