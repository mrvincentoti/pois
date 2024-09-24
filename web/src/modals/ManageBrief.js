import React, { useEffect, useState } from 'react';
import { Field, Form } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import ModalWrapper from '../container/ModalWrapper';
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';
import {
	createHeaders,
	notifyWithIcon,
	request,
	requestMultipart,
} from '../services/utilities';
import * as XLSX from 'xlsx';
import { UPLOAD_PROMOTION_BRIEFS_EMPLOYEE_API } from '../services/api';
import { ErrorBlock, FormSubmitError } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';
import { limit } from '../services/constants';

const ManageBrief = ({ closeModal, update }) => {
	const [loaded, setLoaded] = useState(false);
	const [fileList, setFileList] = useState([]);
	const [uploading, setUploading] = useState(false);
	const [numberOfRecords, setNumberOfRecords] = useState(false);

	useEffect(() => {
		if (!loaded) {
			setLoaded(true);
		}
	}, [loaded]);

	const props = {
		maxCount: 1,
		onRemove: file => {
			const index = fileList.indexOf(file);
			const newFileList = fileList.slice();
			newFileList.splice(index, 1);
			setFileList(newFileList);
		},
		beforeUpload: file => {
			const isExcelXLSX =
				file.type ===
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
			if (isExcelXLSX) {
				setFileList([file]);
				const reader = new FileReader();
				reader.onload = e => {
					const data = new Uint8Array(e.target.result);
					const workbook = XLSX.read(data, { type: 'array' });
					const sheet = workbook.Sheets[workbook.SheetNames[0]];
					const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
					const numberOfRecords = jsonData.length - 1; // Subtract 1 to exclude header row

					setNumberOfRecords(numberOfRecords);
				};

				reader.readAsArrayBuffer(file);
			} else {
				notifyWithIcon('success', 'You can only upload Excel XLSX files!');
			}

			return isExcelXLSX;
		},
		fileList,
	};

	const handleUpload = async () => {
		setUploading(true);
		const formData = new FormData();
		formData.append('file', fileList[0]);

		try {
			const headers = createHeaders(true);
			const response = await fetch(UPLOAD_PROMOTION_BRIEFS_EMPLOYEE_API, {
				method: 'POST',
				body: formData,
				headers: headers,
			});

			const data = await response.json();

			if (data.error) {
				notifyWithIcon(
					'error',
					`Failed to upload file: please check file columns`
				);
			} else {
				notifyWithIcon('success', data.message);
			}

			update();
			closeModal();
		} catch (e) {
			return {
				[FORM_ERROR]: e.message || 'Could not upload brief',
			};
		}
	};

	return (
		<ModalWrapper title="Import promotion brief" closeModal={closeModal}>
			<Form
				onSubmit={handleUpload}
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
										Upload promotion brief
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
									{numberOfRecords ? (
										<label className="form-label">
											Records {numberOfRecords}
										</label>
									) : (
										''
									)}
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<div className="hstack gap-2 justify-content-end">
								<Button
									type="primary"
									onClick={handleUpload}
									disabled={fileList.length === 0}
									loading={uploading}
									style={{
										marginTop: 16,
									}}
								>
									{uploading ? 'Uploading' : 'Start Upload'}
								</Button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageBrief;
