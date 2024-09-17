import React, { useCallback, useEffect, useState } from 'react';
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
	CREATE_UNIT_API,
	FETCH_DEPARTMENTS_API, FETCH_DIRECTORATES_API,
	FETCH_EMPLOYEES_API,
	UPDATE_UNIT_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';
import Select from 'react-select';

const ManageUnit = ({ closeModal, update, selectedUnit }) => {
	const [loaded, setLoaded] = useState(false);
	const [departments, setDepartments] = useState([]);
	const [department, setDepartment] = useState(null);



	const loadDepartments = useCallback(async () => {
		try {
			const rs = await request(FETCH_DEPARTMENTS_API);
			console.log("hmm")
			console.log(rs.departments)
			setDepartments(rs.departments);
		} catch (e) {
			notifyWithIcon('error', e.message);
		}
	}, []);

	useEffect(() => {
		console.log("hello")
		if (!loaded) {
			if (selectedUnit) {
				setDepartment(selectedUnit.department);
			}

			loadDepartments().then(_ => setLoaded(true));

		}
	}, [loaded, selectedUnit, loadDepartments]);

	const onSubmit = async values => {
		try {
			const config = {
				method: selectedUnit ? 'PUT' : 'POST',
				body: { ...values },
			};
			const apiURL = selectedUnit
				? UPDATE_UNIT_API.replace(':id', selectedUnit.id)
				: CREATE_UNIT_API;

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
			title={`${selectedUnit ? 'Edit' : 'Add'} Unit`}
			closeModal={closeModal}
		>
			<Form
				initialValues={
					selectedUnit
						? { ...selectedUnit, department_id: selectedUnit.department.id }
						: {}
				}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					if (!values.name) {
						errors.name = 'enter unit';
					}
					if (!values.department_id) {
						errors.department_id = 'select department';
					}
					if (!values.description) {
						errors.description = 'enter description';
					}

					return errors;
				}}
				render={({ handleSubmit, submitError, submitting }) => (
					<FormWrapper onSubmit={handleSubmit} submitting={submitting}>
						<div className="modal-body">
							<FormSubmitError error={submitError} />
							<div className="row g-3">
								<div className="col-lg-12">
									<label htmlFor="name" className="form-label">
										Units
									</label>
									<Field id="name" name="name">
										{({ input, meta }) => (
											<input
												{...input}
												type="name"
												className={`form-control ${error(meta)}`}
												id="name"
												placeholder="Enter unit"
											/>
										)}
									</Field>
									<ErrorBlock name="name" />
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
												}}
											/>
										)}
									</Field>
									<ErrorBlock name="department_id" />
								</div>
								<div className="col-lg-12">
									<label htmlFor="description" className="form-label">
										Description
									</label>
									<Field id="description" name="description">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												id="description"
												placeholder="Enter description"
											/>
										)}
									</Field>
									<ErrorBlock name="description" />
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
									Save Unit
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageUnit;
