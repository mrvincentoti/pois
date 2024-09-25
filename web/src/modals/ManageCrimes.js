import React, { useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import ModalWrapper from '../container/ModalWrapper';
import { formatPoiName, notifyWithIcon, request } from '../services/utilities';
import {
	CREATE_CRIMES_COMMITTED_API,
	FET_POIS_API,
	FETCH_CRIMES_API,
	FETCH_ARRESTING_BODY_API,
	UPDATE_CRIMES_COMMITTED_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';

import Flatpickr from 'react-flatpickr';
import moment from 'moment';
// import { hasImplications } from '../services/constants';

const ManageCrimes = ({ closeModal, update, crimesCommitted }) => {
	const [loaded, setLoaded] = useState(false);
	const [poi, setPoi] = useState(null);
	const [crime, setCrime] = useState(null);
	const [crimesOptions, setCrimesOptions] = useState([]);
	const [arrestingBody, setArrestingBody] = useState(null);
	const [arrestingBodyOptions, setArrestingBodyOptions] = useState([]);
	const [crimeDate, setCrimeDate] = useState(null);
	const [casualties, setCasualties] = useState(null);
	const [detention, setDetention] = useState(null);
	const [actionTaken, setActionTaken] = useState(null);
	const [poiList, setPoiList] = useState(null);

	useEffect(() => {
		if (!loaded) {
			if (crimesCommitted) {
				setCrime(crimesCommitted.crime);
				setArrestingBody(crimesCommitted.arresting_body);
				setPoi(crimesCommitted.poi);
			}
			loadCrimes();
			loadArrestingBodies();
			setLoaded(true);
		}
	}, [crimesCommitted, loaded, poiList]);

	const loadCrimes = async () => {
		const rs = await request(FETCH_CRIMES_API);
		setCrimesOptions(rs?.crimes || []);
	};
	const loadArrestingBodies = async () => {
		const rs = await request(FETCH_ARRESTING_BODY_API);
		setArrestingBodyOptions(rs?.arresting_bodies || []);
	};

	const getPoi = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FET_POIS_API}?q=${q}`);

		return rs?.pois || [];
	};

	const onSubmit = async values => {
		try {
			const config = {
				method: crimesCommitted ? 'PUT' : 'POST',
				body: {
					...values,
					poi: undefined,
					crime: undefined,
					deleted_at: undefined,
				},
			};
			const uri = crimesCommitted
				? UPDATE_CRIMES_COMMITTED_API.replace(
						':poi_id',
						crimesCommitted.poi_id
					).replace(':id', crimesCommitted.id)
				: CREATE_CRIMES_COMMITTED_API;
			const rs = await request(uri, config);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			console.error(e); // This logs the actual error object in the console
			// Check if it's an object, then extract a meaningful message
			const errorMessage = e.message || 'Something went wrong';

			return {
				[FORM_ERROR]: e.message || 'could not create crime',
			};
		}
	};

	return (
		<ModalWrapper
			title={`${crimesCommitted ? 'Edit' : 'Add'} Crime Commited`}
			closeModal={closeModal}
		>
			<Form
				initialValues={{ ...crimesCommitted, poi_id: crimesCommitted?.poi_id }}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					// if (!values.employee_id) {
					// 	errors.employee_id = 'select employee';
					// }
					// if (!values.award_id) {
					// 	errors.award_id = 'select award';
					// }
					// if (values.type === 2 && !values.implication_id) {
					// 	errors.implication_id = 'select implication';
					// }
					// if (!values.reason) {
					// 	errors.reason = 'select reason';
					// }
					// if (!values.date_given) {
					// 	errors.date_given = 'select date_given';
					// }

					return errors;
				}}
				render={({ handleSubmit, submitError, submitting }) => (
					<FormWrapper onSubmit={handleSubmit} submitting={submitting}>
						<div className="modal-body">
							<FormSubmitError error={submitError} />
							<div className="row g-3">
								<div className="col-lg-12">
									<label htmlFor="poi_id" className="form-label">
										POI
									</label>
									<Field id="poi_id" name="poi_id">
										{({ input, meta }) => (
											<AsyncSelect
												isClearable
												getOptionValue={option => option.id}
												getOptionLabel={option => formatPoiName(option)}
												defaultOptions
												value={poi}
												className={error(meta)}
												loadOptions={getPoi}
												onChange={e => {
													setPoi(e);
													e ? input.onChange(e.id) : input.onChange('');
												}}
												placeholder="Search poi"
											/>
										)}
									</Field>
									<ErrorBlock name="poi_id" />
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
								</div>
								<div className="col-lg-12">
									<label htmlFor="arresting_body_id" className="form-label">
										Arresting Body
									</label>
									<Field id="arresting_body_id" name="arresting_body_id">
										{({ input, meta }) => (
											<Select
												isClearable
												getOptionValue={option => option.id}
												getOptionLabel={option => option.name}
												options={arrestingBodyOptions}
												value={arrestingBody}
												className={error(meta)}
												onChange={e => {
													setArrestingBody(e);
													e ? input.onChange(e.id) : input.onChange('');
												}}
												placeholder="Select arresting body"
											/>
										)}
									</Field>
									<ErrorBlock name="arresting_body_id" />
								</div>
								<div className="col-lg-12">
									<label htmlFor="place_of_detention" className="form-label">
										Place Of Detention
									</label>
									<Field id="place_of_detention" name="place_of_detention">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												id="place_of_detention"
												placeholder="place of detention"
											/>
										)}
									</Field>
									<ErrorBlock name="place_of_detention" />
								</div>
								<div className="col-lg-12">
									<label htmlFor="casualties_recorded" className="form-label">
										Casualties Recorded
									</label>
									<Field id="casualties_recorded" name="casualties_recorded">
										{({ input, meta }) => (
											<input
												{...input}
												type="number"
												className={`form-control ${error(meta)}`}
												id="casualties_recorded"
												placeholder="casualties recorded"
											/>
										)}
									</Field>
									<ErrorBlock name="casualties_recorded" />
								</div>
								<div className="col-lg-12">
									<label htmlFor="action_taken" className="form-label">
										Action Taken
									</label>
									<Field id="action_taken" name="action_taken">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												id="action_taken"
												placeholder="action taken"
											/>
										)}
									</Field>
									<ErrorBlock name="action_taken" />
								</div>
								<div className="col-lg-12">
									<label htmlFor="crime_date" className="form-label">
										Crime Date
									</label>
									<Field id="crime_date" name="crime_date">
										{({ input, meta }) => (
											<Flatpickr
												className={`form-control ${error(meta)}`}
												placeholder="Select date of crime"
												value={crimeDate}
												defaultValue={crimeDate}
												onChange={([date]) => {
													input.onChange(moment(date).format('YYYY-MM-DD'));
													setCrimeDate(date);
												}}
											/>
										)}
									</Field>
									<ErrorBlock name="crime_date" />
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
									{`${crimesCommitted ? 'Update' : 'Add'} Crime Committed`}
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageCrimes;
