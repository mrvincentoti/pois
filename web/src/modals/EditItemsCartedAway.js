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

const EditItemsCartedAway = ({ closeModal, activity }) => {
	const [loaded, setLoaded] = useState(false);
	const [type, setType] = useState(null);
	const [initialValues, setInitialValues] = useState({});
	const [activityDate, setActivityDate] = useState(null);
	const [fileList, setFileList] = useState([{ file: null, caption: '' }]);
	const [items, setItems] = useState([{ item: '', qty: '' }]);
	const params = useParams();

	useEffect(() => {
		// Pre-fill form data on initial load
		if (activity && !loaded) {
			console.log('Setting initialValues:', activity);
			setInitialValues({
				type_id: activity.type_id,
				title: activity.title,
				location: activity.location,
				activity_date: activity.activity_date,
				comment: activity.comment,
			});
			setActivityDate(new Date(activity.activity_date));
			setType(activity.type_id);
			setItems(activity.items || [{ item: '', qty: '' }]);
			// Map existing media_files into fileList
			// const existingFiles = activity.media_files.map(file => ({
			// 	file: { url: file.media_url }, // Ant Design Upload accepts 'url' for preview
			// 	caption: file.media_caption,
			// }));
			// setFileList(existingFiles);

			// loadCrimes();
			setLoaded(true);
		}
	}, [activity, loaded]);

	const onSubmit = async values => {
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
			appendIfExists('title', values.title || null);
			appendIfExists('location', values.location || null);
			appendIfExists(
				'activity_date',
				moment(values.activity_date).format('YYYY-MM-DD') || null
			);
			appendIfExists('comment', values.comment || null);

			// for(let pair of formData.entries()){
			// 	console.log(`${pair[0]}: ${pair[1]}`);
			// }
			// return;

			// Handle file uploads
			// if (fileList.length > 0) {
			//     fileList.forEach((fileEntry) => {
			//         appendIfExists('file[]', fileEntry.file);
			//         appendIfExists('media_caption[]', fileEntry.caption);
			//     });
			// }

			if (items)
				items.forEach((item, index) => {
					appendIfExists('items[]', item.item || null);
					appendIfExists('qtys[]', item.qty || null);
				});

			for (let [key, value] of formData.entries()) {
				console.log(key, value);
			}

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
			window.location.reload();
			closeModal();
		} catch (e) {
			console.error(e);
			const errorMessage = e.message || 'Something went wrong';
			return { [FORM_ERROR]: errorMessage };
		}
	};

	const addItem = () => {
		setItems([...items, { item: '', qty: '' }]);
	};

	// Handle change for item and quantity fields
	const handleItemChange = (index, field, value) => {
		const newItems = [...items];
		newItems[index][field] = value;
		setItems(newItems);
	};
	const removeItem = index => {
		const newItems = items.filter((_, i) => i !== index); // Remove the item and its quantity
		setItems(newItems);
	};

	const handleFileChange = (index, field, value) => {
		const newFileList = [...fileList];
		newFileList[index][field] = value;
		setFileList(newFileList);
	};

	const addFileEntry = () => {
		setFileList([...fileList, { file: null, caption: '' }]);
	};

	const removeFileEntry = index => {
		const newFileList = fileList.filter((_, i) => i !== index);
		setFileList(newFileList);
	};

	const renderProcurementFields = () => (
		<>
			<div className="col-lg-12">
				<label htmlFor="title" className="form-label">
					Title
				</label>
				<Field id="title" name="title">
					{({ input, meta }) => (
						<input
							{...input}
							type="text"
							className={`form-control ${error(meta)}`}
							placeholder="Title"
						/>
					)}
				</Field>
				<ErrorBlock name="title" />
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
				<label htmlFor="comment" className="form-label">
					Assessment
				</label>
				<Field id="comment" name="comment">
					{({ input, meta }) => (
						<textarea
							{...input}
							className={`form-control ${error(meta)}`}
							placeholder="Assessment"
						/>
					)}
				</Field>
				<ErrorBlock name="comment" />
			</div>
			<div className="col-lg-12" style={{ marginTop: '15px' }}>
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
								input.onChange(date); // Pass the date directly to the form
								setActivityDate(date); // Update activityDate in state
							}}
						/>
					)}
				</Field>
				<ErrorBlock name="activity_date" />
			</div>
			{items.map((item, index) => (
				<div key={index} className="row mb-3">
					<div className="col-lg-7" style={{ marginTop: '15px' }}>
						<label htmlFor="location" className="form-label">
							Items
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
					<div className="col-lg-4" style={{ marginTop: '15px' }}>
						<label htmlFor="location" className="form-label">
							Quantity
						</label>
						<Field name={`items[${index}].qty`} value={item.qty}>
							{({ input, meta }) => (
								<input
									{...input}
									className="form-control"
									type="number"
									placeholder="Quantity"
									value={item.qty} // Ensure the correct value is used
									onChange={
										e => handleItemChange(index, 'qty', e.target.value) // Change 'quantity' to 'qty'
									}
								/>
							)}
						</Field>
					</div>
					<div
						className="col-lg-1 d-flex align-items-center justify-content-center"
						style={{ paddingTop: '15px' }}
					>
						<Tooltip title="Remove">
							<DeleteOutlined
								style={{ fontSize: '15px', color: 'red', cursor: 'pointer' }}
								onClick={() => removeItem(index)}
							/>
						</Tooltip>
					</div>
				</div>
			))}

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
						onClick={addItem}
						className="btn btn-sm btn-success float-right"
					>
						<PlusOutlined
							style={{
								fontSize: '15px',
								marginBottom: '2px',
							}}
							onClick={addItem}
						/>
					</button>
				</div>
			</div>
			<div className="col-lg-12" style={{ marginTop: '20px' }}>
				{/* {fileList.map((fileEntry, index) => (
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
			</div> */}
				{fileList.map((fileEntry, index) => (
					<div key={index} className="row mb-3 align-items-center">
						{/* Caption Field */}
						<div className="col-lg-7">
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
										style={{ marginTop: '15px' }}
									/>
								)}
							</Field>
							<ErrorBlock name={`caption_${index}`} />
						</div>
						{/* Upload Data Field */}
						<div className="col-lg-4">
							<Field id={`file_${index}`} name={`file_${index}`}>
								{({ input, meta }) => (
									<div style={{ marginTop: '15px' }}>
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
						<div
							className="col-lg-1 d-flex align-items-center justify-content-center"
							style={{ paddingTop: '15px' }}
						>
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
							marginTop: '5px',
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
		<ModalWrapper closeModal={closeModal} title="Edit ItemsCartedAway">
			{console.log('EditAttack component is rendering')}
			<Form
				onSubmit={onSubmit}
				initialValues={initialValues}
				render={({ handleSubmit, submitting, pristine, submitError }) => (
					<FormWrapper onSubmit={handleSubmit} submitting={submitting}>
						<div className="modal-body">
							<FormSubmitError error={submitError} />
							{renderProcurementFields()}
						</div>
						<div className="modal-footer">
							<button
								type="submit"
								className="btn btn-success"
								disabled={submitting}
							>
								Update
							</button>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default EditItemsCartedAway;
