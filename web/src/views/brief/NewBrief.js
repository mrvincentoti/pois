import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Link, useNavigate } from 'react-router-dom';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import {
	asyncFetch,
	notifyWithIcon,
	request,
	createHeaders,
} from '../../services/utilities';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Flex, Input, Tag, theme, Tooltip } from 'antd';
import { message, Upload } from 'antd';

import {
	CREATE_BRIEF_API,
	FETCH_GENDERS_API,
	FETCH_STATES_API,
	FETCH_CATEGORIES_API,
	FETCH_SOURCES_API,
	FETCH_COUNTRIES_API,
	FETCH_AFFILIATIONS_API,
} from '../../services/api';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import { Select } from 'antd';
import AsyncSelect from 'react-select/async';
import UploadFilePicture from '../../components/UploadFile';
import {
	categoryList,
	confirmationList,
	hasImplications,
	maritalStatusList,
	passportCategoryList,
} from '../../services/constants';

const NewBrief = () => {
	const [loaded, setLoaded] = useState(false);
	const [stateOrigin, setStateOrigin] = useState(null);
	const [maritalStatus, setMaritalStatus] = useState(null);
	const [passportCategory, setPassportCategory] = useState(null);
	const [confirmation, setConfirmation] = useState(null);
	const [category, setCategory] = useState(null);
	const [categories, setCategories] = useState([]);
	const [sources, setSources] = useState([]);
	// const [affiliations, setAffliations] = useState([]);
	const [alias, setAlias] = useState([]);

	const [affiliations, setAffliations] = useState([]);
	const [affiliation, setAffliation] = useState([]);
	const [selectedAffiliations, setSelectedAffiliations] = useState([]);

	const [genders, setGenders] = useState([]);
	const [countries, setCountries] = useState([]);
	const [country, setCountry] = useState(null);
	const [states, setStates] = useState([]);

	const [dateOfBirth, setDateOfBirth] = useState('');
	const [imageUrl, setImageUrl] = useState();
	const [loading, setLoading] = useState(false);
	const [fileList, setFileList] = useState([]);

	const navigate = useNavigate();
	const { token } = theme.useToken();

	const [language, setLanguage] = useState(['English']);
	const [inputVisible, setInputVisible] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [editInputIndex, setEditInputIndex] = useState(-1);
	const [editInputValue, setEditInputValue] = useState('');
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

	const handleClose = removedTag => {
		const newTags = alias.filter(tag => tag !== removedTag);
		setAlias(newTags);
	};

	const showInput = () => {
		setInputVisible(true);
	};

	const handleInputChange = e => {
		setInputValue(e.target.value);
	};

	const handleInputConfirm = () => {
		if (inputValue && !alias.includes(inputValue)) {
			setAlias([...alias, inputValue]);
		}
		setInputVisible(false);
		setInputValue('');
	};

	const handleEditInputChange = e => {
		setEditInputValue(e.target.value);
	};

	const handleEditInputConfirm = () => {
		const newTags = [...alias];
		newTags[editInputIndex] = editInputValue;

		setAlias(newTags);
		setEditInputIndex(-1);
		setEditInputValue('');
	};

	const props = {
		maxCount: 1,
		onRemove: file => {
			const index = fileList.indexOf(file);
			const newFileList = fileList.slice();
			newFileList.splice(index, 1);
			setFileList(newFileList);
		},

		fileList,
	};

	const fetchApis = useCallback(async () => {
		try {
			const urls = [
				FETCH_GENDERS_API,
				`${FETCH_COUNTRIES_API}?per_page=300`,
				FETCH_CATEGORIES_API,
				FETCH_SOURCES_API,
				FETCH_AFFILIATIONS_API,
			];
			const requests = urls.map(url =>
				asyncFetch(url).then(response => response.json())
			);
			const [
				rs_genders,
				rs_countries,
				rs_categories,
				rs_sources,
				rs_affiliations,
			] = await Promise.all(requests);

			const formattedAffiliations = rs_affiliations.affiliations.map(
				affiliation => ({
					value: affiliation.id, // Set the value (ID of the country)
					label: affiliation.name, // Set the label (Name of the country)
				})
			);

			setGenders(rs_genders.genders);
			setCountries(rs_countries.countries);
			setCategories(rs_categories.categories);
			setSources(rs_sources.sources);
			setAffliations(formattedAffiliations);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const handleAffiliationChange = value => {
		setAffliation(value);
		setSelectedAffiliations(value);
	};

	const fetchStates = useCallback(async country_id => {
		const rs = await request(FETCH_STATES_API.replace('/:id', ''));
		setStates(rs.states);
	}, []);

	const changeImage = data => {
		setImageUrl(data);
	};

	const forMap = tag => (
		<span key={tag} style={{ display: 'inline-block' }}>
			<Tag closable onClose={() => handleClose(tag)}>
				{tag}
			</Tag>
		</span>
	);
	const tagChild = alias.map(forMap);

	const handleChange2 = value => {
		console.log(`selected ${value}`);
		setAffliation(value);
	};

	useEffect(() => {
		if (!loaded) {
			fetchApis();
			setLoaded(true);
		}
	}, [fetchApis, loaded]);

	const onSubmit = async values => {
		try {
			// Create a FormData object
			const formData = new FormData();
			// Append your values to FormData
			for (const key in values) {
				formData.append(key, values[key]);
			}

			// Function to append to formData if the value exists
			const appendIfExists = (key, value) => {
				if (value !== undefined && value !== null) {
					formData.append(key, value);
				}
			};

			// appendIfExists('country_id', country);
			// appendIfExists('affiliation_id', affiliation);
			// appendIfExists('marital_status', values.marital_status?.name);
			// appendIfExists('picture', imageUrl?.file);
			// appendIfExists('alias', alias.length > 0 ? alias.join(', ') : null);
			// appendIfExists('affiliation', affiliation?.join(','));

			// for (let pair of formData.entries()) {
			// 	console.log(`${pair[0]}: ${pair[1]}`);
			// }

			// return

			const uri = CREATE_BRIEF_API;

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
				notifyWithIcon('success', 'Brief created successfully');
				navigate('/brief');
			}
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not create Brief' };
		}
	};

	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="New Brief" parentPage="Brief" />
			<div className="row">
				<div className="col-md-8 offset-md-2">
					<Form
						initialValues={{}}
						onSubmit={onSubmit}
						validate={values => {
							const errors = {};

							// if (!values.first_name) {
							//     errors.first_name = 'Enter first name';
							// }
							// if (!values.last_name) {
							//     errors.last_name = 'enter first name';
							// }
							// if (!values.ref_numb) {
							//     errors.ref_numb = 'enter ref number';
							// }

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
													<div className="col-lg-6 mb-3">
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
																	options={categories.map(category => ({
																		value: category.id, // Map id to value
																		label: category.name, // Map name to label
																	}))}
																	className="custom-category-select" // Custom class for further styling
																/>
															)}
														</Field>
														<ErrorBlock name="category_id" />
													</div>
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
															Asessement
														</label>
														<Field id="remark" name="remark">
															{({ input, meta }) => (
																<textarea
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="remark"
																	placeholder="Enter assessment"
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
											<Link to="/brief" className="btn btn-danger w-sm me-1">
												Cancel
											</Link>
											<button type="submit" className="btn btn-success w-sm">
												Create Brief
											</button>
										</div>
									</div>

									{/* <div className="col-lg-4">
                                    <div className="card mb-3">
                                        <div className="card-header">
                                            <h5 className="card-title mb-0">Picture</h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-3 text-center">
                                                <UploadFilePicture
                                                    {...props}
                                                    imageUrl={imageUrl}
                                                    changeImage={data => changeImage(data)}
                                                    style={{ width: '200px', height: '200px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div> */}
								</div>
							</FormWrapper>
						)}
					/>
				</div>
			</div>
		</div>
	);
};

export default NewBrief;
