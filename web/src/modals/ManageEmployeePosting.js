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
	CREATE_EMPLOYEE_POSTINGS_API,
	FETCH_EMPLOYEES_API,
	FETCH_REGIONS_API,
	FETCH_STATIONS_API,
	UPDATE_EMPLOYEE_POSTINGS_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import { statusTypes } from '../services/constants';

const ManageEmployeePosting = ({ closeModal, update, selectedPosting }) => {
	const [loaded, setLoaded] = useState(false);
	const [dateOfAssumption, setDateOfAssumption] = useState();
	const [dateOfReturn, setDateOfReturn] = useState();
	const [expectedDateOfReturn, setExpectedDateOfReturn] = useState();
	const [employee, setEmployee] = useState(null);
	const [region, setRegion] = useState(null);
	const [station, setStation] = useState(null);

	const [status, setStatus] = useState(null);

	const getEmployees = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_EMPLOYEES_API}?q=${q}`);
		return rs?.employees || [];
	};

	const getRegions = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_REGIONS_API}?q=${q}`);
		return rs?.regions || [];
	};

	const getStations = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_STATIONS_API}?region_id=${region.id}`);
		return rs?.stations || [];
	};

	useEffect(() => {
		if (!loaded) {
			if (selectedPosting) {
				setEmployee(selectedPosting.employee);
				setRegion(selectedPosting.region);
				setStation(selectedPosting.station);
				setDateOfAssumption(selectedPosting.assumption_date);
				setDateOfReturn(selectedPosting.date_of_return);
				setExpectedDateOfReturn(selectedPosting.expected_date_of_return);
				setStatus(
					statusTypes.find(status => status.id === selectedPosting.status)
				);
			}
			setLoaded(true);
		}
	}, [loaded, selectedPosting]);

	const onSubmit = async values => {
		values.expected_date_of_return = expectedDateOfReturn;

		try {
			const config = {
				method: selectedPosting ? 'PUT' : 'POST',
				body: {
					...values,
					posting_type: values.status === 1 ? 0 : 4,
					deleted_at: undefined,
				},
			};
			const uri = selectedPosting
				? UPDATE_EMPLOYEE_POSTINGS_API.replace(':id', selectedPosting.id)
				: CREATE_EMPLOYEE_POSTINGS_API;
			const rs = await request(uri, config);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not create posting' };
		}
	};

	return (
		<ModalWrapper
			title={`${selectedPosting ? 'Edit' : 'Add'} Posting`}
			closeModal={closeModal}
		>
			<Form
				initialValues={
					selectedPosting
						? {
								...selectedPosting,
								employee_id: selectedPosting.employee.id,
								region_id: selectedPosting.region.id,
								station_id: selectedPosting.station.id,
								expectedDateOfReturn: expectedDateOfReturn,
						  }
						: {}
				}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					values.expected_date_of_return = expectedDateOfReturn;

					if (!values.employee_id) {
						errors.employee_id = 'select employee';
					}
					if (!values.status) {
						errors.status = 'select status';
					}

					if (!values.region_id) {
						errors.region_id = 'select region';
					}
					if (!values.station_id) {
						errors.station_id = 'select station';
					}
					if (!values.designation_at_post) {
						errors.designation_at_post = 'enter designation at post';
					}
					if (!values.assumption_date) {
						errors.assumption_date = 'enter assumption date';
					}

					return errors;
				}}
				render={({ handleSubmit, submitError, submitting }) => (
					<FormWrapper onSubmit={handleSubmit} submitting={submitting}>
						<div className="modal-body">
							<FormSubmitError error={submitError} />
							<div className="row g-3">
								{selectedPosting === null ||
								selectedPosting?.posting_type === null ? (
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
								) : (
									''
								)}

								{selectedPosting === null ||
								selectedPosting?.posting_type === null ||
								selectedPosting?.posting_type === 3 ? (
									<div className="col-lg-12">
										<label htmlFor="region" className="form-label">
											Region
										</label>
										<Field id="region_id" name="region_id">
											{({ input, meta }) => (
												<AsyncSelect
													isClearable
													getOptionValue={option => option.id}
													getOptionLabel={option => option.name}
													defaultOptions
													value={region}
													className={error(meta)}
													loadOptions={getRegions}
													onChange={e => {
														setRegion(e);
														e ? input.onChange(e.id) : input.onChange('');
													}}
													placeholder="Search regions"
												/>
											)}
										</Field>
										<ErrorBlock name="region_id" />
									</div>
								) : (
									''
								)}
								{selectedPosting === null ||
								selectedPosting?.posting_type === null ||
								selectedPosting?.posting_type === 3 ? (
									<div className="col-lg-12">
										<label htmlFor="station" className="form-label">
											Station
										</label>
										<Field id="station_id" name="station_id">
											{({ input, meta }) => (
												<AsyncSelect
													isClearable
													getOptionValue={option => option.id}
													getOptionLabel={option => option.name}
													defaultOptions
													value={station}
													className={error(meta)}
													loadOptions={getStations}
													onChange={e => {
														setStation(e);
														e ? input.onChange(e.id) : input.onChange('');
													}}
													placeholder="Search stations"
												/>
											)}
										</Field>
										<ErrorBlock name="station_id" />
									</div>
								) : (
									''
								)}

								{selectedPosting === null ||
								selectedPosting?.posting_type === null ||
								selectedPosting?.posting_type === 3 ? (
									<div className="col-lg-12">
										<label htmlFor="designation_at_post" className="form-label">
											Designation at post
										</label>
										<Field id="designation_at_post" name="designation_at_post">
											{({ input, meta }) => (
												<input
													{...input}
													type="text"
													className={`form-control ${error(meta)}`}
													id="designation_at_post"
													placeholder="Enter designation at post"
												/>
											)}
										</Field>
										<ErrorBlock name="designation_at_post" />
									</div>
								) : (
									''
								)}
								{selectedPosting === null ||
								selectedPosting?.posting_type === null ||
								selectedPosting?.posting_type === 3 ? (
									<div className="col-lg-12">
										<label htmlFor="assumption_date" className="form-label">
											Assumption date
										</label>
										<Field id="assumption_date" name="assumption_date">
											{({ input, meta }) => (
												<Flatpickr
													options={{
														dateFormat: 'd M, Y',
													}}
													className={`form-control ${error(meta)}`}
													placeholder="Select date of assumption"
													value={dateOfAssumption}
													defaultValue={dateOfAssumption}
													onChange={([date]) => {
														input.onChange(moment(date).format('YYYY-MM-DD'));
														setDateOfAssumption(date);

														const dateValue = moment(date).add(3, 'years');
														const formattedDate = `${dateValue.format(
															'YYYY-MM-DD'
														)}`;

														setExpectedDateOfReturn(formattedDate);
													}}
												/>
											)}
										</Field>
										<ErrorBlock name="assumption_date" />
									</div>
								) : (
									''
								)}
								{selectedPosting === null ||
								selectedPosting?.posting_type === null ||
								selectedPosting?.posting_type === 3 ? (
									<div className="col-lg-12">
										<label htmlFor="status" className="form-label">
											Status
										</label>
										<Field id="status" name="status">
											{({ input, meta }) => (
												<Select
													{...input}
													options={statusTypes}
													className={error(meta)}
													placeholder="Select posting status"
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
								) : (
									''
								)}
								{status && status.id !== 2 ? (
									<div className="col-lg-12">
										<label
											htmlFor="expected_date_of_return"
											className="form-label"
										>
											Expected date of return
										</label>
										<Field
											id="expected_date_of_return"
											name="expected_date_of_return"
										>
											{({ input, meta }) => (
												<Flatpickr
													className={`form-control ${error(meta)}`}
													placeholder="Select expected date of return"
													options={{
														minDate: new Date(dateOfAssumption),
													}}
													value={expectedDateOfReturn}
													defaultValue={expectedDateOfReturn}
													onChange={([date]) => {
														input.onChange(moment(date).format('YYYY-MM-DD'));
														setExpectedDateOfReturn(date);
													}}
												/>
											)}
										</Field>
										<ErrorBlock name="expected_date_of_return" />
									</div>
								) : (
									''
								)}
								{status && status.id === 2 ? (
									<div className="col-lg-12">
										<label htmlFor="date_of_return" className="form-label">
											Date of return
										</label>
										<Field id="date_of_return" name="date_of_return">
											{({ input, meta }) => (
												<Flatpickr
													className={`form-control ${error(meta)}`}
													defaultValue={dateOfReturn}
													options={{
														dateFormat: 'd M, Y',
														minDate: new Date(dateOfAssumption),
													}}
													placeholder="Select date of return"
													value={dateOfReturn}
													onChange={([date]) => {
														input.onChange(moment(date).format('YYYY-MM-DD'));
														setDateOfReturn(date);
													}}
												/>
											)}
										</Field>
										<ErrorBlock name="date_of_return" />
									</div>
								) : (
									''
								)}
							</div>
						</div>
						<div className="modal-footer">
							<div className="hstack gap-2 justify-content-end">
								<button
									type="submit"
									className="btn btn-success"
									disabled={submitting}
								>
									{`${selectedPosting ? 'Update' : 'Add'} Posting`}
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageEmployeePosting;
