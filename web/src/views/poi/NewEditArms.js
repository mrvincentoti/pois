import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Field } from 'react-final-form';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import {
	FETCH_ARMS_API,
	FETCH_CRIMES_API,
	CREATE_ARMS_RECOVERED_API,
	UPDATE_ARMS_RECOVERED_API,
} from '../../services/api';
import { notifyWithIcon, request } from '../../services/utilities';
import ModalWrapper from '../../container/ModalWrapper';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import { FORM_ERROR } from 'final-form';
import Select from 'react-select';

const NewEditArms = ({ closeModal, data, update }) => {
	const [recoveryDate, setRecoveryDate] = useState(null);
	const [comments, setComments] = useState(null);
	const [arms, setArms] = useState('');
	const [armsOptions, setArmsOptions] = useState([]);
	const [crime, setCrime] = useState(null);
	const [crimesOptions, setCrimesOptions] = useState([]);
	const params = useParams();

	// Populate fields when editing an existing activity
	useEffect(() => {
		if (data) {
			setRecoveryDate(moment(data.recovery_date).toDate());
			setComments(data.comments);
			// Set selected crime when editing
			if (data.crime_id) {
				const selectedCrime = crimesOptions.find(
					option => option.id === data.crime_id
				);
				setCrime(selectedCrime);
			}
		} else {
			setComments(null);
			setCrime(null);
		}
		loadArms();
		loadCrimes();
	}, [data]);

	const loadArms = async () => {
		const rs = await request(FETCH_ARMS_API);
		setArmsOptions(rs?.arms || []);
	};

	const loadCrimes = async () => {
		const rs = await request(FETCH_CRIMES_API);
		setCrimesOptions(rs?.crimes || []);
		// If we have existing crime data, set it after options are loaded
		if (data && data.crime_id) {
			const selectedCrime = rs.crimes.find(
				option => option.id === data.crime_id
			);
			setCrime(selectedCrime);
		}
	};

	const onSubmit = async (values, form) => {
		try {
			const config = {
				method: data ? 'PUT' : 'POST',
				body: {
					...values,
					poi_id: params.id,
					comment: values.comment ? values.comment.trim() : null,
				},
			};
			const uri = data
				? `${UPDATE_ARMS_RECOVERED_API}/${data.id}`
				: CREATE_ARMS_RECOVERED_API;
			const rs = await request(uri, config);
			notifyWithIcon('success', rs.message);
			Object.keys(values).forEach(key => {
				form.change(key, undefined);
			});
			update();
			closeModal();
		} catch (e) {
			return {
				[FORM_ERROR]: e.message || 'Something went wrong',
			};
		}
	};

	return (
		<ModalWrapper
			title={`${data ? 'Edit' : 'Add'} Arms Recovered`}
			closeModal={closeModal}
		>
			<Form
				initialValues={{
					arm_id: data ? data.arm_id : '',
					crime_id: data ? data.crime_id : '', // Set initial value for crime_id
					recovery_date: data
						? moment(data.recovery_date).format('YYYY-MM-DD')
						: '',
					number_recovered: data ? data.number_recovered : '',
					location: data ? data.location : '',
					comments: data ? data.comments : '',
					poi_id: params.id,
				}}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					if (!values.arm_id) {
						errors.arm_id = 'Arm is required';
					}
					// if (!values.crime_id) {
					//     errors.crime_id = 'Crime is required';
					// }
					if (!values.number_recovered) {
						errors.number_recovered = 'Number Recovered is required';
					}
					if (!values.location) {
						errors.location = 'Location is required';
					}
					if (!values.recovery_date) {
						errors.recovery_date = 'Recovery Date is required';
					}
					return errors;
				}}
				render={({ handleSubmit, submitError, submitting }) => (
					<FormWrapper onSubmit={handleSubmit} submitting={submitting}>
						<div className="modal-body">
							<FormSubmitError error={submitError} />
							<div className="row g-3">
								<div className="col-lg-12">
									<label htmlFor="arm_id" className="form-label">
										Arm
									</label>
									<Field id="arm_id" name="arm_id">
										{({ input, meta }) => (
											<Select
												isClearable
												getOptionValue={option => option.id}
												getOptionLabel={option => option.name}
												options={armsOptions}
												value={
													Array.isArray(armsOptions)
														? armsOptions.find(
																option => option.id === input.value
															)
														: null
												}
												className={error(meta)}
												onChange={e => {
													setArms(e);
													e ? input.onChange(e.id) : input.onChange('');
												}}
												placeholder="Select arm"
											/>
										)}
									</Field>
									<ErrorBlock name="arm_id" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="crime_id" className="form-label">
										Crime
									</label>
									<Field id="crime_id" name="crime_id">
										{({ input, meta }) => (
											<Select
												isClearable
												getOptionValue={option => option.id}
												getOptionLabel={option => option.name}
												options={crimesOptions}
												value={crime} // Ensure crime is set here when editing
												className={error(meta)}
												onChange={e => {
													setCrime(e);
													e ? input.onChange(e.id) : input.onChange('');
												}}
												placeholder="Select crime"
											/>
										)}
									</Field>
									<ErrorBlock name="crime_id" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="number_recovered" className="form-label">
										Number Recovered
									</label>
									<Field id="number_recovered" name="number_recovered">
										{({ input, meta }) => (
											<input
												{...input}
												className={`form-control ${error(meta)}`}
												placeholder="Number Recovered"
											/>
										)}
									</Field>
									<ErrorBlock name="number_recovered" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="location" className="form-label">
										Location
									</label>
									<Field id="location" name="location">
										{({ input, meta }) => (
											<input
												{...input}
												className={`form-control ${error(meta)}`}
												placeholder="Location"
											/>
										)}
									</Field>
									<ErrorBlock name="location" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="recovery_date" className="form-label">
										Recovery Date
									</label>
									<Field id="recovery_date" name="recovery_date">
										{({ input, meta }) => (
											<Flatpickr
												className={`form-control ${error(meta)}`}
												placeholder="Select date of recovery"
												value={recoveryDate}
												onChange={([date]) => {
													input.onChange(moment(date).format('YYYY-MM-DD'));
													setRecoveryDate(date);
												}}
											/>
										)}
									</Field>
									<ErrorBlock name="recovery_date" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="comments" className="form-label">
										Comment
									</label>
									<Field id="comments" name="comments">
										{({ input, meta }) => (
											<textarea
												{...input}
												className={`form-control ${error(meta)}`}
												placeholder="Type your comment here"
											/>
										)}
									</Field>
									<ErrorBlock name="comments" />
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
									{`${data ? 'Update' : 'Add'}`}
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default NewEditArms;
