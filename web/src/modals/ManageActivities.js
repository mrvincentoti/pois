import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import Select from 'react-select';
import ModalWrapper from '../container/ModalWrapper';
import { notifyWithIcon, request } from '../services/utilities';
import {
	CREATE_ACTIVITIES_API,
	FETCH_CRIMES_API,
	FETCH_ARRESTING_BODY_API,
	UPDATE_ACTIVITIES_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const ManageActivities = ({ closeModal, update, crimesCommitted }) => {
	const [loaded, setLoaded] = useState(false);
	const [crime, setCrime] = useState(null);
	const [crimesOptions, setCrimesOptions] = useState([]);
	const [type, setType] = useState(null); // Track the selected type
	const [crimeDate, setCrimeDate] = useState(null);
	const [initialValues, setInitialValues] = useState({});
	const [fileList, setFileList] = useState([]);
	const [caption, setCaption] = useState('');
	const [activityId, setActivityId] = useState(null);
	const params = useParams();

	useEffect(() => {
		if (!loaded) {
			if (crimesCommitted) {
				// Pre-select the crime, type, and other fields for editing
				setCrime(crimesOptions.find(c => c.id === crimesCommitted.crime_id));
				setCrimeDate(new Date(crimesCommitted.crime_date));
				setType(crimesCommitted.type); // Pre-select type
				setInitialValues({
					crime_id: crimesCommitted.crime_id,
					location: crimesCommitted.location,
					nature_of_attack: crimesCommitted.nature_of_attack,
					casualties_recorded: crimesCommitted.casualties_recorded,
					action_taken: crimesCommitted.action_taken,
					crime_date: crimesCommitted.crime_date,
					assessments: crimesCommitted.assessments,
				});
			}
			loadCrimes();
			setLoaded(true);
		}
	}, [crimesCommitted, loaded, crimesOptions]);

	const loadCrimes = async () => {
		const rs = await request(FETCH_CRIMES_API);
		setCrimesOptions(rs?.crimes || []);
	};

	const typeMapping = {
		Attack: 1,
		Procurement: 2,
		CateredAway: 3,
		PressRelease: 4,
		Others: 5,
	};

	const onSubmit = async values => {
		try {
			const formData = new FormData();

			const type_id = typeMapping[type];
			if (!type_id) {
				throw new Error('Type must be selected'); // Handle missing type
			}
			console.log('Selected type:', type); // Debug to see if type is selected
			console.log('Mapped type_id:', type_id);

			if (type === 'PressRelease') {
				formData.append('file', fileList[0]);
				formData.append('media_caption', caption);
				formData.append('type_id', type_id);
			}
			const config = {
				method: crimesCommitted ? 'PUT' : 'POST',
				body: {
					...values,
					type_id,
					poi_id: params.id,
					activity_id: activityId, // Send activity_id
					crime: undefined,
					assessment: values.assessment ? values.assessment.trim() : null,
				},
			};

			if (type === 'PressRelease') {
				config.body = formData; // Use formData if file upload is required
			}

			const uri = crimesCommitted
				? UPDATE_ACTIVITIES_API.replace(':id', crimesCommitted.id)
				: CREATE_ACTIVITIES_API;
			const rs = await request(uri, config);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			console.error(e);
			const errorMessage = e.message || 'Something went wrong';
			return { [FORM_ERROR]: errorMessage };
		}
	};

	// Conditionally render fields based on the selected "TYPE"
	const renderFieldsForType = () => {
		if (type === 'Attack') {
			return (
				<>
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
						<label htmlFor="location" className="form-label">
							Location
						</label>
						<Field id="location" name="location">
							{({ input, meta }) => (
								<input
									{...input}
									type="text"
									className={`form-control ${error(meta)}`}
									placeholder="Location"
								/>
							)}
						</Field>
						<ErrorBlock name="location" />
					</div>
					<div className="col-lg-12">
						<label htmlFor="nature_of_attack" className="form-label">
							Nature of Attack
						</label>
						<Field id="nature_of_attack" name="nature_of_attack">
							{({ input, meta }) => (
								<input
									{...input}
									type="text"
									className={`form-control ${error(meta)}`}
									placeholder="Nature of attack"
								/>
							)}
						</Field>
						<ErrorBlock name="nature_of_attack" />
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
									placeholder="Casualties recorded"
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
									placeholder="Action taken"
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
									onChange={([date]) => {
										input.onChange(moment(date).format('YYYY-MM-DD'));
										setCrimeDate(date);
									}}
								/>
							)}
						</Field>
						<ErrorBlock name="crime_date" />
					</div>
					<div className="col-lg-12">
						<label htmlFor="assessments" className="form-label">
							Assessment
						</label>
						<Field id="assessments" name="assessments">
							{({ input, meta }) => (
								<textarea
									{...input}
									className={`form-control ${error(meta)}`}
									placeholder="Type your assessment here"
								/>
							)}
						</Field>
						<ErrorBlock name="assessments" />
					</div>
				</>
			);
		} else if (type === 'Procurement') {
			return (
				<>
					{/* Procurement Fields */}
					<div className="col-lg-12">
						<label htmlFor="item" className="form-label">
							Item
						</label>
						<Field id="item" name="item">
							{({ input, meta }) => (
								<input
									{...input}
									type="text"
									className={`form-control ${error(meta)}`}
									placeholder="Item"
								/>
							)}
						</Field>
						<ErrorBlock name="item" />
					</div>
					<div className="col-lg-12">
						<label htmlFor="quantity" className="form-label">
							Quantity
						</label>
						<Field id="quantity" name="quantity">
							{({ input, meta }) => (
								<input
									{...input}
									type="number"
									className={`form-control ${error(meta)}`}
									placeholder="Quantity"
								/>
							)}
						</Field>
						<ErrorBlock name="quantity" />
					</div>
					<div className="col-lg-12">
						<label htmlFor="location_from" className="form-label">
							Location From
						</label>
						<Field id="location_from" name="location_from">
							{({ input, meta }) => (
								<input
									{...input}
									type="text"
									className={`form-control ${error(meta)}`}
									placeholder="Location From"
								/>
							)}
						</Field>
						<ErrorBlock name="location_from" />
					</div>
					<div className="col-lg-12">
						<label htmlFor="location_to" className="form-label">
							Location To
						</label>
						<Field id="location_to" name="location_to">
							{({ input, meta }) => (
								<input
									{...input}
									type="text"
									className={`form-control ${error(meta)}`}
									placeholder="Location To"
								/>
							)}
						</Field>
						<ErrorBlock name="location_to" />
					</div>
					<div className="col-lg-12">
						<label htmlFor="activity_date" className="form-label">
							Activity Date
						</label>
						<Field id="activity_date" name="activity_date">
							{({ input, meta }) => (
								<Flatpickr
									className={`form-control ${error(meta)}`}
									placeholder="Select activity date"
									value={crimeDate}
									onChange={([date]) => {
										input.onChange(moment(date).format('YYYY-MM-DD'));
										setCrimeDate(date);
									}}
								/>
							)}
						</Field>
						<ErrorBlock name="activity_date" />
					</div>
					<div className="col-lg-12">
						<label htmlFor="facilitator" className="form-label">
							Facilitator
						</label>
						<Field id="facilitator" name="facilitator">
							{({ input, meta }) => (
								<input
									{...input}
									type="text"
									className={`form-control ${error(meta)}`}
									placeholder="Facilitator"
								/>
							)}
						</Field>
						<ErrorBlock name="facilitator" />
					</div>
					<div className="col-lg-12">
						<label htmlFor="remarks" className="form-label">
							Remarks
						</label>
						<Field id="remarks" name="remarks">
							{({ input, meta }) => (
								<textarea
									{...input}
									className={`form-control ${error(meta)}`}
									placeholder="Remarks"
								/>
							)}
						</Field>
						<ErrorBlock name="remarks" />
					</div>
				</>
			);
			{
				/* catered away Fields */
			}
		} else if (type === 'CateredAway') {
			return (
				<>
					<div className="col-lg-12">
						<label htmlFor="item" className="form-label">
							Item
						</label>
						<Field id="item" name="item">
							{({ input, meta }) => (
								<input
									{...input}
									type="text"
									className={`form-control ${error(meta)}`}
									placeholder="Item"
								/>
							)}
						</Field>
						<ErrorBlock name="item" />
					</div>
					<div className="col-lg-12">
						<label htmlFor="quantity" className="form-label">
							Quantity
						</label>
						<Field id="quantity" name="quantity">
							{({ input, meta }) => (
								<input
									{...input}
									type="number"
									className={`form-control ${error(meta)}`}
									placeholder="Quantity"
								/>
							)}
						</Field>
						<ErrorBlock name="quantity" />
					</div>
					<div className="col-lg-12">
						<label htmlFor="location" className="form-label">
							Location
						</label>
						<Field id="location" name="location">
							{({ input, meta }) => (
								<input
									{...input}
									type="text"
									className={`form-control ${error(meta)}`}
									placeholder="Location"
								/>
							)}
						</Field>
						<ErrorBlock name="location" />
					</div>
					<div className="col-lg-12">
						<label htmlFor="activity_date" className="form-label">
							Activity Date
						</label>
						<Field id="activity_date" name="activity_date">
							{({ input, meta }) => (
								<Flatpickr
									className={`form-control ${error(meta)}`}
									placeholder="Select activity date"
									value={crimeDate}
									onChange={([date]) => {
										input.onChange(moment(date).format('YYYY-MM-DD'));
										setCrimeDate(date);
									}}
								/>
							)}
						</Field>
						<ErrorBlock name="activity_date" />
					</div>
					<div className="col-lg-12">
						<label htmlFor="remarks" className="form-label">
							Remarks
						</label>
						<Field id="remarks" name="remarks">
							{({ input, meta }) => (
								<textarea
									{...input}
									className={`form-control ${error(meta)}`}
									placeholder="Remarks"
								/>
							)}
						</Field>
						<ErrorBlock name="remarks" />
					</div>
				</>
			);
		} else if (type === 'PressRelease') {
			return (
				<>
					<div className="col-lg-12">
						<label htmlFor="file" className="form-label">
							Upload Data
						</label>
						<Field id="file" name="file">
							{({ input, meta }) => (
								<div style={{ marginTop: '10px' }}>
									<Upload
										fileList={fileList}
										onRemove={file => {
											const index = fileList.indexOf(file);
											const newFileList = fileList.slice();
											newFileList.splice(index, 1);
											setFileList(newFileList);
										}}
										beforeUpload={file => {
											setFileList([file]);
										}}
									>
										<Button icon={<UploadOutlined />}>Select File</Button>
									</Upload>
								</div>
							)}
						</Field>
						<ErrorBlock name="file" />
					</div>
					<div className="col-lg-12">
						<label htmlFor="caption" className="form-label">
							Caption
						</label>
						<Field id="caption" name="caption">
							{({ input, meta }) => (
								<input
									{...input}
									type="text"
									className={`form-control ${error(meta)}`}
									placeholder="Enter caption"
									value={caption}
									onChange={e => {
										setCaption(e.target.value);
										input.onChange(e);
									}}
								/>
							)}
						</Field>
						<ErrorBlock name="caption" />
					</div>
					<div className="col-lg-12">
						<label htmlFor="activity_date" className="form-label">
							Activity Date
						</label>
						<Field id="activity_date" name="activity_date">
							{({ input, meta }) => (
								<Flatpickr
									className={`form-control ${error(meta)}`}
									placeholder="Select Activity Date"
									value={crimeDate}
									onChange={([date]) => {
										input.onChange(moment(date).format('YYYY-MM-DD'));
										setCrimeDate(date);
									}}
								/>
							)}
						</Field>
						<ErrorBlock name="activity_date" />
					</div>
					<div className="col-lg-12">
						<label htmlFor="remarks" className="form-label">
							Remarks
						</label>
						<Field id="remarks" name="remarks">
							{({ input, meta }) => (
								<textarea
									{...input}
									className={`form-control ${error(meta)}`}
									placeholder="Remarks"
								/>
							)}
						</Field>
						<ErrorBlock name="remarks" />
					</div>
				</>
			);
		} else if (type === 'Others') {
			return (
				<>
					<div className="col-lg-12">
						<label htmlFor="remarks" className="form-label">
							Remarks
						</label>
						<Field id="remarks" name="remarks">
							{({ input, meta }) => (
								<textarea
									{...input}
									className={`form-control ${error(meta)}`}
									placeholder="Remarks"
								/>
							)}
						</Field>
						<ErrorBlock name="remarks" />
					</div>
					<div className="col-lg-12">
						<label htmlFor="activity_date" className="form-label">
							Activity Date
						</label>
						<Field id="activity_date" name="activity_date">
							{({ input, meta }) => (
								<Flatpickr
									className={`form-control ${error(meta)}`}
									placeholder="Select Activity Date"
									value={crimeDate}
									onChange={([date]) => {
										input.onChange(moment(date).format('YYYY-MM-DD'));
										setCrimeDate(date);
									}}
								/>
							)}
						</Field>
						<ErrorBlock name="activity_date" />
					</div>
				</>
			);
		}
		return null;
	};

	return (
		<ModalWrapper
			title={`${crimesCommitted ? 'Edit' : 'Add'} Activity`}
			closeModal={closeModal}
		>
			<Form
				initialValues={crimesCommitted}
				onSubmit={onSubmit}
				render={({ handleSubmit, submitError, submitting }) => (
					<FormWrapper onSubmit={handleSubmit} submitting={submitting}>
						<div className="modal-body">
							<FormSubmitError error={submitError} />
							<div className="row g-3">
								{/* TYPE Dropdown */}
								<div className="col-lg-12">
									<label htmlFor="type" className="form-label">
										Type
									</label>
									<Select
										id="type"
										options={[
											{ value: 'Attack', label: 'Attack' },
											{ value: 'Procurement', label: 'Procurement' },
											{ value: 'CateredAway', label: 'Items Catered Away' },
											{ value: 'PressRelease', label: 'Press Release' },
											{ value: 'Others', label: 'Others' },
										]}
										onChange={selectedOption => setType(selectedOption.value)}
										placeholder="Select type"
									/>
								</div>

								{/* Render fields based on TYPE selection */}
								{renderFieldsForType()}
							</div>
						</div>
						<div className="modal-footer">
							<button
								type="submit"
								className="btn btn-success"
								disabled={submitting}
							>
								{`${crimesCommitted ? 'Update' : 'Add'} Activity`}
							</button>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageActivities;
