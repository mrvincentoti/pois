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
	CREATE_EMPLOYEE_API,
	FETCH_ALL_DESIGNATIONS_API,
	FETCH_ALL_RANKS_API,
	FETCH_ALL_SPECIALTIES_API,
	FETCH_CADRES_API,
	FETCH_DEPARTMENTS_API,
	FETCH_DIRECTORATES_API,
	FETCH_GENDERS_API,
	FETCH_LGAS_BY_STATE_API,
	FETCH_RANKS_BY_CADRE_API,
	FETCH_RELIGIONS_API,
	FETCH_STATES_API,
	FETCH_UNITS_API,
} from '../../services/api';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import UploadButton from '../../components/UploadItem';
import {
	categoryList,
	confirmationList,
	employeeStatusList,
	hasImplications,
	maritalStatusList,
	passportCategoryList,
} from '../../services/constants';

const NewPoi = () => {
	const [loaded, setLoaded] = useState(false);
	const [stateOrigin, setStateOrigin] = useState(null);
	const [directorate, setDirectorate] = useState(null);
	const [department, setDepartment] = useState(null);
	const [cadre, setCadre] = useState(null);
	const [rank, setRank] = useState(null);
	const [gradeOnApp, setGradeOnApp] = useState(null);
	const [maritalStatus, setMaritalStatus] = useState(null);
	const [passportCategory, setPassportCategory] = useState(null);
	const [employeeStatus, setEmployeeStatus] = useState(null);
	const [confirmation, setConfirmation] = useState(null);
	const [category, setCategory] = useState(null);

	const [genders, setGenders] = useState([]);
	const [states, setStates] = useState([]);
	const [lgas, setLgas] = useState([]);
	const [religions, setReligions] = useState([]);
	const [cadres, setCadres] = useState([]);
	const [departments, setDepartments] = useState([]);
	const [units, setUnits] = useState([]);
	const [ranks, setRanks] = useState([]);
	const [designations, setDesignations] = useState([]);
	const [specialties, setSpecialties] = useState([]);

	const [dateOfAppointment, setDateOfAppointment] = useState('');
	const [dateOfEmployment, setDateOfEmployment] = useState('');
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

	const getDirectorates = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_DIRECTORATES_API}?q=${q}`);
		return rs?.directorates || [];
	};

	const fetchApis = useCallback(async () => {
		try {
			const urls = [
				FETCH_GENDERS_API,
				FETCH_STATES_API,
				FETCH_RELIGIONS_API,
				`${FETCH_CADRES_API}?page=1&per_page=10`,
				FETCH_ALL_RANKS_API,
				FETCH_ALL_DESIGNATIONS_API,
				FETCH_ALL_SPECIALTIES_API,
			];
			const requests = urls.map(url =>
				asyncFetch(url).then(response => response.json())
			);
			const [
				rs_genders,
				rs_states,
				rs_religions,
				rs_cadres,
				rs_ranks,
				rs_designations,
				rs_specialties,
			] = await Promise.all(requests);
			setGenders(rs_genders.genders);
			setStates(rs_states.states);
			setReligions(rs_religions.religions);
			setCadres(rs_cadres.cadres);
			setRanks(rs_ranks.ranks);
			setDesignations(rs_designations.designations);
			setSpecialties(rs_specialties.specialties);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchLgas = useCallback(async id => {
		try {
			const rs = await request(
				FETCH_LGAS_BY_STATE_API.replace(':state_id', id)
			);
			setLgas(rs.lgas);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchRanks = useCallback(async id => {
		try {
			const rs = await request(
				FETCH_RANKS_BY_CADRE_API.replace(':cadre_id', id)
			);
			setRanks(rs.ranks);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
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

	const fetchDepartments = useCallback(async id => {
		try {
			if (!id) {
				return;
			}
			const rs = await request(
				`${FETCH_DEPARTMENTS_API}?directorate_id=${id}&page=1&per_page=50`
			);
			setDepartments(rs.departments);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchUnits = useCallback(async id => {
		try {
			const rs = await request(
				`${FETCH_UNITS_API}?department_id=${id}&page=1&per_page=50`
			);
			setUnits(rs.units);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	useEffect(() => {
		if (!loaded) {
			fetchApis();
			setLoaded(true);
		}
	}, [fetchApis, loaded]);

	const onSubmit = async values => {
		console.log(language)
		try {
			const config = {
				method: 'POST',
				body: {
					...values,
					cadre_id: values.cadre_id ? values.cadre_id : null,
					designation_id: values.designation?.id || null,
					gender_id: values.gender?.id || null,
					lga_id: values.lga?.id || null,
					rank_id: values.rank_id ? values.rank_id : null,
					religion_id: values.religion?.id || null,
					marital_status: values.marital_status?.name || null,
					specialty_id: values.specialty?.id || null,
					unit_id: values.unit_id?.id || null,
					picture: imageUrl || null,
					language_spoken: language,
					cadre: undefined,
					designation: undefined,
					gender: undefined,
					lga: undefined,
					rank: undefined,
					religion: undefined,
					specialty: undefined,
					unit: undefined,
				},
			};
			const rs = await request(CREATE_EMPLOYEE_API, config);
			notifyWithIcon('success', rs.message);
			navigate('/employees/profiles');
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

						if (!values.pf_num) {
							errors.pf_num = 'enter pf number';
						}
						if (!values.first_name) {
							errors.first_name = 'enter first name';
						}
						if (!values.last_name) {
							errors.last_name = 'enter last name';
						}
						if (!values.dob) {
							errors.dob = 'enter date of birth';
						}
						if (!values.gender) {
							errors.gender = 'select gender';
						}
						if (!values.religion) {
							errors.religion = 'select religion';
						}
						if (!values.state_id) {
							errors.state_id = 'select state of origin';
						}
						if (!values.pf_num) {
							errors.pf_num = 'enter pfs number';
						}
						if (!values.lga) {
							errors.lga = 'select lga';
						}
						if (!values.rank_id) {
							errors.rank_id = 'select rank';
						}
						if (!values.directorate_id) {
							errors.directorate_id = 'select directorate';
						}
						if (!values.cadre_id) {
							errors.cadre_id = 'select cadre';
						}
						if (!values.date_of_employment) {
							errors.date_of_employment = 'enter date of employment';
						}

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
											<h5 className="card-title mb-0">POI Bio</h5>
										</div>
										<div className="card-body">
											<div className="row">
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
											</div>
											<div className="row">
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="dob">
														Date Of Birth{' '}
														<span style={{ color: 'red' }}>*</span>
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
											</div>
											<div className="row">
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="religion">
														Religion <span style={{ color: 'red' }}>*</span>
													</label>
													<Field id="religion" name="religion">
														{({ input, meta }) => (
															<Select
																{...input}
																className={error(meta)}
																placeholder="Select religion"
																options={religions}
																getOptionValue={option => option.id}
																getOptionLabel={option => option.name}
															/>
														)}
													</Field>
												</div>
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="state_id">
														State Of Origin{' '}
														<span style={{ color: 'red' }}>*</span>
													</label>
													<Field id="state_id" name="state_id">
														{({ input, meta }) => (
															<Select
																{...input}
																className={error(meta)}
																placeholder="Select state"
																options={states}
																value={stateOrigin}
																getOptionValue={option => option.id}
																getOptionLabel={option => option.name}
																onChange={e => {
																	e ? input.onChange(e.id) : input.onChange('');
																	setStateOrigin(e);
																	fetchLgas(e?.id);
																}}
															/>
														)}
													</Field>
													<ErrorBlock name="state_id" />
												</div>
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="lga">
														Local Government Area{' '}
														<span style={{ color: 'red' }}>*</span>
													</label>
													<Field id="lga" name="lga">
														{({ input, meta }) => (
															<Select
																{...input}
																className={error(meta)}
																placeholder="Select local govt area"
																options={lgas}
																getOptionValue={option => option.id}
																getOptionLabel={option => option.name}
															/>
														)}
													</Field>
													<ErrorBlock name="lga" />
												</div>

												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="home_town">
														Hometown
													</label>
													<Field id="home_town" name="home_town">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="home_town"
																placeholder="Enter hometown"
															/>
														)}
													</Field>
													<ErrorBlock name="home_town" />
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
												<div className="col-lg-4 mb-3">
													<label
														className="form-label"
														htmlFor="residential_address"
													>
														Residential Address
													</label>
													<Field
														id="residential_address"
														name="residential_address"
													>
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="residential_address"
																placeholder="Enter residential address"
															/>
														)}
													</Field>
													<ErrorBlock name="residential_address" />
												</div>

												<div className="col-lg-4 mb-3">
													<label
														className="form-label"
														htmlFor="passport_official"
													>
														Official Passport
													</label>
													<Field
														id="passport_official"
														name="passport_official"
													>
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="passport_official"
																placeholder="Enter official passport no"
															/>
														)}
													</Field>
													<ErrorBlock name="passport_offical" />
												</div>

												<div className="col-lg-4 mb-3">
													<label
														className="form-label"
														htmlFor="passport_diplomatic"
													>
														Diplomatic Passport No
													</label>
													<Field
														id="passport_diplomatic"
														name="passport_diplomatic"
													>
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="passport_diplomatic"
																placeholder="Enter diplomatic passport no"
															/>
														)}
													</Field>
													<ErrorBlock name="passport_diplomatic" />
												</div>

												<div className="col-lg-4 mb-3">
													<label
														className="form-label"
														htmlFor="passport_personal"
													>
														Standard Passport
													</label>
													<Field
														id="passport_personal"
														name="passport_personal"
													>
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="passport_personal"
																placeholder="Enter standard passport no"
															/>
														)}
													</Field>
													<ErrorBlock name="passport_personal" />
												</div>

												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="phone">
														Phone
													</label>
													<Field id="phone" name="phone">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="phone"
																placeholder="Enter phone number"
															/>
														)}
													</Field>
													<ErrorBlock name="phone" />
												</div>

												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="year_of_grad">
														Year Of Graduation
													</label>
													<Field id="year_of_grad" name="year_of_grad">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="year_of_grad"
																placeholder="Enter year of graduation"
															/>
														)}
													</Field>
													<ErrorBlock name="year_of_grad" />
												</div>

												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="qualification">
														Qualifications
													</label>
													<Field id="qualification" name="qualification">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="qualification"
																placeholder="Enter qualification"
															/>
														)}
													</Field>
													<ErrorBlock name="qualification" />
												</div>

												<div className="col-lg-6 mb-3">
													<label className="form-label" htmlFor="language_spoken">
														Languages Spoken
													</label>

													<Field name="language_spoken">
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
														style={{ width: 78, marginRight: 8, marginTop: 5 }}
													/>
												)}
												{!inputVisible && (
													<Tag onClick={showInput}  className="site-tag-plus">
														<i className="ri-add-line" />  New Tag
													</Tag>
												)}
												<input
													{...input}
													type="hidden"
													value={language}
													onChange={() => {}}
													onBlur={() => input.onBlur(language)}
												/>
											</div>
										)}
									</Field>

													<ErrorBlock name="language_spoken" />
												</div>
											</div>
										</div>
									</div>
								</div>

								<div className="col-lg-4">
									<div className="card mb-3">
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

									<div className="card">
										<div className="card-body">
											<div className="mb-3">
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
												<ErrorBlock name="pf_num" />
											</div>
											<div className="mb-3">
												<label
													className="form-label"
													htmlFor="date_of_employment"
												>
													Date Of Employment{' '}
													<span style={{ color: 'red' }}>*</span>
												</label>
												<Field
													id="date_of_employment"
													name="date_of_employment"
												>
													{({ input, meta }) => (
														<Flatpickr
															className={`form-control ${error(meta)}`}
															options={{
																dateFormat: 'd M, Y',
															}}
															placeholder="Select date of employment"
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
												<ErrorBlock name="date_of_employment" />
											</div>
											<div className="mb-2">
												<label
													className="form-label"
													htmlFor="date_of_appointment"
												>
													Date Of Appointment{' '}
													<span style={{ color: 'red' }}>*</span>
												</label>
												<Field
													id="date_of_appointment"
													name="date_of_appointment"
												>
													{({ input, meta }) => (
														<Flatpickr
															className={`form-control ${error(meta)}`}
															options={{
																dateFormat: 'd M, Y',
																minDate: new Date(dateOfEmployment),
															}}
															placeholder="Select date of appointment"
															value={dateOfAppointment}
															onChange={([date]) => {
																input.onChange(
																	moment(date).format('YYYY-MM-DD')
																);
																setDateOfAppointment(date);
															}}
														/>
													)}
												</Field>
												<ErrorBlock name="date_of_appointment" />
											</div>

											<div className="mb-2">
												<label
													htmlFor="confirmation_of_app"
													className="form-label"
												>
													Has Appointment Been Confirmed?
												</label>
												<Field
													id="confirmation_of_app"
													name="confirmation_of_app"
												>
													{({ input, meta }) => (
														<Select
															{...input}
															options={confirmationList}
															className={error(meta)}
															placeholder="Select type"
															getOptionValue={option => option.name}
															getOptionLabel={option => option.name}
															value={confirmation}
															onChange={e => {
																setConfirmation(e);
																e ? input.onChange(e.name) : input.onChange('');
															}}
														/>
													)}
												</Field>
												<ErrorBlock name="confirmation_of_app" />
											</div>
										</div>
									</div>
								</div>
								<div className="col-lg-12">
									<div className="card">
										<div className="card-body">
											<div className="row">
												<div className="col-lg-4 mb-3">
													<label
														className="form-label"
														htmlFor="directorate_id"
													>
														Directorate <span style={{ color: 'red' }}>*</span>
													</label>
													<Field id="directorate_id" name="directorate_id">
														{({ input, meta }) => (
															<AsyncSelect
																isClearable
																getOptionValue={option => option.id}
																getOptionLabel={option => option.name}
																defaultOptions
																value={directorate}
																className={error(meta)}
																loadOptions={getDirectorates}
																onChange={e => {
																	setDirectorate(e);
																	e ? input.onChange(e.id) : input.onChange('');
																	fetchDepartments(e?.id);
																	setDepartments([]);
																	setDepartment(null);
																	setUnits([]);
																	form.change('department_id', undefined);
																	form.change('unit', undefined);
																}}
																placeholder="Search directorate"
															/>
														)}
													</Field>
													<ErrorBlock name="directorate_id" />
												</div>
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="department_id">
														Department <span style={{ color: 'red' }}>*</span>
													</label>
													<Field id="department_id" name="department_id">
														{({ input, meta }) => (
															<Select
																{...input}
																placeholder="Select department"
																options={departments}
																value={department}
																className={error(meta)}
																getOptionValue={option => option.id}
																getOptionLabel={option => option.name}
																onChange={e => {
																	e ? input.onChange(e.id) : input.onChange('');
																	setDepartment(e);
																	if (e && e.id !== department?.id) {
																		form.change('unit', undefined);
																		fetchUnits(e?.id);
																	}
																}}
															/>
														)}
													</Field>
													<ErrorBlock name="department_id" />
												</div>
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="unit_id">
														Unit
													</label>
													<Field id="unit_id" name="unit_id">
														{({ input, meta }) => (
															<Select
																{...input}
																placeholder="Select unit"
																options={units}
																className={error(meta)}
																getOptionValue={option => option.id}
																getOptionLabel={option => option.name}
															/>
														)}
													</Field>
													<ErrorBlock name="unit_id" />
												</div>

												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="cadre_id">
														Cadre <span style={{ color: 'red' }}>*</span>
													</label>
													<Field id="cadre_id" name="cadre_id">
														{({ input, meta }) => (
															<Select
																{...input}
																placeholder="Select cadre"
																className={error(meta)}
																options={cadres}
																value={cadre}
																getOptionValue={option => option.id}
																getOptionLabel={option => option.name}
																onChange={e => {
																	e ? input.onChange(e.id) : input.onChange('');
																	setCadre(e);
																	fetchRanks(e?.id);
																	setRank(null);
																}}
															/>
														)}
													</Field>
													<ErrorBlock name="cadre_id" />
												</div>
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="rank_id">
														Rank <span style={{ color: 'red' }}>*</span>
													</label>
													<Field id="rank_id" name="rank_id">
														{({ input, meta }) => (
															<Select
																{...input}
																placeholder="Select rank"
																options={ranks}
																value={rank}
																className={error(meta)}
																getOptionValue={option => option.id}
																getOptionLabel={option => option.name}
																onChange={e => {
																	e ? input.onChange(e.id) : input.onChange('');
																	setRank(e);
																}}
															/>
														)}
													</Field>
													<ErrorBlock name="rank_id" />
												</div>
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="designation">
														Designation <span style={{ color: 'red' }}>*</span>
													</label>
													<Field id="designation" name="designation">
														{({ input, meta }) => (
															<Select
																{...input}
																placeholder="Select designation"
																options={designations}
																getOptionValue={option => option.id}
																getOptionLabel={option => option.name}
															/>
														)}
													</Field>
												</div>

												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="grade_on_app">
														Grade On Appointment{' '}
														<span style={{ color: 'red' }}>*</span>
													</label>
													<Field id="grade_on_app" name="grade_on_app">
														{({ input, meta }) => (
															<Select
																{...input}
																placeholder="Select rank"
																options={ranks}
																value={gradeOnApp}
																className={error(meta)}
																getOptionValue={option => option.name}
																getOptionLabel={option => option.name}
																onChange={e => {
																	e
																		? input.onChange(e.name)
																		: input.onChange('');
																	setGradeOnApp(e);
																}}
															/>
														)}
													</Field>
													<ErrorBlock name="grade_on_app" />
												</div>
												<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="specialty">
														Specialty <span style={{ color: 'red' }}>*</span>
													</label>
													<Field id="specialty" name="specialty">
														{({ input, meta }) => (
															<Select
																{...input}
																placeholder="Select specialty"
																options={specialties}
																getOptionValue={option => option.id}
																getOptionLabel={option => option.name}
															/>
														)}
													</Field>
												</div>

												<div className="col-lg-4 mb-3">
													<label htmlFor="category" className="form-label">
														Category
													</label>
													<Field id="category" name="category">
														{({ input, meta }) => (
															<Select
																{...input}
																options={categoryList}
																className={error(meta)}
																placeholder="Select type"
																getOptionValue={option => option.name}
																getOptionLabel={option => option.name}
																value={category}
																onChange={e => {
																	setCategory(e);
																	e
																		? input.onChange(e.name)
																		: input.onChange('');
																}}
															/>
														)}
													</Field>
													<ErrorBlock name="category" />
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-lg-12">
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
