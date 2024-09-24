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
import {
	BULK_UPLOAD_AWARDS_API,
	BULK_UPLOAD_CONFERENCES_API,
	BULK_UPLOAD_DEPENDANT_API,
	BULK_UPLOAD_DEPLOYMENTS_API,
	BULK_UPLOAD_EMPLOYEE_API,
	BULK_UPLOAD_NOK_API,
	BULK_UPLOAD_POSTINGS_API,
	BULK_UPLOAD_PROMOTIONS_API,
	BULK_UPLOAD_SANCTIONS_API,
	BULK_UPLOAD_TRAININGS_API,
	UPLOAD_PROMOTION_BRIEFS_EMPLOYEE_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';
import { limit } from '../services/constants';

const BulkUpload = ({ closeModal, update, title }) => {
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
			const endpoint =
				title === 'employee'
					? BULK_UPLOAD_EMPLOYEE_API
					: title === 'dependant'
						? BULK_UPLOAD_DEPENDANT_API
						: title === 'next of kin'
							? BULK_UPLOAD_NOK_API
							: title === 'deployments'
								? BULK_UPLOAD_DEPLOYMENTS_API
								: title === 'postings'
									? BULK_UPLOAD_POSTINGS_API
									: title === 'trainings'
										? BULK_UPLOAD_TRAININGS_API
										: title === 'conferences'
											? BULK_UPLOAD_CONFERENCES_API
											: title === 'awards'
												? BULK_UPLOAD_AWARDS_API
												: title === 'sanctions'
													? BULK_UPLOAD_SANCTIONS_API
													: title === 'promotions'
														? BULK_UPLOAD_PROMOTIONS_API
														: null;

			const headers = createHeaders(true);
			const response = await fetch(endpoint, {
				method: 'POST',
				body: formData,
				headers: headers,
			});

			const data = await response.json();

			if (data.error) {
				let errorMessage = data.error;
				if (data.rows && data.rows.length > 0) {
					const rowNumbers = data.rows.map(row => row.row_number).join(', ');
					errorMessage += ' ' + rowNumbers;
				}

				notifyWithIcon('error', errorMessage);
			} else {
				notifyWithIcon(
					'success',
					data.success_count + ' records uploaded successfully'
				);
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
		<ModalWrapper title={'Bulk ' + title + ' import'} closeModal={closeModal}>
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
										Upload {title} data
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

export default BulkUpload;
