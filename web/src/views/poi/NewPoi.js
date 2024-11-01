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
	CREATE_POI_API,
	FETCH_GENDERS_API,
	FETCH_STATES_API,
	FETCH_POI_CATEGORY_API,
	FETCH_SOURCES_API,
	FETCH_COUNTRIES_API,
	FETCH_AFFILIATIONS_API,
	FETCH_POI_STATUSES_API,
	FETCH_ORG_API,
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

const NewPoi = () => {
	const [loaded, setLoaded] = useState(false);
	const [stateOrigin, setStateOrigin] = useState(null);
	const [maritalStatus, setMaritalStatus] = useState(null);
	const [passportCategory, setPassportCategory] = useState(null);
	const [confirmation, setConfirmation] = useState(null);
	const [category, setCategory] = useState(null);
	const [categories, setCategories] = useState([]);
	const [poiStatuses, setPoiStatuses] = useState(null);
	const [poiStatus, setPoiStatus] = useState(null);
	const [sources, setSources] = useState([]);
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

	const [organizations, setOrganizations] = useState([]);
	const [selectedOrganization, setSelectedOrganization] = useState(null);

	const navigate = useNavigate();
	const { token } = theme.useToken();

	const [language, setLanguage] = useState(['English']);
	const [inputVisible, setInputVisible] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [editInputIndex, setEditInputIndex] = useState(-1);
	const [editInputValue, setEditInputValue] = useState('');
	const inputRef = useRef(null);
	const editInputRef = useRef(null);

	const handleCloseAffiliation = removedTag => {
		const newTags = affiliations.filter(tag => tag !== removedTag);
		setAffliations(newTags);
	};

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
				FETCH_POI_CATEGORY_API,
				FETCH_SOURCES_API,
				FETCH_AFFILIATIONS_API,
				FETCH_POI_STATUSES_API,
				FETCH_ORG_API,
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
				rs_statuses,
				rs_orgs,
			] = await Promise.all(requests);

			const formattedAffiliations = rs_affiliations.affiliations.map(
				affiliation => ({
					value: affiliation.id, // Set the value (ID of the country)
					label: affiliation.name, // Set the label (Name of the country)
				})
			);

			const formattedOrganizations = rs_orgs.orgs.map(org => ({
				value: org.id, // Organization ID
				label: org.org_name, // Organization name
			}));

			setGenders(rs_genders.genders);
			setCountries(rs_countries.countries);
			setCategories(rs_categories.categories);
			setSources(rs_sources.sources);
			setAffliations(formattedAffiliations);
			setPoiStatuses(rs_statuses.statuses);
			setOrganizations(formattedOrganizations);
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

	const handleCancel = () => {
		navigate(-1); // This will take the user back to the previous page
	};

	useEffect(() => {
		if (!loaded) {
			fetchApis();
			setLoaded(true);
		}
	}, [fetchApis, loaded]);

	const onSubmit = async values => {
		console.log(values);

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

			appendIfExists('country_id', country);
			appendIfExists('affiliation_id', affiliation);
			appendIfExists('marital_status', maritalStatus);
			appendIfExists('picture', imageUrl?.file);
			appendIfExists('alias', alias.length > 0 ? alias.join(', ') : null);
			appendIfExists('affiliation', affiliation?.join(','));
			appendIfExists('organisation_id', selectedOrganization?.value);

			const uri = CREATE_POI_API;

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
				notifyWithIcon('success', 'POI created successfully');
				navigate(`/pois/poi/${values.category_id}/list`);
			}
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not create Poi' };
		}
	};

	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="New POI" parentPage="POI" />
			<div className="row">
				<Form
					initialValues={{}}
					onSubmit={onSubmit}
					validate={values => {
						const errors = {};

						if (!values.category_id) {
							errors.category_id = 'Enter Category';
						}
						// if (!values.last_name) {
						// 	errors.last_name = 'enter first name';
						// }
						// if (!values.ref_numb) {
						// 	errors.ref_numb = 'enter ref number';
						// }

						return errors;
					}}
					render={({ handleSubmit, submitError, submitting, form }) => (
						<FormWrapper onSubmit={handleSubmit} submitting={submitting}>
							<div className="row">
								<div className="col-lg-12">
									<FormSubmitError error={submitError} />
								</div>
								<div className="col-lg-8">
									<div className="card">
										<div className="card-header">
											<h5 className="card-title mb-0">Personal Information</h5>
										</div>
										<div className="card-body">
											<div className="row">
												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="ref_numb">
														Reference Number{' '}
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
												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="first_name">
														First Name
													</label>
													<Field id="first_name" name="first_name">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="first_name"
																placeholder="Enter first name"
															/>
														)}
													</Field>
													<ErrorBlock name="first_name" />
												</div>
												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="middle_name">
														Middle Name
													</label>
													<Field id="middle_name" name="middle_name">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="middle_name"
																placeholder="Enter middle name"
															/>
														)}
													</Field>
												</div>
												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="last_name">
														Last Name
													</label>
													<Field id="last_name" name="last_name">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="last_name"
																placeholder="Enter last name"
															/>
														)}
													</Field>
													<ErrorBlock name="last_name" />
												</div>
												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="alias">
														Alias <span style={{ color: 'red' }}></span>
													</label>
													<Field id="alias" name="alias">
														{({ input, meta }) => (
															<div className={`form-control ${error(meta)}`}>
																{tagChild}
																{inputVisible && (
																	<Input
																		type="text"
																		size="small"
																		value={inputValue}
																		onChange={handleInputChange}
																		onBlur={handleInputConfirm}
																		onPressEnter={handleInputConfirm}
																		style={{
																			width: 78,
																			marginRight: 8,
																			marginTop: 5,
																		}}
																	/>
																)}
																{!inputVisible && (
																	<Tag
																		onClick={showInput}
																		className="site-tag-plus"
																	>
																		<i className="ri-add-line" /> Add
																	</Tag>
																)}
																<input
																	{...input}
																	type="hidden"
																	value={alias}
																	onChange={() => {}}
																	onBlur={() => input.onBlur(alias)}
																/>
															</div>
														)}
													</Field>
													<ErrorBlock name="alias" />
												</div>
												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="phone_number">
														Phone
													</label>
													<Field id="phone_number" name="phone_number">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="phone_number"
																placeholder="Enter phone number"
															/>
														)}
													</Field>
													<ErrorBlock name="phone" />
												</div>
												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="email">
														Email
													</label>
													<Field id="email" name="email">
														{({ input, meta }) => (
															<input
																{...input}
																type="email"
																className={`form-control ${error(meta)}`}
																id="email"
																placeholder="Enter email address"
															/>
														)}
													</Field>
													<ErrorBlock name="email" />
												</div>
												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="gender_id">
														Gender
													</label>
													<Field id="gender_id" name="gender_id">
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
																placeholder="Select Gender"
																onChange={value => input.onChange(value)} // Handle change event
																options={genders.map(gender => ({
																	value: gender.id, // Map id to value
																	label: gender.name, // Map name to label
																}))}
																className="custom-gender-select" // Custom class for further styling
															/>
														)}
													</Field>
													<ErrorBlock name="gender_id" />
												</div>

												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="dob">
														Date Of Birth <span style={{ color: 'red' }}></span>
													</label>
													<Field id="dob" name="dob">
														{({ input, meta }) => (
															<Flatpickr
																className={`form-control ${error(meta)}`}
																options={{
																	dateFormat: 'd M, Y',
																	maxDate: new Date(),
																}}
																placeholder="Select date of birth"
																value={dateOfBirth}
																onChange={([date]) => {
																	input.onChange(
																		moment(date).format(
																			'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ'
																		)
																	);
																	setDateOfBirth(date);
																}}
															/>
														)}
													</Field>
													<ErrorBlock name="dob" />
												</div>
												<div className="col-lg-3 mb-3">
													<label
														className="form-label"
														htmlFor="marital_status"
													>
														Marital Status
													</label>
													<Field id="marital_status" name="marital_status">
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
																placeholder="Select Marital Status"
																onChange={e => {
																	// Handle change event
																	input.onChange(e ? e.name : ''); // Update form state
																	setMaritalStatus(e); // Set selected marital status
																}}
																options={maritalStatusList.map(status => ({
																	value: status.name, // Map name to value
																	label: status.name, // Map name to label
																}))}
																className="custom-marital-status-select" // Custom class for further styling
															/>
														)}
													</Field>
													<ErrorBlock name="marital_status" />
												</div>
												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="country_id">
														Country
													</label>
													<Field id="country_id" name="country_id">
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
																placeholder="Select Country"
																onChange={e => {
																	// Handle change event
																	input.onChange(e ? e.id : ''); // Update form state
																	setCountry(e); // Set selected country
																	setStates([]); // Reset states
																	fetchStates(e.id); // Fetch states based on selected country
																	form.change('state', undefined); // Reset the state field
																}}
																options={countries.map(country => ({
																	value: country.id, // Map id to value
																	label: country.en_short_name, // Map name to label
																}))}
																className="custom-country-select" // Custom class for further styling
															/>
														)}
													</Field>
													<ErrorBlock name="country_id" />
												</div>

												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="state_id">
														State
													</label>
													<Field id="state_id" name="state_id">
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
																placeholder="Select State"
																onChange={value => input.onChange(value)} // Handle change event
																options={states.map(state => ({
																	value: state.id, // Map id to value
																	label: state.name, // Map name to label
																}))}
																className="custom-state-select" // Custom class for further styling
															/>
														)}
													</Field>
													<ErrorBlock name="state_id" />
												</div>
											</div>
										</div>
									</div>
									<div className="card">
										<div className="card-header">
											<h5 className="card-title mb-0">Technical Information</h5>
										</div>
										<div className="card-body">
											<div className="row">
												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="category_id">
														Category <span style={{ color: 'red' }}>*</span>
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
																className={`custom-category-select ${error(
																	meta
																)}`} // Custom class for further styling
															/>
														)}
													</Field>
													<ErrorBlock name="category_id">ctyfctfcht</ErrorBlock>
												</div>
												<div className="col-lg-3 mb-3">
													<label
														className="form-label"
														htmlFor="organisation_id"
													>
														Organization
													</label>
													<Field id="organisation_id" name="organisation_id">
														{({ input, meta }) => (
															<Select
																style={{ width: '100%', height: '40px' }}
																placeholder="Select Organisation"
																onChange={value => {
																	setSelectedOrganization(value); // Store selected organization in state
																	input.onChange(value); // Sync with form
																}}
																options={organizations} // Provide organizations list
															/>
														)}
													</Field>
													<ErrorBlock name="organisation_id" />
												</div>
												<div className="col-lg-3 mb-3">
													<label
														className="form-label"
														htmlFor="passport_number"
													>
														Passport Number
													</label>
													<Field id="passport_number" name="passport_number">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="passport_number"
																placeholder="Enter passport no"
															/>
														)}
													</Field>
													<ErrorBlock name="passport_number" />
												</div>
												<div className="col-lg-3 mb-3">
													<label
														className="form-label"
														htmlFor="other_id_number"
													>
														Other ID Number
													</label>
													<Field id="other_id_number" name="other_id_number">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="other_id_number"
																placeholder="Enter number"
															/>
														)}
													</Field>
													<ErrorBlock name="other_id_number" />
												</div>
												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="affiliation">
														Affiliation <span style={{ color: 'red' }}></span>
													</label>

													<Field id="affiliation" name="affiliation">
														{({ input, meta }) => (
															<Select
																mode="multiple"
																allowClear
																style={{
																	width: '100%',
																	height: '40px',
																	borderColor: '#ced4da',
																}}
																placeholder="Please Affiliation"
																onChange={handleAffiliationChange}
																options={affiliations}
															/>
														)}
													</Field>

													<ErrorBlock name="affiliation" />
												</div>
												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="role">
														Role
													</label>
													<Field id="role" name="role">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="role"
																placeholder="Enter role"
															/>
														)}
													</Field>
													<ErrorBlock name="role" />
												</div>
												<div className="col-lg-3 mb-3">
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
												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="status_id">
														Status <span style={{ color: 'red' }}></span>
													</label>
													<Field id="status_id" name="status_id">
														{({ input, meta }) => (
															<Select
																style={{
																	width: '100%',
																	height: '40px',
																	borderColor:
																		meta.touched && meta.error
																			? 'red'
																			: '#ced4da',
																}}
																placeholder="Select Status"
																onChange={value => input.onChange(value)}
																options={poiStatuses?.map(source => ({
																	value: source.id,
																	label: source.name,
																}))}
																className="custom-source-select"
															/>
														)}
													</Field>
													<ErrorBlock name="status_id" />
												</div>

												<div className="col-lg-6 mb-3">
													<label className="form-label" htmlFor="address">
														Address
													</label>
													<Field id="address" name="address">
														{({ input, meta }) => (
															<textarea
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="address"
																placeholder="Enter address"
															/>
														)}
													</Field>
													<ErrorBlock name="address" />
												</div>
												<div className="col-lg-6 mb-3">
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
															/>
														)}
													</Field>
													<ErrorBlock name="remark" />
												</div>
											</div>
										</div>
									</div>
									<div className="card">
										<div className="card-header">
											<h5 className="card-title mb-0">Social Media</h5>
										</div>
										<div className="card-body">
											<div className="row">
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="hq">
														Website
													</label>
													<Field id="website" name="website">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="website"
																placeholder="Website"
															/>
														)}
													</Field>
													<ErrorBlock name="website" />
												</div>
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="hq">
														Facebook
													</label>
													<Field id="fb" name="fb">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="hq"
																placeholder="Facebook"
															/>
														)}
													</Field>
													<ErrorBlock name="fb" />
												</div>
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="instagram">
														Instagram
													</label>
													<Field id="instagram" name="instagram">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="instagram"
																placeholder="Instagram"
															/>
														)}
													</Field>
													<ErrorBlock name="instagram" />
												</div>

												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="twitter">
														X
													</label>
													<Field id="twitter" name="twitter">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="twitter"
																placeholder="X handle"
															/>
														)}
													</Field>
													<ErrorBlock name="twitter" />
												</div>

												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="telegram">
														Telegram
													</label>
													<Field id="telegram" name="telegram">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="telegram"
																placeholder="Telegram"
															/>
														)}
													</Field>
													<ErrorBlock name="telegram" />
												</div>

												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="tiktok">
														Tiktok
													</label>
													<Field id="tiktok" name="tiktok">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="tiktok"
																placeholder="Tiktok Handle"
															/>
														)}
													</Field>
													<ErrorBlock name="tiktok" />
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
											Create POI
										</button>
									</div>
								</div>

								<div className="col-lg-4">
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
								</div>
							</div>
						</FormWrapper>
					)}
				/>
			</div>
		</div>
	);
};

export default NewPoi;
