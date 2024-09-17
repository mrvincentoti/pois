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
	CREATE_EMPLOYEE_SANCTION_API,
	FETCH_EMPLOYEES_API,
	FETCH_IMPLICATIONS_API,
	FETCH_SANCTIONS_API,
	UPDATE_EMPLOYEE_SANCTION_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';

import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import { hasImplications } from '../services/constants';

const ManageEmployeeSanction = ({ closeModal, update, employeeSanction }) => {
	const [loaded, setLoaded] = useState(false);
	const [employee, setEmployee] = useState(null);
	const [sanction, setSanction] = useState(null);
	const [implication, setImplication] = useState(null);
	const [type, setType] = useState(null);
	const [dateGiven, setDateGiven] = useState(null);

	useEffect(() => {
		if (!loaded) {
			if (employeeSanction) {
				setType(employeeSanction.type);
				setDateGiven(employeeSanction.date_given);
				setImplication(employeeSanction.implication);
				setEmployee(employeeSanction.employee);
				setSanction(employeeSanction.sanction);
			}
			setLoaded(true);
		}
	}, [employeeSanction, loaded]);

	const [hasImplication, setHasImplication] = useState([
		{ id: 1, name: 'No Action' },
		{ id: 2, name: 'Has Action' },
	]);
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

		const rs = await request(`${FETCH_IMPLICATIONS_API}?type=${2}`);
		return rs?.implications || [];
	};

	const getSanctions = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_SANCTIONS_API}?q=${q}`);
		return rs?.sanctions || [];
	};

	const onSubmit = async values => {
		console.log(values);
		try {
			const config = {
				method: employeeSanction ? 'PUT' : 'POST',
				body: {
					...values,
					employee: undefined,
					sanction: undefined,
					deleted_at: undefined,
				},
			};
			const uri = employeeSanction
				? UPDATE_EMPLOYEE_SANCTION_API.replace(
						':employee_id',
						employeeSanction.employee_id
				  ).replace(':id', employeeSanction.id)
				: CREATE_EMPLOYEE_SANCTION_API;
			const rs = await request(uri, config);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			return {
				[FORM_ERROR]: e.message || 'could not create employee sanction',
			};
		}
	};

	function removeImplication(employeeSanction) {}

	return (
		<ModalWrapper
			title={`${employeeSanction ? 'Edit' : 'Add'} Sanction`}
			closeModal={closeModal}
		>
			<Form
				initialValues={
					employeeSanction
						? {
								...employeeSanction,
								employee_id: employeeSanction.employee.id,
								sanction_id: employeeSanction.sanction.id,
								implication_id: employeeSanction.implication_id,
						  }
						: {}
				}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					if (!values.employee_id) {
						errors.employee_id = 'select employee';
					}
					if (!values.sanction_id) {
						errors.sanction_id = 'select sanction';
					}
					if (values.type === 2 && !values.implication_id) {
						errors.implication_id = 'select implication';
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
									<label htmlFor="sanction_id" className="form-label">
										Sanction
									</label>
									<Field id="sanction_id" name="sanction_id">
										{({ input, meta }) => (
											<AsyncSelect
												isClearable
												getOptionValue={option => option.id}
												getOptionLabel={option => option.name}
												defaultOptions
												value={sanction}
												className={error(meta)}
												loadOptions={getSanctions}
												onChange={e => {
													setSanction(e);
													e ? input.onChange(e.id) : input.onChange('');
												}}
												placeholder="Search sanction"
											/>
										)}
									</Field>
									<ErrorBlock name="sanction_id" />
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
													employeeSanction && employeeSanction.type.id === 2
												}
												options={hasImplication}
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
														employeeSanction && employeeSanction.type.id === 2
													}
													className={error(meta)}
													loadOptions={getImplications}
													onChange={e => {
														setImplication(e);
														e ? input.onChange(e.id) : input.onChange('');
													}}
													placeholder="Search implication"
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
												placeholder="Select date of sanction"
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
									{`${employeeSanction ? 'Update' : 'Add'} Sanction`}
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageEmployeeSanction;
