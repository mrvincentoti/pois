import React, {useCallback, useEffect, useRef, useState} from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Link, useNavigate } from 'react-router-dom';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import { asyncFetch, notifyWithIcon, request } from '../../services/utilities';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Flex, Input, Tag, theme, Tooltip } from 'antd';
import { message, Upload } from 'antd';

import {
	CREATE_POI_API,
	FETCH_GENDERS_API,
	FETCH_STATES_API,
	FETCH_CATEGORIES_API,
	FETCH_SOURCES_API,
	FETCH_COUNTRIES_API,
	FETCH_AFFILIATIONS_API,
} from '../../services/api';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import UploadButton from '../../components/UploadItem';
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
	const [sources, setSources] = useState([]);
	const [affiliations, setAffliations] = useState([]);

	const [genders, setGenders] = useState([]);
	const [countries, setCountries] = useState([]);
	const [country, setCountry] = useState(null);
	const [states, setStates] = useState([]);
	

	const [dateOfBirth, setDateOfBirth] = useState('');
	const [imageUrl, setImageUrl] = useState();
	const [loading, setLoading] = useState(false);

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
	  const handleClose = (removedTag) => {
		const newTags = language.filter((tag) => tag !== removedTag);
		setLanguage(newTags);
	  };

	  const showInput = () => {
		setInputVisible(true);
	  };
	  const handleInputChange = (e) => {
		setInputValue(e.target.value);
	  };
	  const handleInputConfirm = () => {
		if (inputValue && !language.includes(inputValue)) {
		  setLanguage([...language, inputValue]);
		}
		setInputVisible(false);
		setInputValue('');
	  };
	  const handleEditInputChange = (e) => {
		setEditInputValue(e.target.value);
	  };
	  const handleEditInputConfirm = () => {
		const newTags = [...language];
		newTags[editInputIndex] = editInputValue;
		setLanguage(newTags);
		setEditInputIndex(-1);
		setEditInputValue('');
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
			setGenders(rs_genders.genders);
			setCountries(rs_countries.countries);
			setCategories(rs_categories.categories)
			setSources(rs_sources.sources)
			setAffliations(rs_affiliations.affiliations)
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchStates = useCallback(async country_id => {
		const rs = await request(FETCH_STATES_API.replace('/:id', ''));
		setStates(rs.states);
	}, []);

	const getBase64 = (img, callback) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => callback(reader.result));
		reader.readAsDataURL(img);
	};

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
	const tagChild = language.map(forMap);

	const handleChange = info => {
		if (info.file.status === 'uploading') {
			setLoading(true);
			return;
		}
		if (info.file.status === 'done') {
			// Get this url from response in real world.
			getBase64(info.file.originFileObj, url => {
				setLoading(false);
				setImageUrl(url);
			});
		}
	};

	const beforeUpload = file => {
		const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
		if (!isJpgOrPng) {
			message.error('You can only upload JPG/PNG file!');
		}
		const isLt2M = file.size / 1024 / 1024 < 2;
		if (!isLt2M) {
			message.error('Image must smaller than 2MB!');
		}
		return isJpgOrPng && isLt2M;
	};


	useEffect(() => {
		if (!loaded) {
			fetchApis();
			setLoaded(true);
		}
	}, [fetchApis, loaded]);

	const onSubmit = async values => {
		console.log(values)
		try {
			const config = {
				method: 'POST',
				body: {
					...values,
					category_id: values.category_id?.id || null,
					source_id: values.source_id?.id || null,
					gender_id: values.gender?.id || null,
					state_id: values.state_id?.id || null,
					affiliation_id: values.affiliation?.id || null,
					marital_status: values.marital_status?.id || null,
					picture: imageUrl || null,
					// language_spoken: language,
					gender: undefined,
					// affiliation: undefined,
					
				},
			};
			console.log(config.body);
			const rs = await request(CREATE_POI_API, config);
			console.log(rs);
			notifyWithIcon('success', rs.message);
			navigate('/pois/poi');
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not create employee' };
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

						// if (!values.pf_num) {
						// 	errors.pf_num = 'enter pf number';
						// }
						// if (!values.first_name) {
						// 	errors.first_name = 'enter first name';
						// }
						// if (!values.last_name) {
						// 	errors.last_name = 'enter last name';
						// }
						// if (!values.dob) {
						// 	errors.dob = 'enter date of birth';
						// }
						// if (!values.gender) {
						// 	errors.gender = 'select gender';
						// }
						// if (!values.affiliation) {
						// 	errors.affiliation = 'select affiliation';
						// }
						// if (!values.state_id) {
						// 	errors.state_id = 'select state of origin';
						// }
						// if (!values.pf_num) {
						// 	errors.pf_num = 'enter pfs number';
						// }
						// if (!values.lga) {
						// 	errors.lga = 'select lga';
						// }
						// if (!values.rank_id) {
						// 	errors.rank_id = 'select rank';
						// }
						// if (!values.directorate_id) {
						// 	errors.directorate_id = 'select directorate';
						// }
						// if (!values.cadre_id) {
						// 	errors.cadre_id = 'select cadre';
						// }
						// if (!values.date_of_employment) {
						// 	errors.date_of_employment = 'enter date of employment';
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
												<div className="col-lg-12 mb-3">
													<label className="form-label" htmlFor="ref_numb">
														Reference Number <span style={{ color: 'red' }}>*</span>
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
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="alias"
																placeholder="Enter alias"
															/>
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
													<label className="form-label" htmlFor="gender">
														Gender <span style={{ color: 'red' }}>*</span>
													</label>
													<Field id="gender" name="gender">
														{({ input, meta }) => (
															<Select
																{...input}
																className={error(meta)}
																placeholder="Select gender"
																options={genders}
																getOptionValue={option => option.id}
																getOptionLabel={option => option.name}
															/>
														)}
													</Field>
													<ErrorBlock name="gender" />
												</div>
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="dob">
														Date Of Birth{' '}
														<span style={{ color: 'red' }}></span>
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
																		moment(date).format('YYYY-MM-DD')
																	);
																	setDateOfBirth(date);
																}}
															/>
														)}
													</Field>
													<ErrorBlock name="dob" />
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
																options={maritalStatusList}
																value={maritalStatus}
																className={error(meta)}
																getOptionValue={option => option.name}
																getOptionLabel={option => option.name}
																onChange={e => {
																	e ? input.onChange(e) : input.onChange('');
																	setMaritalStatus(e);
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
												<div className="col-lg-6 mb-3">
													<label
														className="form-label"
														htmlFor="passport_number"
													>
														Passport Number
													</label>
													<Field
														id="passport_number"
														name="passport_number"
													>
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
													<Field
														id="other_id_number"
														name="other_id_number"
													>
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
												<div className="col-lg-6 mb-3">
													<label className="form-label" htmlFor="affiliation_id">
														Affiliation <span style={{ color: 'red' }}>*</span>
													</label>
													<Field id="affiliation_id" name="affiliation_id">
														{({ input, meta }) => (
															<Select
																{...input}
																className={error(meta)}
																placeholder="Select affiliation"
																options={affiliations}
																getOptionValue={option => option.id}
																getOptionLabel={option => option.name}
															/>
														)}
													</Field>
												</div>
												<div className="col-lg-6 mb-3">
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
													<label
														className="form-label"
														htmlFor="category_id"
													>
														Category <span style={{ color: 'red' }}></span>
													</label>
													<Field id="category_id" name="category_id">
														{({ input, meta }) => (
															<Select
																{...input}
																className={error(meta)}
																placeholder="Select Category"
																options={categories}
																getOptionValue={option => option.id}
																getOptionLabel={option => option.name}
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
																{...input}
																className={error(meta)}
																placeholder="Select source"
																options={sources}
																getOptionValue={option => option.id}
																getOptionLabel={option => option.name}
															/>
														)}
													</Field>
													<ErrorBlock name="source_id" />
												</div>
												<div className="col-lg-6 mb-3">
													<label className="form-label" htmlFor="country_id">
														Country{' '}
														<span style={{ color: 'red' }}>*</span>
													</label>
													<Field id="country_id" name="country_id">
														{({ input, meta }) => (
															<Select
																{...input}
																className={error(meta)}
																placeholder="Select country"
																options={countries}
																value={country}
																getOptionValue={option => option.id}
																getOptionLabel={option => option.en_short_name}
																onChange={e => {
																	e ? input.onChange(e.id) : input.onChange('');
																	setCountry(e)
																	setStates([])
																	fetchStates(e.id);
																	form.change('state_id', undefined)
																}}
															/>
														)}
													</Field>
													<ErrorBlock name="country_id" />
												</div>
												<div className="col-lg-6 mb-3">
													<label className="form-label" htmlFor="state_id">
														State{' '}
														<span style={{ color: 'red' }}>*</span>
													</label>
													<Field id="state_id" name="state_id">
														{({ input, meta }) => (
															<Select
																{...input}
																className={error(meta)}
																placeholder="Select state"
																options={states}
																getOptionValue={option => option.id}
																getOptionLabel={option => option.name}
															/>
														)}
													</Field>
													<ErrorBlock name="state_id" />
												</div>
												<div className="col-lg-12 mb-3">
													<label
														className="form-label"
														htmlFor="address"
													>
														Address
													</label>
													<Field
														id="address"
														name="address"
													>
														{({ input, meta }) => (
															<input
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
															<input
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
									<div className="text-end mb-4">
										<Link
											to="/pois/poi"
											className="btn btn-danger w-sm me-1"
										>
											Cancel
										</Link>
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
												<UploadButton
													imageUrl={imageUrl}
													changeImage={data => changeImage(data)}
													style={{ width: '200px', height: '200px' }}
												/>
											</div>
										</div>
									</div>

									{/* <div className="card">
										<div className="card-header">
											<h5 className="card-title mb-0">Crime Information</h5>
										</div>
										<div className="card-body">
											<div className="mb-3">
												<label className="form-label" htmlFor="crime_committed">
													Crime Committed <span style={{ color: 'red' }}>*</span>
												</label>
												<Field id="crime_committed" name="crime_committed">
													{({ input, meta }) => (
														<input
															{...input}
															type="text"
															className={`form-control ${error(meta)}`}
															id="crime_committed"
															placeholder="Enter Crime Committed"
														/>
													)}
												</Field>
												<ErrorBlock name="crime_committed" />
											</div>
											<div className="mb-3">
												<label
													className="form-label"
													htmlFor="crime_date"
												>
													Crime Date{' '}
													<span style={{ color: 'red' }}></span>
												</label>
												<Field
													id="crime_date"
													name="crime_date"
												>
													{({ input, meta }) => (
														<Flatpickr
															className={`form-control ${error(meta)}`}
															options={{
																dateFormat: 'd M, Y',
															}}
															placeholder="Select date of crime"
															value={dateOfEmployment}
															onChange={([date]) => {
																input.onChange(
																	moment(date).format('YYYY-MM-DD')
																);
																setDateOfEmployment(date);
															}}
														/>
													)}
												</Field>
												<ErrorBlock name="crime_date" />
											</div>
											<div className="mb-3">
												<label className="form-label" htmlFor="casualties_recorded">
													Casualties Recorded <span style={{ color: 'red' }}></span>
												</label>
												<Field id="casualties_recorded" name="casualties_recorded">
													{({ input, meta }) => (
														<input
															{...input}
															type="number"
															className={`form-control ${error(meta)}`}
															id="casualties_recorded"
															placeholder="Casualties Recorded"
														/>
													)}
												</Field>
												<ErrorBlock name="casualties_recorded" />
											</div>
											<div className="mb-3">
												<label className="form-label" htmlFor="arresting_body">
													Arresting Body <span style={{ color: 'red' }}></span>
												</label>
												<Field id="arresting_body" name="arresting_body">
													{({ input, meta }) => (
														<input
															{...input}
															type="number"
															className={`form-control ${error(meta)}`}
															id="arresting_body"
															placeholder="Arresting Body"
														/>
													)}
												</Field>
												<ErrorBlock name="arresting_body" />
											</div>
											<div className="mb-3">
												<label className="form-label" htmlFor="place_of_detention">
													Place of Detention <span style={{ color: 'red' }}></span>
												</label>
												<Field id="place_of_detention" name="place_of_detention">
													{({ input, meta }) => (
														<input
															{...input}
															type="number"
															className={`form-control ${error(meta)}`}
															id="place_of_detention"
															placeholder="Place of Detention"
														/>
													)}
												</Field>
												<ErrorBlock name="place_of_detention" />
											</div>
											<div className="mb-3">
												<label className="form-label" htmlFor="action_taken">
													Action taken <span style={{ color: 'red' }}></span>
												</label>
												<Field id="action_taken" name="action_taken">
													{({ input, meta }) => (
														<input
															{...input}
															type="number"
															className={`form-control ${error(meta)}`}
															id="action_taken"
															placeholder="Action taken"
														/>
													)}
												</Field>
												<ErrorBlock name="action_taken" />
											</div>
										</div>
									</div> */}

									{/* <div className="card">
										<div className="card-header">
											<h5 className="card-title mb-0">Arms Recovered</h5>
										</div>
										<div className="card-body">
											
										</div>
									</div> */}
								</div>
								{/* <div className="col-lg-12">
									<div className="text-end mb-4">
										<Link
											to="/employees/profiles"
											className="btn btn-danger w-sm me-1"
										>
											Cancel
										</Link>
										<button type="submit" className="btn btn-success w-sm">
											Create employee
										</button>
									</div>
								</div> */}
							</div>
						</FormWrapper>
					)}
				/>
			</div>
		</div>
	);
};

export default NewPoi;
