import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import Select from 'react-select';
import ModalWrapper from '../container/ModalWrapper';
import { notifyWithIcon, request } from '../services/utilities';
import {
	CREATE_CRIMES_COMMITTED_API,
	FETCH_ARMS_API,
	CREATE_ARMS_RECOVERED_API,
	UPDATE_ARMS_RECOVERED_API,
	FETCH_CRIMES_API,
	UPDATE_CRIMES_COMMITTED_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';

const ManageArmsRecovered = ({ closeModal, update, armsRecovered, crimeCommitted }) => {	
	const [loaded, setLoaded] = useState(false);
	const [crime, setCrime] = useState(null);
	const [crimesOptions, setCrimesOptions] = useState([]);
	const [arms, setArms] = useState(null);
	const [armsOptions, setArmsOptions] = useState([]);
	const [crimeDate, setCrimeDate] = useState(null);
	const [casualties, setCasualties] = useState(null);
	const [detention, setDetention] = useState(null);
	const [actionTaken, setActionTaken] = useState(null);
	const [recoveryDate, setRecoveryDate] = useState(null);
	const [comments, setComments] = useState(null);
	const params = useParams();

	useEffect(() => {		
		if (!loaded) {
			if (armsRecovered) {
				setCrime(armsRecovered.crime);
				setArms(armsRecovered.arms);
				setRecoveryDate(moment(armsRecovered.recovery_date).toDate());
				setComments(armsRecovered.comments);
			} else {
				// setActivityDate(null);
				setComments(null);
			}
			loadCrimes();
			loadArms();
			setLoaded(true);		
		}
	}, [armsRecovered, loaded, crimeCommitted]);

	const loadCrimes = async () => {
		const rs = await request(FETCH_CRIMES_API);
		setCrimesOptions(rs?.crimes || []);
	};
	const loadArms = async () => {
		const rs = await request(FETCH_ARMS_API);
		setArmsOptions(rs?.arms || []);
	};

	const onSubmit = async values => {
		try {
			const crime_id = crimeCommitted?.id;
			const poi_id = crime_id ? undefined : parseInt(params?.id, 10);

			const config = {
				method: armsRecovered ? 'PUT' : 'POST',
				body: {
					...values,
					poi_id: params?.id,
					crime_id: crimeCommitted?.id,
					crime: undefined,
					deleted_at: undefined,
					comment: values.comment ? values.comment.trim() : null,
				},
			};

			const uri = armsRecovered
				? UPDATE_ARMS_RECOVERED_API.replace(':id', armsRecovered.id)
				: CREATE_ARMS_RECOVERED_API;

			const rs = await request(uri, config);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			console.error(e);
			const errorMessage = e.message || 'Something went wrong';
			return {
				[FORM_ERROR]: errorMessage,
			};
		}
	};


	return (
		<ModalWrapper
			title={`${armsRecovered ? 'Edit' : 'Add'} Arms Recovered`}
			closeModal={closeModal}
		>
			<Form
				initialValues={armsRecovered}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					return errors;
				}}
				render={({ handleSubmit, submitError, submitting }) => (
					<FormWrapper onSubmit={handleSubmit} submitting={submitting}>
						<div className="modal-body">
							<FormSubmitError error={submitError} />
							<div className="row g-3">
								{/* <div className="col-lg-12">
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
												value={crime}
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
								</div> */}
								<div className="col-lg-12">
									<label htmlFor="arm_id" className="form-label">
										Arms
									</label>
									<Field id="arm_id" name="arm_id">
										{({ input, meta }) => (
											<Select
												isClearable
												getOptionValue={option => option.id}
												getOptionLabel={option => option.name}
												options={armsOptions}
												value={arms}
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
									{`${armsRecovered ? 'Update' : 'Add'} Crime Committed`}
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageArmsRecovered;
