import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import Select from 'react-select';
import ModalWrapper from '../container/ModalWrapper';
import { notifyWithIcon, request, createHeaders } from '../services/utilities';
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
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

const ManageActivities = ({ closeModal, update, activities }) => {
	const [loaded, setLoaded] = useState(false);
	const [crime, setCrime] = useState(null);
	const [crimesOptions, setCrimesOptions] = useState([]);
	const [type, setType] = useState(null); // Track the selected type
	const [crimeDate, setCrimeDate] = useState(null);
	const [activityDate, setActivityDate] = useState(null);
	const [initialValues, setInitialValues] = useState({});
	const [fileList, setFileList] = useState([{ file: null, caption: '' }]);
	const [caption, setCaption] = useState('');
	const [items, setItems] = useState([{ item: '', quantity: '' }]);
	const [activityId, setActivityId] = useState(null);
	const params = useParams();

	useEffect(() => {
		if (!loaded) {
			if (activities) {
				// Pre-select the crime, type, and other fields for editing
				setCrime(crimesOptions.find(c => c.id === activities.crime_id));
				setCrimeDate(new Date(activities.crime_date));
				setActivityDate(new Date(activities.activity_date));
				setType(activities.type); // Pre-select type
				setInitialValues({
					crime_id: activities.crime_id,
					location: activities.location,
					nature_of_attack: activities.nature_of_attack,
					casualties_recorded: activities.casualties_recorded,
					action_taken: activities.action_taken,
					crime_date: activities.crime_date,
					activity_date: activities.activity_date,
					assessments: activities.assessments,
				});
			}
			loadCrimes();
			setLoaded(true);
		}
	}, [activities, loaded, crimesOptions]);

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
		console.log(values);
		console.log(items);

		try {
			const formData = new FormData();

			const type_id = typeMapping[type];
			// if (!type_id) throw new Error('Type must be selected');

			const appendIfExists = (key, value) => {
				if (value !== undefined && value !== null) {
					formData.append(key, value);
				}
			};

			// Append basic form values to formData
			appendIfExists('type_id', parseInt(type));
			appendIfExists('poi_id', parseInt(params.id));
			appendIfExists('crime_id', parseInt(values.crime_id) || null);
			appendIfExists('location', values.location || null);
			appendIfExists('location_from', values.location_from || null);
			appendIfExists('location_to', values.location_to || null);
			appendIfExists('nature_of_attack', values.nature_of_attack || null);
			appendIfExists('facilitator', values.facilitator || null);
			appendIfExists('casualties_recorded', values.casualties_recorded || null);
			appendIfExists('action_taken', values.action_taken || '');
			appendIfExists(
				'crime_date',
				moment(values.crimeDate).format('YYYY-MM-DD') || null
			);
			appendIfExists(
				'activity_date',
				moment(values.activityDate).format('YYYY-MM-DD') || null
			);
			appendIfExists(
				'comment',
				values.assessments ? values.assessments.trim() : null
			);

			appendIfExists('comment', values.remarks || null);

			console.log(fileList[0]);

			// If it's PressRelease, append multiple files and captions to formData
			if (type === 4 && fileList.length > 0) {
				fileList.forEach((file, index) => {
					appendIfExists('file[]', fileList[index].file); // Use 'file[]' to send multiple files
					appendIfExists('media_caption[]', fileList[index].caption); // Ensure captions are appended for each file
				});
			}

			for (let [key, value] of formData.entries()) {
				console.log(key, value);
			}
			// Append array of items and quantities
			if (items)
				items.forEach((item, index) => {
					appendIfExists('items[]', item.item || null);
					appendIfExists('qtys[]', item.quantity || null);
				});

			for (let [key, value] of formData.entries()) {
				console.log(key, value);
			}

			// Configure the request for POST or PUT based on activity existence
			const config = {
				method: activities ? 'PUT' : 'POST',
				body: formData, // Send the FormData object
			};

			const uri = activities
				? UPDATE_ACTIVITIES_API.replace(':id', activities.id)
				: CREATE_ACTIVITIES_API;

			const headers = createHeaders(true);
			const response = await fetch(uri, {
				method: activities ? 'PUT' : 'POST',
				body: formData,
				headers: headers,
			});

			const data = await response.json();
			console.log(data);

			notifyWithIcon('success');
			update();
			closeModal();
		} catch (e) {
			console.error(e);
			const errorMessage = e.message || 'Something went wrong';
			return { [FORM_ERROR]: errorMessage };
		}
	};
	// Add a new item and quantity pair
	const addItem = () => {
		setItems([...items, { item: '', quantity: '' }]);
	};

	// Handle change for item and quantity fields
	const handleItemChange = (index, field, value) => {
		const newItems = [...items];
		newItems[index][field] = value;
		setItems(newItems);
	};

	// Remove an item
	// const removeItem = index => {
	// 	const newItems = [...items];
	// 	newItems.splice(index, 1);
	// 	setItems(newItems);
	// };
	const removeItem = index => {
		const newItems = items.filter((_, i) => i !== index); // Remove the item and its quantity
		setItems(newItems);
	};

	// Add a new file and caption entry
	const addFileEntry = () => {
		setFileList([...fileList, { file: null, caption: '' }]);
	};

	// Handle file and caption change
	const handleFileChange = (index, field, value) => {
		const newFileList = [...fileList];
		newFileList[index][field] = value;
		setFileList(newFileList);
	};

	// Remove file entry
	const removeFileEntry = index => {
		const newFileList = [...fileList];
		newFileList.splice(index, 1);
		setFileList(newFileList);
	};

	// Render procurement fields dynamically
	const renderProcurementFields = () => (
		<>
			{items.map((item, index) => (
				<div key={index} className="row mb-3">
					<div className="col-lg-6">
						<label htmlFor={`items[${index}].item`} className="form-label">
							Item
						</label>
						<Field name={`items[${index}].item`} value={item.item}>
							{({ input, meta }) => (
								<input
									{...input}
									className="form-control"
									placeholder="Item"
									value={item.item} // Ensure the correct value is used
									onChange={e =>
										handleItemChange(index, 'item', e.target.value)
									} // Correct the onChange handler
								/>
							)}
						</Field>
					</div>
					<div className="col-lg-4">
						<label htmlFor={`items[${index}].quantity`} className="form-label">
							Quantity
						</label>
						<Field name={`items[${index}].quantity`} value={item.quantity}>
							{({ input, meta }) => (
								<input
									{...input}
									className="form-control"
									type="number"
									placeholder="Quantity"
									value={item.quantity} // Ensure the correct value is used
									onChange={e =>
										handleItemChange(index, 'quantity', e.target.value)
									} // Correct the onChange handler
								/>
							)}
						</Field>
					</div>
					<div className="col-lg-2 d-flex align-items-end">
						<Button type="danger" onClick={() => removeItem(index)}>
							Remove
						</Button>
					</div>
				</div>
			))}
			<Button type="primary" onClick={addItem}>
				Add Item
			</Button>
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
							value={activityDate}
							onChange={([date]) => {
								input.onChange(moment(date).format('YYYY-MM-DD'));
								setActivityDate(date);
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

	// Render catered away fields dynamically
	const renderCateredAwayFields = () => (
		<>
			{items.map((item, index) => (
				<div key={index} className="row mb-3">
					<div className="col-lg-6">
						<label htmlFor={`items[${index}].item`} className="form-label">
							Item
						</label>
						<Field name={`items[${index}].item`} value={item.item}>
							{({ input, meta }) => (
								<input
									{...input}
									className="form-control"
									placeholder="Item"
									value={item.item} // Ensure the correct value is used
									onChange={e =>
										handleItemChange(index, 'item', e.target.value)
									} // Correct the onChange handler
								/>
							)}
						</Field>
					</div>
					<div className="col-lg-4">
						<label htmlFor={`items[${index}].quantity`} className="form-label">
							Quantity
						</label>
						<Field name={`items[${index}].quantity`} value={item.quantity}>
							{({ input, meta }) => (
								<input
									{...input}
									className="form-control"
									type="number"
									placeholder="Quantity"
									value={item.quantity} // Ensure the correct value is used
									onChange={e =>
										handleItemChange(index, 'quantity', e.target.value)
									} // Correct the onChange handler
								/>
							)}
						</Field>
					</div>
					<div className="col-lg-2 d-flex align-items-end">
						<Button type="danger" onClick={() => removeItem(index)}>
							Remove
						</Button>
					</div>
				</div>
			))}
			<Button type="primary" onClick={addItem}>
				Add Item
			</Button>
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
							value={activityDate}
							onChange={([date]) => {
								input.onChange(moment(date).format('YYYY-MM-DD'));
								setActivityDate(date);
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

	// Render Press Release fields dynamically (files and captions)
	const renderPressReleaseFields = () => (
		<>
			{fileList.map((fileEntry, index) => (
				<div key={index} className="row mb-3 align-items-center">
					{/* Upload Data Field */}
					<div className="col-lg-4">
						<label htmlFor={`file_${index}`} className="form-label">
							Upload Data
						</label>
						<Field id={`file_${index}`} name={`file_${index}`}>
							{({ input, meta }) => (
								<div style={{ marginTop: '10px' }}>
									<Upload
										fileList={fileEntry.file ? [fileEntry.file] : []}
										beforeUpload={file => {
											handleFileChange(index, 'file', file);
											return false; // Prevent automatic upload
										}}
										onRemove={() => handleFileChange(index, 'file', null)}
									>
										<Button icon={<UploadOutlined />}>Select File</Button>
									</Upload>
									<ErrorBlock name={`file_${index}`} />
								</div>
							)}
						</Field>
					</div>

					{/* Caption Field */}
					<div className="col-lg-7">
						<label htmlFor={`caption_${index}`} className="form-label">
							Caption
						</label>
						<Field id={`caption_${index}`} name={`caption_${index}`}>
							{({ input, meta }) => (
								<input
									{...input}
									type="text"
									className={`form-control ${error(meta)}`}
									placeholder="Enter caption"
									value={fileEntry.caption}
									onChange={e =>
										handleFileChange(index, 'caption', e.target.value)
									}
								/>
							)}
						</Field>
						<ErrorBlock name={`caption_${index}`} />
					</div>

					<div
						className="col-lg-1 d-flex align-items-center justify-content-center"
						style={{ paddingTop: '35px' }}
					>
						<Tooltip title="Add more files">
							<PlusOutlined
								style={{
									fontSize: '15px',
									color: 'green',
									cursor: 'pointer',
									marginBottom: '2px',
								}}
								onClick={addFileEntry}
							/>
						</Tooltip>
						<Tooltip title="Remove">
							<DeleteOutlined
								style={{ fontSize: '15px', color: 'red', cursor: 'pointer' }}
								onClick={() => removeFileEntry(index)}
							/>
						</Tooltip>
					</div>
				</div>
			))}

			{/* Add More Files Icon */}
			<div className="row mb-3"></div>

			{/* Activity Date Field */}
			<div className="col-lg-12">
				<label htmlFor="activity_date" className="form-label">
					Activity Date
				</label>
				<Field id="activity_date" name="activity_date">
					{({ input, meta }) => (
						<Flatpickr
							className={`form-control ${error(meta)}`}
							placeholder="Select Activity Date"
							value={activityDate}
							onChange={([date]) => {
								input.onChange(moment(date).format('YYYY-MM-DD'));
								setActivityDate(date);
							}}
						/>
					)}
				</Field>
				<ErrorBlock name="activity_date" />
			</div>

			{/* Remarks Field */}
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

	// Conditionally render fields based on the selected "TYPE"
	const renderFieldsForType = () => {
		if (type === 1) {
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
		} else if (type === 2) {
			return renderProcurementFields();

			{
				/* catered away Fields */
			}
		} else if (type === 3) {
			return renderCateredAwayFields();
		} else if (type === 4) {
			return renderPressReleaseFields();
		} else if (type === 5) {
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
									value={activityDate}
									onChange={([date]) => {
										input.onChange(moment(date).format('YYYY-MM-DD'));
										setActivityDate(date);
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
			title={`${activities ? 'Edit' : 'Add'} Activity`}
			closeModal={closeModal}
		>
			<Form
				initialValues={activities}
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
											{ value: 1, label: 'Attack' },
											{ value: 2, label: 'Procurement' },
											{ value: 3, label: 'Items Carted Away' },
											{ value: 4, label: 'Press Release' },
											{ value: 5, label: 'Others' },
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
								{`${activities ? 'Update' : 'Add'} Activity`}
							</button>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageActivities;
