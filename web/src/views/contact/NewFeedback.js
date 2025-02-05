import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import {
	notifyWithIcon,
	createHeaders,
} from '../../services/utilities';
import {
	CREATE_FEEDBACK_API,
} from '../../services/api';

const NewContact = () => {
	const [inputVisible, setInputVisible] = useState(false);
	const [editInputValue, setEditInputValue] = useState('');
	const [attachment, setAttachment] = useState('');
	
	const inputRef = useRef(null);
	const editInputRef = useRef(null);

	useEffect(() => {
		if (inputVisible) {
			inputRef.current?.focus();
		}
	}, [inputVisible]);

	useEffect(() => {
		editInputRef.current?.focus();
	}, [editInputValue]);

	const onSubmit = async (values, form) => {
		try {
			// Validate required fields
			if (!values.subject || !values.feedback) {
				notifyWithIcon('error', 'Subject and feedback are required.');
				return { subject: 'Required', feedback: 'Required' };
			}

			// Create a FormData object
			const formData = new FormData();

			// Append all non-file values
			for (const key in values) {
				formData.append(key, values[key]);
			}

			// Append file (if it exists)
			if (attachment !== '') {
				formData.append('attachment', attachment);
			}

			const uri = CREATE_FEEDBACK_API;
			const headers = createHeaders(true);

			// Ensure 'Content-Type' is not manually set when sending FormData
			delete headers['Content-Type'];

			const response = await fetch(uri, {
				method: 'POST',
				body: formData,
				headers: headers,
			});

			const data = await response.json();

			if (data.error) {
				notifyWithIcon('error', data.error);
			} else {
				notifyWithIcon('success', 'Feedback sent successfully');

				// Refresh the page to clear the form fields
				form.restart();
			}
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'Could not send feedback' };
		}
	};

	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="Send Feedback" parentPage="Feedback" />
			<div className="row">
				<div className="col-md-8 offset-md-2">
					<Form
						initialValues={{}}
						onSubmit={onSubmit}
						validate={values => {
							const errors = {};

							return errors;
						}}
						render={({ handleSubmit, submitError, submitting, form }) => (
							<FormWrapper onSubmit={handleSubmit} submitting={submitting}>
								<div className="row">
									<div className="col-lg-12">
										<FormSubmitError error={submitError} />
									</div>
									<div className="col-lg-12">
										<div className="card">
											<div className="card-header">
												<h5 className="card-subject mb-0">
													Send your feedback
												</h5>
											</div>
											<div className="card-body">
												<div className="row">
													<div className="col-lg-12 mb-3">
														<label className="form-label" htmlFor="subject">
															Subject
														</label>
														<Field id="subject" name="subject">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="subject"
																	placeholder="Enter subject"
																/>
															)}
														</Field>
														<ErrorBlock name="subject" />
													</div>
													<div className="col-lg-12 mb-3">
														<label className="form-label" htmlFor="feedback">
															Feedback
														</label>
														<Field id="feedback" name="feedback">
															{({ input, meta }) => (
																<textarea
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="feedback"
																	placeholder="Enter feedback"
																	style={{ height: '250px' }}
																/>
															)}
														</Field>
														<ErrorBlock name="feedback" />
													</div>
													<div className="col-lg-6 mb-3">
														<label className="form-label" htmlFor="attachment">
															Upload any supporting attachment&nbsp;&nbsp;&nbsp;
														</label>
														<input
															type="file"
															id="attachment"
															name="attachment"
															className="btn btn-soft-info btn-sm"
															onChange={e => setAttachment(e.target.files[0])}
														/>
													</div>
												</div>
											</div>
										</div>
										<div className="text-end mb-4">
											<Link to="/" className="btn btn-danger w-sm me-1">
												Cancel
											</Link>
											<button type="submit" className="btn btn-success w-sm">
												Send Feedback
											</button>
										</div>
									</div>
								</div>
							</FormWrapper>
						)}
					/>
				</div>
			</div>
		</div>
	);
};

export default NewContact;
