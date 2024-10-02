import React, { useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import Select from 'react-select';
import ModalWrapper from '../../container/ModalWrapper';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import { notifyWithIcon, request, createHeaders } from '../../services/utilities';
import {
	CREATE_ORG_MEDIA_API,
	UPDATE_ORG_MEDIA_API,
	FETCH_ORG_MEDIA_API,
} from '../../services/api';
import { Button, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const AddMedia = ({ id, closeModal, update, media }) => {
	const [file, setFile] = useState(null);
	const [caption, setCaption] = useState([]);
	const [fileList, setFileList] = useState([]);
	const [uploading, setUploading] = useState(false);
	const params = useParams();

	const onSubmit = async values => {
		try {
			const formData = new FormData();
			formData.append('file', fileList[0]);
			formData.append('media_caption', values.caption);
			//console.log(params.id); return;
			
			// for (let pair of formData.entries()) {
			// 	console.log(`${pair[0]}: ${pair[1]}`);
			// }

			// return
			const uri = media
				? UPDATE_ORG_MEDIA_API.replace(':id', id)
				: CREATE_ORG_MEDIA_API.replace(':id', id);
			//console.log(uri); return;
			

			const headers = createHeaders(true);
			const response = await fetch(uri, {
				method: 'POST',
				body: formData,
				headers: headers,
			});

			const data = await response.json();


			if (data.error) {
				let errorMessage = data.error;

				notifyWithIcon('error', errorMessage);
			} else {
				notifyWithIcon('success', ' uploaded successfully');
			}

			update();
			closeModal();
		} catch (e) {
			return {
				[FORM_ERROR]: e.message || 'Could not save media',
			};
		}
	};

	const props = {
		maxCount: 1,
		onRemove: file => {
			const index = fileList.indexOf(file);
			const newFileList = fileList.slice();
			newFileList.splice(index, 1);
			setFileList(newFileList);
		},
		beforeUpload: file => {
			setFileList([file]);
		},
		fileList,
	};

	return (
		<ModalWrapper
			title={`${media ? 'Edit' : 'Add'} Org Media`}
			closeModal={closeModal}
		>
			<Form
				initialValues={{ caption: media?.caption || '' }}
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
								<div className="col-lg-12">
									<label htmlFor="file" className="form-label">
										Upload data
									</label>
									<br />
									<Field id="file" name="file">
										{({ input, meta }) => (
											<Upload {...props}>
												<Button icon={<UploadOutlined />}>Select File</Button>
											</Upload>
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
							</div>
						</div>
						<div className="modal-footer">
							<div className="hstack gap-2 justify-content-end">
								<button
									type="submit"
									className="btn btn-success"
									disabled={submitting}
								>
									{`${media ? 'Update' : 'Add'} Media`}
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default AddMedia;
