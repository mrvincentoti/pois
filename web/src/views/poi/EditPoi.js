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
import { Flex, Input, Tag, theme, Tooltip } from 'antd';
import { message, Upload } from 'antd';
import {
	FETCH_GENDERS_API,
	FETCH_STATES_API,
	FETCH_POI_CATEGORY_API,
	FETCH_SOURCES_API,
	FETCH_COUNTRIES_API,
	FETCH_AFFILIATIONS_API,
	GET_POI_API,
	UPDATE_POI_API,
	FETCH_POI_STATUSES_API,
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
const EditPoi = () => {
	const [loaded, setLoaded] = useState(false);
	const [poi, setPoi] = useState(null);

	const [state, setState] = useState(null);
	const [maritalStatus, setMaritalStatus] = useState(null);
	const [passportCategory, setPassportCategory] = useState(null);
	const [confirmation, setConfirmation] = useState(null);
	const [category, setCategory] = useState(null);
	const [categories, setCategories] = useState([]);
	const [sources, setSources] = useState([]);
	const [source, setSource] = useState([]);
	const [poiStatuses, setPoiStatuses] = useState(null);
	const [poiStatus, setPoiStatus] = useState(null);
	const [affiliations, setAffiliations] = useState([]);
	const [alias, setAlias] = useState([]);
	const [allAffiliations, setAllAffiliations] = useState([]);

	const [genders, setGenders] = useState([]);
	const [countries, setCountries] = useState([]);
	const [country, setCountry] = useState(null);
	const [states, setStates] = useState([]);

	const [dateOfBirth, setDateOfBirth] = useState('');
	const [imageUrl, setImageUrl] = useState();
	const [imageString, setImageString] = useState();

	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();
	const param = useParams();

	const [tags, setTags] = useState([]);
	const [inputVisible, setInputVisible] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [fileList, setFileList] = useState([]);

	const fetchApis = useCallback(async () => {
		try {
			const urls = [
				FETCH_GENDERS_API,
				`${FETCH_COUNTRIES_API}?per_page=300`,
				FETCH_POI_CATEGORY_API,
				FETCH_SOURCES_API,
				`${FETCH_AFFILIATIONS_API}?page=0`,
				FETCH_POI_STATUSES_API,
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
			] = await Promise.all(requests);
			setGenders(rs_genders.genders);
			setCountries(rs_countries.countries);
			setCategories(rs_categories.categories);
			setSources(rs_sources.sources);
			setAllAffiliations(rs_affiliations.affiliations);
			setPoiStatuses(rs_statuses.statuses);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchStates = useCallback(async country_id => {
		const rs = await request(FETCH_STATES_API.replace('/:id', ''));
		setStates(rs.states);
	}, []);

	const fetchPoi = useCallback(async id => {
		try {
			const rs = await request(GET_POI_API.replace(':id', id));

			return rs.poi_data;
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const changeImage = data => {
		setImageUrl(data);
	};

	useEffect(() => {
		if (!loaded) {
			fetchApis();
			if (countries.length > 0 && allAffiliations.length > 0) {
				fetchPoi(param.id).then(item => {
					if (!item) {
						notifyWithIcon('error', 'poi not found!');
						navigate('/pois/poi');
						return;
					}

					if (item.alias) {
						try {
							const tagsArray = item.alias.split(',').map(tag => tag.trim());

							setAlias(tagsArray);
							setTags(tagsArray);
						} catch (error) {
							console.error('Failed to parse alias:', error);

							const jsonArray = [item.alias];
							setAlias(jsonArray);
						}
					}

					setDateOfBirth(new Date(item.dob));
					setState(item.state?.id);
					setCountry(item.country?.id);
					setSource(item.source?.id);
					setPoi(item);
					setCategory(item.category?.id);
					setPoiStatus(item.poi_status?.id);

					const affiliations_list =
						item.affiliation_ids?.split(',').map(a => {
							const affiliation = allAffiliations.find(
								item => item.id === Number(a)
							);
							console.log(affiliation);
							return { label: affiliation?.name || '', value: Number(a) };
						}) || [];
					// console.log(affiliations_list);

					setAffiliations(affiliations_list);

					setImageString(item.picture);
					if (item.marital_status)
						setMaritalStatus(
							maritalStatusList.find(
								status => status.name === item.marital_status
							)
						);
					setLoaded(true);
				});
			}
		}
	}, [
		fetchApis,
		fetchPoi,
		loaded,
		navigate,
		countries,
		allAffiliations,
		param.id,
	]);

	const handleClose = removedTag => {
		const newTags = tags.filter(tag => tag !== removedTag);
		setTags(newTags);
	};

	const showInput = () => {
		setInputVisible(true);
	};

	const handleInputChange = e => {
		setInputValue(e.target.value);
	};

	const handleInputConfirm = () => {
		if (inputValue && tags.indexOf(inputValue) === -1) {
			setTags([...tags, inputValue]);
		}
		setInputVisible(false);
		setInputValue('');
	};

	const handleChangeCat = value => {
		setCategory(value);
	};
	const handleCancel = () => {
		navigate(-1); // This will take the user back to the previous page
	};

	const forMap = tag => (
		<span key={tag} style={{ display: 'inline-block' }}>
			<Tag closable onClose={() => handleClose(tag)}>
				{tag}
			</Tag>
		</span>
	);

	const tagChild = tags.map(forMap);

	// Function to convert null or undefined values to an empty string
	const convertNullToEmptyString = obj => {
		for (let key in obj) {
			if (obj[key] === null || obj[key] === undefined) {
				obj[key] = ''; // Convert null or undefined to an empty string
			}
		}
	};

	const onSubmit = async values => {
		convertNullToEmptyString(values);

		try {
			// Create a FormData object
			const formData = new FormData();
			// Append your values to FormData

			if (maritalStatus) values.marital_status = maritalStatus.name;
			if (dateOfBirth) values.dob = dateOfBirth;
			if (tags) values.alias = tags;

			for (const key in values) {
				formData.append(key, values[key]);
			}

			// Function to append to formData only if the value exists
			const appendIfExists = (key, value) => {
				if (value !== undefined && value !== null) {
					formData.append(key, value);
				}
			};

			// Conditionally append values to FormData, with empty strings for non-existent values
			if (values.category) {
				formData.append('category_id', category);
			}

			// Conditionally append values to FormData, with empty strings for non-existent values
			if (country) {
				formData.append('country_id', country);
			}

			if (values.source) {
				formData.append('source_id', source || '');
			}
			if (values.gender) {
				formData.append('gender_id', values.gender?.id || '');
			}

			if (values.state) {
				formData.append('state_id', state || '');
			}

			if (values.marital_status) {
				formData.append('marital_status', values.marital_status?.name || '');
			}
			if (imageUrl) {
				formData.append('picture', imageUrl?.file || ''); // Ensure imageUrl is not null
			}
			if (tags) {
				formData.append('alias', tags.length > 0 ? tags.join(', ') : ''); // Ensure alias is not null
			}

			if (values.affiliation) {
				formData.set('affiliation', affiliations.map(o => o.value).join(','));
			}

			if (poiStatus) {
				formData.append('status_id', poiStatus);
			}

			formData.set('country', undefined);
			formData.set('category', undefined);

			// for (let pair of formData.entries()) {
			// 	console.log(`${pair[0]}: ${pair[1]}`);
			// }

			// return

			const uri = UPDATE_POI_API.replace(':id', param.id);

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
				notifyWithIcon('success', 'POI updated successfully');
				navigate(`/pois/poi/${values.category.id}/list`);
			}
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not create Poi' };
		}
	};
	const handleChangeSource = value => {
		setSource(value);
	};
	const handleChangeStatus = value => {
		setPoiStatus(value);
	};
	// const handleChangeCat = value => {
	// 	setCategory(value);
	// };
	const handleChangeState = value => {
		setState(value);
	};

	const handleCountryChange = value => {
		setCountry(value);
		setStates([]); // Clear the states when a new country is selected
		fetchStates(value); // Fetch the states for the selected country
	};

	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="EDIT POI" parentPage="POI" />
			<div className="row">
				<Form
					initialValues={{
						...poi,
						gender_id: poi?.gender?.id || '',
						category: poi?.category,
						country: poi?.country,
						state: poi?.state,
						affiliation:
							poi?.affiliation_ids.split(',').map(a => {
								const affiliation = allAffiliations.find(
									item => item.id === Number(a)
								);
								return { label: affiliation?.name || '', value: Number(a) };
							}) || '',
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
								<div className="col-lg-8">
									<div className="card">
										<div className="card-header">
											<h5 className="card-title mb-0">Personal Information</h5>
										</div>
										<div className="card-body">
											<div className="row">
												<div className="col-lg-4 mb-3">
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
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="first_name">
														First Name <span style={{ color: 'red' }}>*</span>
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
												<div className="col-lg-4 mb-3">
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
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="last_name">
														Last Name <span style={{ color: 'red' }}>*</span>
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
												<div className="col-lg-4 mb-3">
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
																	value={tags}
																	onChange={() => {}}
																	onBlur={() => input.onBlur(tags)}
																/>
															</div>
														)}
													</Field>
													<ErrorBlock name="alias" />
												</div>

												<div className="col-lg-4 mb-3">
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
												<div className="col-lg-4 mb-3">
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

												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="gender_id">
														Gender <span style={{ color: 'red' }}>*</span>
													</label>
													<Field id="gender_id" name="gender_id">
														{({ input, meta }) => (
															<Select
																{...input}
																className={
																	meta.touched && meta.error ? 'error' : ''
																}
																placeholder="Select gender"
																style={{
																	width: '100%',
																	height: '40px',
																	borderColor:
																		meta.touched && meta.error
																			? 'red'
																			: '#ced4da',
																}}
																options={genders.map(gender => ({
																	value: gender.id, // Set the ID as value
																	label: gender.name, // Set the name as label
																}))}
																onChange={(value, option) =>
																	input.onChange(value)
																} // Handle change
															/>
														)}
													</Field>
													<ErrorBlock name="gender_id" />
												</div>

												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="dateOfBirth">
														Date Of Birth <span style={{ color: 'red' }}></span>
													</label>
													<Field id="dateOfBirth" name="dateOfBirth">
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
																		moment(date).format('YYYY-MM-DD')
																	);
																	setDateOfBirth(date);
																}}
															/>
														)}
													</Field>
													<ErrorBlock name="dateOfBirth" />
												</div>
												<div className="col-lg-4 mb-3">
													<label
														className="form-label"
														htmlFor="marital_status"
													>
														Marital Status
													</label>

													<Field id="marital_status" name="marital_status">
														{({ input, meta }) => (
															<Select
																{...input}
																placeholder="Select marital status"
																style={{
																	width: '100%',
																	height: '40px',
																	borderColor:
																		meta.touched && meta.error
																			? 'red'
																			: '#ced4da',
																}}
																options={maritalStatusList.map(status => ({
																	value: status.id, // Set the ID as value
																	label: status.name, // Set the name as label
																}))}
																value={maritalStatus} // Bind the selected value
																className={
																	meta.touched && meta.error ? 'error' : ''
																}
																onChange={value => {
																	value
																		? input.onChange(value)
																		: input.onChange(''); // Update
																	setMaritalStatus(value); // Update local state
																}}
															/>
														)}
													</Field>
													<ErrorBlock name="marital_status" />
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
												<div className="col-lg-4 mb-3">
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
												<div className="col-lg-6 mb-3">
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
																placeholder="Enter passport no"
															/>
														)}
													</Field>
													<ErrorBlock name="other_id_number" />
												</div>
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="affiliation">
														Affiliation <span style={{ color: 'red' }}></span>
													</label>

													<Field name="affiliation">
														{({ input, meta }) => (
															<Select
																mode="multiple"
																allowClear
																style={{
																	width: '100%',
																	height: '40px',
																	borderColor:
																		meta.touched && meta.error
																			? 'red'
																			: '#ced4da', // Conditional styling
																}}
																placeholder="Please select affiliation"
																onChange={(value, options) => {
																	input.onChange(value); // Update form state
																	setAffiliations(options); // Handle additional logic if
																}}
																options={allAffiliations.map(affiliation => ({
																	value: affiliation.id, // Set the ID as value
																	label: affiliation.name, // Set the name as label
																}))}
																value={affiliations} // Bind the selected values
															/>
														)}
													</Field>

													<ErrorBlock name="affiliation" />
												</div>
												<div className="col-lg-4 mb-3">
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
												<div className="col-lg-6 mb-3">
													<label className="form-label" htmlFor="country_id">
														Country <span style={{ color: 'red' }}>*</span>
													</label>
													<Field id="country_id" name="country_id">
														{({ input, meta }) => (
															<Select
																{...input}
																style={{
																	width: '100%',
																	height: '40px',
																	borderColor:
																		meta.touched && meta.error
																			? 'red'
																			: '#ced4da',
																}}
																placeholder="Select Country"
																onChange={handleCountryChange}
																value={country}
																options={countries.map(country => ({
																	value: country.id, // Set the ID as value
																	label: country.en_short_name || country.name, // Use either en_short_name or name
																}))}
																className="custom-country-select"
															/>
														)}
													</Field>
													<ErrorBlock name="country_id" />
												</div>

												<div className="col-lg-6 mb-3">
													<label className="form-label" htmlFor="state_id">
														State <span style={{ color: 'red' }}>*</span>
													</label>
													<Field id="state_id" name="state_id">
														{({ input, meta }) => (
															<Select
																{...input}
																style={{
																	width: '100%',
																	height: '40px',
																	borderColor:
																		meta.touched && meta.error
																			? 'red'
																			: '#ced4da',
																}}
																onChange={handleChangeState}
																placeholder="Select state"
																value={state}
																options={states.map(state => ({
																	value: state.id, // Set the ID as value
																	label: state.name, // Set the name as label
																}))}
																className="custom-state-select"
															/>
														)}
													</Field>
													<ErrorBlock name="state_id" />
												</div>
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="category">
														Category <span style={{ color: 'red' }}></span>
													</label>
													<Field id="category" name="category">
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
																placeholder="Select Category"
																onChange={handleChangeCat}
																value={category}
																options={categories.map(c => ({
																	label: c.name,
																	value: c.id,
																}))}
																className="custom-category-select"
															/>
														)}
													</Field>
													<ErrorBlock name="category" />
												</div>

												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="source">
														Source <span style={{ color: 'red' }}></span>
													</label>

													<Field id="source" name="source">
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
																value={source}
																placeholder="Select Source"
																onChange={handleChangeSource} // Handle change event
																options={sources.map(s => ({
																	label: s.name,
																	value: s.id,
																}))}
															/>
														)}
													</Field>
													<ErrorBlock name="source" />
												</div>
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="poiStatus">
														Status <span style={{ color: 'red' }}></span>
													</label>
													<Field id="poiStatus" name="poiStatus">
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
																onChange={handleChangeStatus}
																value={poiStatus}
																options={poiStatuses?.map(source => ({
																	value: source.id,
																	label: source.name,
																}))}
																className="custom-source-select"
															/>
														)}
													</Field>
													<ErrorBlock name="poiStatus" />
												</div>

												<div className="col-lg-12 mb-3">
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
											Update POI
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
													imageString={imageString}
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

export default EditPoi;
