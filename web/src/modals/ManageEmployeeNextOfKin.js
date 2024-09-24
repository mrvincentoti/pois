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
	CREATE_EMPLOYEE_NEXT_OF_KIN_API,
	FETCH_EMPLOYEES_API,
	UPDATE_EMPLOYEE_NEXT_OF_KIN_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import { dependentStatus, nextOfKinCategory } from '../services/constants';
// import { dependentStatus, dependentTypes } from '../services/constants';

const ManageEmployeeNextOfKin = ({ closeModal, update, selectedNok }) => {
	const [loaded, setLoaded] = useState(false);
	const [employee, setEmployee] = useState(null);
	const [category, setCategory] = useState(null);

	const getEmployees = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_EMPLOYEES_API}?q=${q}`);
		return rs?.employees || [];
	};

	useEffect(() => {
		if (!loaded) {
			if (selectedNok) {
				setCategory(
					nextOfKinCategory.find(
						category => category.id === selectedNok.category_id
					)
				);
				console.log('employee');
				setEmployee(selectedNok.employee);
			}
			setLoaded(true);
		}
	}, [loaded, selectedNok]);

	const onSubmit = async values => {
		console.log('values');
		console.log(values);

		try {
			const { employee, ...restValues } = values;
			const config = {
				method: selectedNok ? 'PUT' : 'POST',
				body: {
					...restValues,
				},
			};
			const uri = selectedNok
				? UPDATE_EMPLOYEE_NEXT_OF_KIN_API.replace(':id', selectedNok.id)
				: CREATE_EMPLOYEE_NEXT_OF_KIN_API.replace(':id', values.employee_id);
			const rs = await request(uri, config);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not create Next of kin' };
		}
	};

	return (
		<ModalWrapper
			title={`${selectedNok ? 'Edit' : 'Add'} Next of kin`}
			closeModal={closeModal}
		>
			<Form
				initialValues={
					selectedNok
						? {
								...selectedNok,
								employee_id: selectedNok?.employee?.id,
							}
						: {}
				}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					if (!values.employee_id) {
						errors.employee_id = 'select employee';
					}
					if (!values.firstname) {
						errors.firstname = 'select first name';
					}
					if (!values.lastname) {
						errors.lastname = 'select last name';
					}
					if (!values.address) {
						errors.address = 'enter address';
					}
					if (!values.relationship) {
						errors.relationship = 'enter relationship';
					}
					if (!values.category_id) {
						errors.category_id = 'enter category';
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
									<label htmlFor="category_id" className="form-label">
										Category
									</label>
									<Field id="category_id" name="category_id">
										{({ input, meta }) => (
											<Select
												{...input}
												options={nextOfKinCategory}
												className={error(meta)}
												placeholder="Select Next of Kin Category"
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

								<div className="col-lg-12">
									<label htmlFor="firstname" className="form-label">
										First Name
									</label>
									<Field id="firstname" name="firstname">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												id="firstname"
												placeholder="Enter Next of kin first name"
											/>
										)}
									</Field>
									<ErrorBlock name="next of kin first name" />
								</div>
								<div className="col-lg-12">
									<label htmlFor="lastname" className="form-label">
										Last Name
									</label>
									<Field id="lastname" name="lastname">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												id="lastname"
												placeholder="Enter Next of kin last name"
											/>
										)}
									</Field>
									<ErrorBlock name="next of kin first name" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="phone" className="form-label">
										Phone
									</label>
									<Field id="phone" name="phone">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												id="phone"
												placeholder="Enter Phone"
											/>
										)}
									</Field>
									<ErrorBlock name="phone" />
								</div>
								<div className="col-lg-12">
									<label htmlFor="email" className="form-label">
										Email
									</label>
									<Field id="email" name="email">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												id="email"
												placeholder="Enter email"
											/>
										)}
									</Field>
									<ErrorBlock name="email" />
								</div>
								<div className="col-lg-12">
									<label htmlFor="address" className="form-label">
										Address
									</label>
									<Field id="address" name="address">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												id="address"
												placeholder="Enter address"
											/>
										)}
									</Field>
									<ErrorBlock name="address" />
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
												id="relationship"
												placeholder="Enter relationship"
											/>
										)}
									</Field>
									<ErrorBlock name="relationship" />
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
									{`${selectedNok ? 'Update' : 'Add'} Next Of Kin`}
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageEmployeeNextOfKin;
