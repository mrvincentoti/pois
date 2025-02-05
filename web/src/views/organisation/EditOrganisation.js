import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
	FETCH_ORG_CATEGORY_API,
	LIST_SOURCES_API,
	FETCH_COUNTRIES_API,
	LIST_AFFILIATIONS_API,
	GET_ORG_API,
	UPDATE_ORG_API,
} from '../../services/api';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import { Select } from 'antd';
import UploadFilePicture from '../../components/UploadFile';

import { maritalStatusList } from '../../services/constants';
const EditOrganisation = () => {
	const [loaded, setLoaded] = useState(false);
	const [org, setOrg] = useState(null);
	const [orgItem, setOrgItem] = useState(null);
	const [dateOfRegistration, setDateOfRegistration] = useState(null);
	const [boardOfDirectors, setBoardOfDirectors] = useState([]);
	const [investors, setInvestors] = useState([]);
	const [operationals, setOperationals] = useState([]);
	const [affiliations, setAffiliations] = useState([]);

	// Investors
	const [inputValueInvestors, setInputValueInvestors] = useState('');
	const [inputVisibleInvestors, setInputVisibleInvestors] = useState(false);
	const [maritalStatus, setMaritalStatus] = useState(null);
	const [category, setCategory] = useState(null);
	const [categories, setCategories] = useState([]);
	const [sources, setSources] = useState([]);

	const [source, setSource] = useState([]);
	const [allAffiliations, setAllAffiliations] = useState([]);
	const [alias, setAlias] = useState([]);

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
	const [inputVisibleBOD, setInputVisibleBOD] = useState(false);
	const [inputValueBOD, setInputValueBOD] = useState('');

	// Board of directors edit
	// const [initialValues, setInitialValues] = useState({ affiliation: [] });

	const initialValues = useMemo(
		() => ({
			...orgItem,
			affiliation:
				orgItem?.affiliations
					?.split(',')
					?.map(_affiliation => {
						const foundAffiliation = allAffiliations.find(
							item =>
								item.name.trim().toLowerCase() ===
								_affiliation.trim().toLowerCase()
						);
						return foundAffiliation
							? {
									label: foundAffiliation.name,
									value: foundAffiliation.id,
								}
							: null;
					})
					.filter(Boolean) || [],
			country:
				orgItem?.countries_operational?.split(',')?.map(operational => {
					const country = countries.find(
						c => c.en_short_name === operational.trim()
					);
					return {
						value: country?.id,
						label: country?.en_short_name || '',
					};
				}) || [],
		}),
		[allAffiliations, countries, orgItem]
	);

	const showInput2 = () => {
		setInputVisible(true);
	};

	const handleInputChange2 = e => {
		setInputValue(e.target.value);
	};

	const handleInputConfirm2 = () => {
		if (inputValue && !boardOfDirectors.includes(inputValue)) {
			setBoardOfDirectors([...boardOfDirectors, inputValue]);
		}
		setInputVisible(false);
		setInputValue('');
	};

	const handleRemoveTag2 = removedTag => {
		setBoardOfDirectors(boardOfDirectors.filter(tag => tag !== removedTag));
	};

	const fetchApis = useCallback(async () => {
		try {
			const urls = [
				FETCH_GENDERS_API,
				`${FETCH_COUNTRIES_API}?per_page=300`,
				FETCH_ORG_CATEGORY_API,
				LIST_SOURCES_API,
				LIST_AFFILIATIONS_API,
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
			setGenders(rs_genders.genders);
			setCountries(rs_countries.countries);
			setCategories(rs_categories.categories);
			setSources(rs_sources.sources);
			setAllAffiliations(rs_affiliations.affiliations);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchOrg = useCallback(async id => {
		try {
			const rs = await request(GET_ORG_API.replace(':id', id));

			return rs.organisation;
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const changeImage = data => {
		setImageUrl(data);
	};

	const handleCloseInvestors = removedTag => {
		const newTags = investors.filter(tag => tag !== removedTag);
		setInvestors(newTags);
	};

	const handleInputChangeInvestors = e => {
		setInputValueInvestors(e.target.value);
	};

	const handleInputConfirmInvestors = () => {
		if (inputValueInvestors && !investors.includes(inputValueInvestors)) {
			setInvestors([...investors, inputValueInvestors]);
		}
		setInputVisibleInvestors(false);
		setInputValueInvestors('');
	};

	useEffect(() => {
		if (!loaded) {
			fetchApis();
			if (countries.length > 0 && allAffiliations.length > 0) {
				fetchOrg(param.id).then(item => {
					if (!item) {
						notifyWithIcon('error', 'org not found!');
						navigate(-1);
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

					setDateOfRegistration(new Date(item.date_of_registration));
					setCountry(item.country);
					setSource(item.source?.id);

					setCategory(item.category?.id);
					setOrg(item);
					setOrgItem(item);

					const operational_list =
						item?.countries_operational?.split(',')?.map(operational => {
							const country = countries.find(
								c => c.en_short_name === operational.trim()
							);
							return {
								value: Number(country?.id),
								label: country?.en_short_name || '',
							};
						}) || [];
					setOperationals(operational_list);

					const affiliations_list =
						item?.affiliations?.split(',')?.map(_affiliation => {
							const affiliation = allAffiliations.find(
								item => item.name === _affiliation.trim()
							);
							return { label: affiliation?.name || '', value: affiliation?.id };
						}) || [];
					setAffiliations(affiliations_list);

					setBoardOfDirectors(
						item.board_of_directors.split(',').map(name => name.trim())
					);
					setInvestors(item.investors.split(',').map(name => name.trim()));

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
		fetchOrg,
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

	const showInputInvestors = () => {
		setInputVisibleInvestors(true);
	};

	const handleInputChange = e => {
		setBoardOfDirectors(e.target.value);
	};

	const handleInputConfirm = () => {
		if (boardOfDirectors && tags.indexOf(boardOfDirectors) === -1) {
			setTags([...tags, boardOfDirectors]);
		}
		setInputVisible(false);
		setBoardOfDirectors('');
	};

	const handleChangeCat = value => {
		setCategory(value);
	};

	const handleChangeSource = value => {
		setSource(value);
	};
	const handleCancel = () => {
		navigate(-1); // This will take the user back to the previous page
	};

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
			const formData = new FormData();
			if (maritalStatus) values.marital_status = maritalStatus.name;
			if (dateOfBirth) values.dob = dateOfBirth;
			if (tags) values.alias = tags;

			if (dateOfRegistration) {
				values.date_of_registration =
					moment(dateOfRegistration).format('YYYY-MM-DD');
			}

			for (const key in values) {
				formData.append(key, values[key]);
			}

			const appendIfExists = (key, value) => {
				if (value !== undefined && value !== null) {
					formData.append(key, value);
				}
			};

			if (operationals.length !==0 && operationals.length > 0) {
				formData.set(
					'countries_operational',
					operationals.map(o => o.value).join(',')
				);
			} else {
				formData.set(
					'countries_operational',
					[]
				);
			}

			if (values.category) {
				formData.set('category_id', category);
			}
			if (source) {
				formData.set('source_id', source);
			}
			if (values.org_name) {
				formData.append('org_name', values.org_name);
			}
			if (values.reg_numb) {
				formData.append('reg_numb', values.reg_numb);
			}
			if (values.ref_numb) {
				formData.append('ref_numb', values.ref_numb);
			}
			if (values.email) {
				formData.append('email', values.email);
			}
			if (values.source) {
				formData.append('source_id', values.source?.id || '');
			}
			if (values.gender) {
				formData.append('gender_id', values.gender?.id || '');
			}
			if (values.state) {
				formData.append('state_id', values.state?.id || '');
			}
			if (values.affiliation) {
				formData.set('affiliations', affiliations.map(o => o.value).join(','));
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
			if (boardOfDirectors) {
				formData.set(
					'board_of_directors',
					boardOfDirectors.length > 0 ? boardOfDirectors.join(', ') : ''
				); 
			}
			if (investors) {
				formData.set(
					'investors',
					investors.length > 0 ? investors.join(', ') : ''
				);
			}

			if (!values.employee_strength || isNaN(values.employee_strength)) {
				notifyWithIcon('error', 'Strength must be a number');
				return;
			}

			values.employee_strength = Number(values.employee_strength);

			formData.set('employee_strength', values.employee_strength);

			formData.set('affiliation', undefined);
			formData.set('category', undefined);

			const uri = UPDATE_ORG_API.replace(':id', param.id);

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
				notifyWithIcon('success', 'Organisation updated successfully');
				// navigate(`/org/organisation/${values.category.id}`);
				navigate(-1);
			}
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not create Poi' };
		}
	};

	// Investors tag

	const forMapInvestors = tag => (
		<span key={tag} style={{ display: 'inline-block' }}>
			<Tag closable onClose={() => handleCloseInvestors(tag)}>
				{tag}
			</Tag>
		</span>
	);
	const tagChildInvestors = investors.map(forMapInvestors);

	// BoD tag
	const handleCloseBOD = removedTag => {
		const newTags = boardOfDirectors.filter(tag => tag !== removedTag);
		setBoardOfDirectors(newTags);
	};

	const forMapBOD = tag => (
		<span key={tag} style={{ display: 'inline-block' }}>
			<Tag closable onClose={() => handleCloseBOD(tag)}>
				{tag}
			</Tag>
		</span>
	);
	const tagChildBOD = boardOfDirectors.map(forMapBOD);

	const handleInputConfirmBOD = () => {
		if (inputValueBOD && !boardOfDirectors.includes(inputValueBOD)) {
			setBoardOfDirectors([...boardOfDirectors, inputValueBOD]);
		}
		setInputVisibleBOD(false);
		setInputValueBOD('');
	};

	const handleInputChangeBOD = e => {
		setInputValueBOD(e.target.value);
	};

	const showInputBOD = () => {
		setInputVisibleBOD(true);
	};

	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="EDIT ORG" parentPage="ORG" />
			<div className="row">
				<Form
					initialValues={initialValues}
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
													<label className="form-label" htmlFor="org_name">
														Organisation Name
													</label>
													<Field id="org_name" name="org_name">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="org_name"
																placeholder="Organisation Name"
															/>
														)}
													</Field>
												</div>
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="reg_numb">
														Registration Number
													</label>
													<Field id="reg_numb" name="reg_numb">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="reg_numb"
																placeholder="Enter reg numb"
															/>
														)}
													</Field>
													<ErrorBlock name="other_id_number" />
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
													<label
														className="form-label"
														htmlFor="date_of_registration">
														Establishment Date{' '}
														<span style={{ color: 'red' }}></span>
													</label>
													<Field
														id="date_of_registration"
														name="date_of_registration">
														{({ input, meta }) => (
															<Flatpickr
																className={`form-control ${error(meta)}`}
																options={{
																	dateFormat: 'd M, Y',
																	maxDate: new Date(),
																}}
																placeholder="Select date of registration"
																value={dateOfRegistration}
																onChange={([date]) => {
																	const formattedDate =
																		moment(date).format('YYYY-MM-DD');
																	input.onChange(formattedDate);
																	setDateOfRegistration(date);
																}}
															/>
														)}
													</Field>
													<ErrorBlock name="date_of_registration" />
												</div>
												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="category">
														Category <span style={{ color: 'red' }}>*</span>
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
												<div className="col-lg-3 mb-3">
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
												<div className="col-lg-3 mb-3">
													<label
														className="form-label"
														htmlFor="nature_of_business">
														Modus Operandi
													</label>
													<Field
														id="nature_of_business"
														name="nature_of_business">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="nature_of_business"
																placeholder="Modus Operandi"
															/>
														)}
													</Field>
													<ErrorBlock name="nature_of_business" />
												</div>
												<div className="col-lg-3 mb-3">
													<label
														className="form-label"
														htmlFor="employee_strength">
														Strength
													</label>
													<Field
														id="employee_strength"
														name="employee_strength">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="employee_strength"
																placeholder=" Strength"
															/>
														)}
													</Field>
													<ErrorBlock name="employee_strength" />
												</div>

												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="ceo">
														Leader
													</label>
													<Field id="ceo" name="ceo">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="ceo"
																placeholder="Leader"
															/>
														)}
													</Field>
													<ErrorBlock name="ceo" />
												</div>

												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="phone_number">
														Phone Number
													</label>
													<Field id="phone_number" name="phone_number">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="phone_number"
																placeholder="Phone Number"
															/>
														)}
													</Field>
													<ErrorBlock name="phone_number" />
												</div>
												<div className="col-lg-3 mb-3">
													<label className="form-label" htmlFor="email">
														Email
													</label>
													<Field id="email" name="email">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="email"
																placeholder="Email"
															/>
														)}
													</Field>
													<ErrorBlock name="email" />
												</div>
												<div className="col-lg-6 mb-3">
													<label className="form-label" htmlFor="investors">
														Top Commanders
													</label>

													<Field
														id="board_of_directors"
														name="board_of_directors">
														{({ input, meta }) => (
															<div className={`form-control ${error(meta)}`}>
																{tagChildBOD}
																{inputVisibleBOD && (
																	<Input
																		type="text"
																		size="small"
																		value={inputValueBOD}
																		onChange={handleInputChangeBOD}
																		onBlur={handleInputConfirmBOD}
																		onPressEnter={handleInputConfirmBOD}
																		style={{
																			width: 78,
																			marginRight: 8,
																			marginTop: 5,
																		}}
																	/>
																)}
																{!inputVisibleBOD && (
																	<Tag
																		onClick={showInputBOD}
																		className="site-tag-plus">
																		<i className="ri-add-line" /> Add
																	</Tag>
																)}
																<input
																	{...input}
																	type="hidden"
																	value={boardOfDirectors}
																	onChange={() => {}}
																	onBlur={() => input.onBlur(boardOfDirectors)}
																/>
															</div>
														)}
													</Field>

													<ErrorBlock name="board_of_directors" />
												</div>
												<div className="col-lg-6 mb-3">
													<label className="form-label" htmlFor="country">
														Operational Country{' '}
														<span style={{ color: 'red' }}></span>
													</label>

													<Field id="country" name="country">
														{({ input, meta }) => (
															<Select
																mode="multiple"
																allowClear
																style={{
																	width: '100%',
																	height: '40px',
																	borderColor: '#ced4da',
																}}
																value={operationals}
																placeholder="Please Country"
																onChange={(value, option) => {
																	input.onChange(value);
																	setOperationals(option);
																}}
																options={countries.map(country => ({
																	value: country.id,
																	label: country.en_short_name,
																}))}
															/>
														)}
													</Field>

													<ErrorBlock name="country" />
												</div>
												<div className="col-lg-6 mb-3">
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
																			: '#ced4da',
																}}
																placeholder="Please select affiliation"
																onChange={(value, options) => {
																	input.onChange(value); // Sync with Form state
																	setAffiliations(
																		options
																	); // Sync React state
																}}
																options={allAffiliations.map(affiliation => ({
																	value: affiliation.id,
																	label: affiliation.name,
																}))}
																value={affiliations.map(a => a.value)} // Use only values for Select
															/>
														)}
													</Field>
													<ErrorBlock name="affiliation" />
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
											onClick={handleCancel}>
											Cancel
										</button>
										<button type="submit" className="btn btn-success w-sm">
											Update Organisation
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

export default EditOrganisation;
