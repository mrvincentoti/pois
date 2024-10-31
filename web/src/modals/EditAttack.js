import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import Select from 'react-select';
import ModalWrapper from '../container/ModalWrapper';
import { notifyWithIcon, request, createHeaders } from '../services/utilities';
import { FETCH_CRIMES_API, UPDATE_ACTIVITIES_API } from '../services/api';
import { ErrorBlock, error, FormSubmitError } from '../components/FormBlock';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import { Upload, Button } from 'antd';
import {
	UploadOutlined,
	DeleteOutlined,
	PlusOutlined,
} from '@ant-design/icons';
import { Tooltip } from 'antd';
import FormWrapper from '../container/FormWrapper';

const EditAttack = ({ closeModal, activity }) => {
	const [loaded, setLoaded] = useState(false);
	const [type, setType] = useState(null);
	const [crime, setCrime] = useState(null);
	const [crimesOptions, setCrimesOptions] = useState([]);
	const [crimeDate, setCrimeDate] = useState(null);
	const [initialValues, setInitialValues] = useState({});
	const [fileList, setFileList] = useState([{ file: null, caption: '' }]);
	const params = useParams();

	useEffect(() => {
		// Pre-fill form data on initial load
		if (activity && !loaded) {
			console.log('Setting initialValues:', activity);
			setInitialValues({
				type_id: activity.type_id,
				crime_id: activity.crime_id,
				location: activity.location,
				nature_of_attack: activity.nature_of_attack,
				casualties_recorded: activity.casualties_recorded,
				action_taken: activity.action_taken,
				crime_date: activity.crime_date,
				comment: activity.comment,
			});
			setCrimeDate(new Date(activity.crime_date));
			setCrime(activity.crime_id);
			setType(activity.type_id);

			// Map existing media_files into fileList
			const existingFiles = activity.media_files.map(file => ({
				file: { url: file.media_url }, // Ant Design Upload accepts 'url' for preview
				caption: file.media_caption,
			}));
			setFileList(existingFiles);

			loadCrimes();
			setLoaded(true);
		}
	}, [activity, loaded]);

	const loadCrimes = async () => {
		const rs = await request(FETCH_CRIMES_API);
		setCrimesOptions(rs?.crimes || []);
	};

	const onSubmit = async values => {
		// console.log(fileList)
		// return
		try {
			const formData = new FormData();
			const appendIfExists = (key, value) => {
				if (value !== undefined && value !== null) {
					formData.append(key, value);
				}
			};

			// Append basic form values to formData
			appendIfExists('type_id', parseInt(values.type_id));
			appendIfExists('poi_id', parseInt(params.id));
			appendIfExists('crime_id', parseInt(values.crime_id) || null);
			appendIfExists('location', values.location || null);
			appendIfExists('nature_of_attack', values.nature_of_attack || null);
			appendIfExists('casualties_recorded', values.casualties_recorded || null);
			appendIfExists('action_taken', values.action_taken || '');
			appendIfExists(
				'crime_date',
				moment(values.crime_date).format('YYYY-MM-DD') || null
			);
			appendIfExists('comment', values.comment || null);

			// fileList.forEach(fileEntry => {
			// 	const file = fileEntry.file.originFileObj || fileEntry.file;
			// 	if (file) {
			// 		appendIfExists('file[]', file);
			// 		console.log(`Appending file: ${file.name}`);
			// 	}
			// 	appendIfExists('media_caption[]', fileEntry.caption);
			// });
			// Append each file and caption to formData
			// fileList.forEach((fileEntry, index) => {
			// 	const file = fileEntry.file.originFileObj || fileEntry.file;
			// 	if (file) {
			// 		formData.append('file[]', file); // Use 'file[]' to support multiple files
			// 		console.log(`Appending file: ${file.name}`);
			// 	}
			// 	formData.append('media_caption[]', fileEntry.caption); // Append each caption with 'media_caption[]'
			// });
			// Check if fileList meets condition and append files and captions accordingly
			// Filter out fileList entries with null/undefined file or caption
			// Filter fileList to skip entries without a file or caption
			const validFileList = fileList.filter(
				fileEntry => fileEntry.file || fileEntry.caption
			);

			validFileList.forEach(fileEntry => {
				const file = fileEntry.file.originFileObj || fileEntry.file;
				if (file) {
					appendIfExists('file[]', file); // Appends only if there’s a valid file
				}
				appendIfExists('media_caption[]', fileEntry.caption); // Appends only if caption exists
			});

			for (let pair of formData.entries()) {
				console.log(`${pair[0]}: ${pair[1]}`);
			}

			const response = await fetch(
				UPDATE_ACTIVITIES_API.replace(':id', activity.id),
				{
					method: 'PUT',
					body: formData,
					headers: createHeaders(true),
				}
			);

			const data = await response.json();
			if (!response.ok) throw new Error(data.message || 'Update failed');

			notifyWithIcon('success');
			// update();
			closeModal();
			window.location.reload();
		} catch (e) {
			console.error(e);
			const errorMessage = e.message || 'Something went wrong';
			return { [FORM_ERROR]: errorMessage };
		}
	};

	// const handleFileChange = (index, field, value) => {
	//     const newFileList = [...fileList];
	//     newFileList[index][field] = value;
	//     setFileList(newFileList);
	// };
	const handleFileChange = (index, field, value) => {
		setFileList(prevList => {
			const newList = [...prevList];
			newList[index] = { ...newList[index], [field]: value };
			return newList;
		});
	};

	const addFileEntry = () => {
		setFileList([...fileList, { file: null, caption: '' }]);
	};

	const removeFileEntry = index => {
		const newFileList = fileList.filter((_, i) => i !== index);
		setFileList(newFileList);
	};

	const renderAttackFields = () => (
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
							// value={crime}
							value={crimesOptions.find(c => c.id === input.value)}
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
			<div className="col-lg-12" style={{ marginTop: '15px' }}>
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
			<div className="col-lg-12" style={{ marginTop: '15px' }}>
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
			<div className="col-lg-12" style={{ marginTop: '15px' }}>
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
			<div className="col-lg-12" style={{ marginTop: '15px' }}>
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
			<div className="col-lg-12" style={{ marginTop: '15px' }}>
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
			<div className="col-lg-12" style={{ marginTop: '15px' }}>
				<label htmlFor="comment" className="form-label">
					Assessment
				</label>
				<Field id="comment" name="comment">
					{({ input, meta }) => (
						<textarea
							{...input}
							className={`form-control ${error(meta)}`}
							placeholder="Type your assessment here"
						/>
					)}
				</Field>
				<ErrorBlock name="comment" />
			</div>
			<div className="col-lg-12" style={{ marginTop: '20px' }}>
				{fileList.map((fileEntry, index) => (
					<div key={index} className="row mb-3 align-items-center">
						<div className="col-lg-4">
							{fileEntry.file?.url ? (
								<a
									href={fileEntry.file.url}
									target="_blank"
									rel="noopener noreferrer"
								>
									{fileEntry.file.url.split('/').pop()}
								</a>
							) : (
								<Field name={`file_${index}`}>
									{({ input, meta }) => (
										<Upload
											fileList={fileEntry.file ? [fileEntry.file] : []}
											beforeUpload={file => {
												handleFileChange(index, 'file', file);
												return false;
											}}
											onRemove={() => handleFileChange(index, 'file', null)}
										>
											<Button icon={<UploadOutlined />}>Select File</Button>
										</Upload>
									)}
								</Field>
							)}
						</div>
						<div className="col-lg-7">
							{fileEntry.caption ? (
								<p>{fileEntry.caption}</p>
							) : (
								<Field id={`caption_${index}`} name={`caption_${index}`}>
									{({ input, meta }) => (
										<input
											{...input}
											type="text"
											className={`form-control ${error(meta)}`}
											placeholder="Caption"
											onBlur={e =>
												handleFileChange(index, 'caption', e.target.value)
											} // Update fileList on blur
										/>
									)}
								</Field>
							)}
						</div>
						<div className="col-lg-1 d-flex align-items-center justify-content-center">
							<Tooltip title="Remove">
								<DeleteOutlined
									style={{ fontSize: '15px', color: 'red', cursor: 'pointer' }}
									onClick={() => removeFileEntry(index)}
								/>
							</Tooltip>
						</div>
					</div>
				))}
			</div>
			<div className="row g-3">
				<div className="col-lg-8"></div>
				<div className="col-lg-3">
					<button
						type="button"
						style={{
							width: '100px',
							marginTop: '-10px',
							marginLeft: '-14px',
						}}
						onClick={addFileEntry}
						className="btn btn-sm btn-success float-right"
					>
						<PlusOutlined
							style={{
								fontSize: '15px',
								cursor: 'pointer',
								marginBottom: '2px',
							}}
							onClick={addFileEntry}
						/>
					</button>
				</div>
			</div>
		</>
	);

	return (
		<ModalWrapper closeModal={closeModal} title="Edit Attack">
			{console.log('EditAttack component is rendering')}
			<Form
				onSubmit={onSubmit}
				initialValues={initialValues}
				render={({ handleSubmit, submitting, pristine, submitError }) => (
					<FormWrapper onSubmit={handleSubmit} submitting={submitting}>
						<div className="modal-body">
							<FormSubmitError error={submitError} />
							{renderAttackFields()}
						</div>
						<div className="modal-footer">
							<button
								type="submit"
								className="btn btn-success"
								disabled={submitting}
							>
								Update Attack
							</button>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default EditAttack;
