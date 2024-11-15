import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import {
	asyncFetch,
	notifyWithIcon,
	request,
	createHeaders,
} from '../../services/utilities';

import {
	FETCH_CATEGORIES_API,
	FETCH_SOURCES_API,
	GET_BRIEF_API,
	UPDATE_BRIEF_API,
} from '../../services/api';
import moment from 'moment';
import { Select } from 'antd';

const EditBrief = () => {
	const [loaded, setLoaded] = useState(false);
	const [brief, setBrief] = useState(null);
	// const [category, setCategory] = useState(null);
	// const [categories, setCategories] = useState([]);
	const [sources, setSources] = useState([]);
	const [source, setSource] = useState([]);

	const navigate = useNavigate();
	const param = useParams();

	const fetchApis = useCallback(async () => {
		try {
			const urls = [FETCH_CATEGORIES_API, FETCH_SOURCES_API];
			const requests = urls.map(url =>
				asyncFetch(url).then(response => response.json())
			);
			const [rs_categories, rs_sources] = await Promise.all(requests);

			// setCategories(rs_categories.categories);
			setSources(rs_sources.sources);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchBrief = useCallback(async id => {
		try {
			const rs = await request(GET_BRIEF_API.replace(':id', id));
			return rs.brief;
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	useEffect(() => {
		if (!loaded) {
			fetchApis();
			fetchBrief(param.id).then(item => {
				if (!item) {
					notifyWithIcon('error', 'brief not found!');
					navigate('/brief');
					return;
				}
				setSource(item.source.id);
				setBrief(item);
				// setCategory(item.category.id);
				setLoaded(true);
			});
		}
	}, [fetchApis, fetchBrief, loaded, navigate, param.id]);

	const convertNullToEmptyString = obj => {
		for (let key in obj) {
			if (obj[key] === null || obj[key] === undefined) {
				obj[key] = ''; // Convert null or undefined to an empty string
			}
		}
	};
	const handleCancel = () => {
		navigate(-1); // This will take the user back to the previous page
	};

	const onSubmit = async values => {
		convertNullToEmptyString(values);

		try {
			// Create a FormData object
			const formData = new FormData();
			for (const key in values) {
				formData.append(key, values[key]);
			}

			const appendIfExists = (key, value) => {
				if (value !== undefined && value !== null) {
					formData.append(key, value);
				}
			};

			if (values.source) {
				formData.append('source_id', values.source?.id || '');
			}

			const uri = UPDATE_BRIEF_API.replace(':id', param.id);

			const headers = createHeaders(true);
			const response = await fetch(uri, {
				method: 'PUT',
				body: formData,
				headers: headers,
			});

			const data = await response.json();

			if (data.error) {
				let errorMessage = data.error;

				notifyWithIcon('error', errorMessage);
			} else {
				notifyWithIcon('success', 'brief updated successfully');
				navigate('/brief');
			}
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not create brief' };
		}
	};

	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="EDIT brief" parentPage="brief" />
			<div className="row">
				<div className="col-md-8 offset-md-2">
					<Form
						initialValues={{
							...brief,
							// category_id: brief?.category.id,
						}}
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
												<h5 className="card-title mb-0">Brief Information</h5>
											</div>
											<div className="card-body">
												<div className="row">
													<div className="col-lg-6 mb-3">
														<label className="form-label" htmlFor="ref_numb">
															Reference Number{' '}
															<span style={{ color: 'red' }}>*</span>
														</label>
														<Field id="ref_numb" name="ref_numb">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="ref_numb"
																	placeholder="Enter Reference number"
																/>
															)}
														</Field>
														<ErrorBlock name="ref_numb" />
													</div>
													<div className="col-lg-6 mb-3">
														<label className="form-label" htmlFor="title">
															Brief Title
														</label>
														<Field id="title" name="title">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="phone_number"
																	placeholder="Enter title"
																/>
															)}
														</Field>
														<ErrorBlock name="title" />
													</div>
													{/* <div className="col-lg-6 mb-3">
                                                        <label className="form-label" htmlFor="category_id">
                                                            Category <span style={{ color: 'red' }}></span>
                                                        </label>
                                                        <Field id="category_id" name="category_id">
                                                            {({ input, meta }) => (
                                                                <Select
                                                                    style={{
                                                                        width: '100%',
                                                                        height: '40px',
                                                                        borderColor:
                                                                            meta.touched && meta.error
                                                                                ? 'red'
                                                                                : '#ced4da', // Border color based on validation
                                                                    }}
                                                                    placeholder="Select Category"
                                                                    onChange={value => input.onChange(value)} // Handle change event
                                                                    value={category}
                                                                    options={categories.map(category => ({
                                                                        value: category.id, // Map id to value
                                                                        label: category.name, // Map name to label
                                                                    }))}
                                                                    className="custom-category-select" // Custom class for further styling
                                                                />
                                                            )}
                                                        </Field>
                                                        <ErrorBlock name="category_id" />
                                                    </div> */}
													<div className="col-lg-6 mb-3">
														<label className="form-label" htmlFor="source_id">
															Source <span style={{ color: 'red' }}></span>
														</label>
														<Field id="source_id" name="source_id">
															{({ input, meta }) => (
																<Select
																	style={{
																		width: '100%',
																		height: '40px',
																		borderColor:
																			meta.touched && meta.error
																				? 'red'
																				: '#ced4da', // Dynamic border color based on validation
																	}}
																	placeholder="Select Source"
																	onChange={value => input.onChange(value)} // Handle change event
																	value={source}
																	options={sources.map(source => ({
																		value: source.id, // Map id to value
																		label: source.name, // Map name to label
																	}))}
																	className="custom-source-select" // Custom class for styling
																/>
															)}
														</Field>
														<ErrorBlock name="source_id" />
													</div>
													<div className="col-lg-12 mb-3">
														<label className="form-label" htmlFor="remark">
															Remark
														</label>
														<Field id="remark" name="remark">
															{({ input, meta }) => (
																<textarea
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="remark"
																	placeholder="Enter remark"
																	style={{ height: '250px' }}
																/>
															)}
														</Field>
														<ErrorBlock name="remark" />
													</div>
												</div>
											</div>
										</div>
										<div className="text-end mb-4">
											<button
												type="button"
												className="btn btn-danger w-sm me-1"
												onClick={handleCancel}
											>
												Cancel
											</button>
											<button type="submit" className="btn btn-success w-sm">
												Update brief
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

export default EditBrief;
