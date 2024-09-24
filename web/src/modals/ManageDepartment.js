import React, { useCallback, useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';

import ModalWrapper from '../container/ModalWrapper';
import { notifyWithIcon, request } from '../services/utilities';
import {
	CREATE_DEPARTMENTS_API,
	FETCH_DIRECTORATES_API,
	UPDATE_DEPARTMENTS_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';
import Select from 'react-select';

const ManageDepartment = ({ closeModal, update, selectedDepartment }) => {
	const [loaded, setLoaded] = useState(false);
	const [directorates, setDirectorates] = useState([]);
	const [directorate, setDirectorate] = useState(null);

	const loadDirectorates = useCallback(async () => {
		try {
			const rs = await request(FETCH_DIRECTORATES_API);
			setDirectorates(rs.directorates);
		} catch (e) {
			notifyWithIcon('error', e.message);
		}
	}, []);

	useEffect(() => {
		if (!loaded) {
			if (selectedDepartment) {
				setDirectorate(selectedDepartment.directorate);
			}

			loadDirectorates().then(_ => setLoaded(true));
		}
		if (!loaded) {
		}
	}, [loadDirectorates, loaded, selectedDepartment]);

	const onSubmit = async values => {
		try {
			const config = {
				method: selectedDepartment ? 'PUT' : 'POST',
				body: { ...values },
			};
			const apiURL = selectedDepartment
				? UPDATE_DEPARTMENTS_API.replace(':id', selectedDepartment.id)
				: CREATE_DEPARTMENTS_API;

			const rs = await request(apiURL, config);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'Could not save Department' };
		}
	};

	return (
		<ModalWrapper
			title={`${selectedDepartment ? 'Update' : 'Add'} Department`}
			closeModal={closeModal}
		>
			<Form
				initialValues={
					selectedDepartment
						? {
								...selectedDepartment,
								directorate_id: selectedDepartment.directorate_id,
							}
						: {}
				}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					if (!values.name) {
						errors.name = 'enter name';
					}
					if (!values.directorate_id) {
						errors.directorate_id = 'select directorate';
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
									<label htmlFor="email" className="form-label">
										Department
									</label>
									<Field id="name" name="name">
										{({ input, meta }) => (
											<input
												{...input}
												type="name"
												className={`form-control ${error(meta)}`}
												id="name"
												placeholder="Enter name"
											/>
										)}
									</Field>
									<ErrorBlock name="name" />
								</div>
								<div className="col-lg-12">
									<label htmlFor="directorate_id" className="form-label">
										Directorate
									</label>
									<Field id="directorate_id" name="directorate_id">
										{({ input, meta }) => (
											<Select
												{...input}
												options={directorates}
												className={error(meta)}
												placeholder="Select directorate"
												getOptionValue={option => option.id}
												getOptionLabel={option => option.name}
												value={directorate}
												onChange={e => {
													setDirectorate(e);
													e ? input.onChange(e.id) : input.onChange('');
												}}
											/>
										)}
									</Field>
									<ErrorBlock name="directorate_id" />
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
									Save Department
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageDepartment;
