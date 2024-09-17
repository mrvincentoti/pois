import React, {useState, useEffect, useCallback, useRef} from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import { asyncFetch, notifyWithIcon, request } from '../../services/utilities';
import { Flex, Input, Tag, theme, Tooltip } from 'antd';
import { message, Upload } from 'antd';
import {
	FETCH_CADRES_API,
	FETCH_GENDERS_API,
	FETCH_LGAS_BY_STATE_API,
	FETCH_ALL_RANKS_API,
	FETCH_RELIGIONS_API,
	FETCH_STATES_API,
	GET_EMPLOYEE_API,
	UPDATE_EMPLOYEE_API,
	FETCH_ALL_DESIGNATIONS_API,
	FETCH_ALL_SPECIALTIES_API,
	FETCH_DIRECTORATES_API,
	FETCH_DEPARTMENTS_API,
	FETCH_UNITS_API,
	FETCH_RANKS_BY_CADRE_API,
} from '../../services/api';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import UploadButton from '../../components/UploadItem';
import {
	deploymentTypes,
	employeeStatusList,
	maritalStatusList,
	passportCategoryList,
	confirmationList,
	categoryList,
	stagnationList,
} from '../../services/constants';
const EditEmployee = () => {
	const [loaded, setLoaded] = useState(false);
	const [employee, setEmployee] = useState(null);
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
	const [stagnation, setStagnation] = useState(null);
	const [category, setCategory] = useState(null);
	const [imageUrl, setImageUrl] = useState();

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
	const [dateOfRetirement, setDateOfRetirement] = useState('');
	const [dateOfBirth, setDateOfBirth] = useState('');

	const navigate = useNavigate();
	const param = useParams();



  	const [tags, setTags] = useState([]);
	const [inputVisible, setInputVisible] = useState(false);
	const [inputValue, setInputValue] = useState('');




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

	const fetchEmployee = useCallback(async id => {
		try {
			const rs = await request(GET_EMPLOYEE_API.replace(':id', id));


			return rs.employee;
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
			fetchEmployee(param.id).then(item => {
				console.log(item)

				if (!item) {
					notifyWithIcon('error', 'Employee not found!');
					navigate('/employees/profiles');
					return;
				}

				setDateOfAppointment(new Date(item.date_of_appointment));
				setDateOfEmployment(new Date(item.date_of_employment));
				setDateOfRetirement(new Date(item.date));
				setDateOfBirth(new Date(item.dob));
				setCadre(item.cadre);
				setRank(item.rank);
				setImageUrl(item.photo);
				setCategory(categoryList.find(status => status.name === item.category));

				try {
					   const cleanedString = item.language_spoken.replace(/'/g, '"');
						const languages = JSON.parse(cleanedString);
						const tags = languages.map(attr => attr);
						setTags(tags);
					} catch (error) {
						console.error("Failed to parse language_spoken:", error);

						// Wrap the string in an array
						const jsonArray = [item.language_spoken];

					setTags(jsonArray);

					}








				setGradeOnApp(ranks.find(status => status.name === item.grade_on_app));

				setConfirmation(
					confirmationList.find(
						status => status.name === item.confirmation_of_app
					)
				);

				setStagnation(
					stagnationList.find(status => status.id === item.stagnation)
				);

				setMaritalStatus(
					maritalStatusList.find(status => status.name === item.marital_status)
				);
				setPassportCategory(
					passportCategoryList.find(
						category => category.name === item.passport_category
					)
				);
				setEmployeeStatus(
					employeeStatusList.find(status => {
						if (item.employment_status === 0) {
							return status.id === 11;
						} else {
							return status.id === item.employment_status;
						}
					})
				);

				setStateOrigin(item?.state);
				if (item.state) {
					fetchLgas(item.state.id);
				}

				setDirectorate(item?.directorate);
				if (item.directorate) {
					fetchDepartments(item.directorate.id);
				}

				setDepartment(item?.department);
				if (item.department) {
					fetchUnits(item.department.id);
				}

				setEmployee(item);
				setLoaded(true);
			});
		}
	}, [
		fetchApis,
		fetchDepartments,
		fetchEmployee,
		fetchLgas,
		fetchUnits,
		loaded,
		navigate,
		param.id,
	]);


	const handleClose = (removedTag) => {
		const newTags = tags.filter(tag => tag !== removedTag);
		setTags(newTags);
	};

	const showInput = () => {
		setInputVisible(true);
	};

	const handleInputChange = (e) => {
		setInputValue(e.target.value);
	};

	const handleInputConfirm = () => {
		if (inputValue && tags.indexOf(inputValue) === -1) {
			setTags([...tags, inputValue]);
		}
		setInputVisible(false);
		setInputValue('');
	};

	const forMap = tag => (
		<span key={tag} style={{ display: 'inline-block' }}>
            <Tag closable onClose={() => handleClose(tag)}>
                {tag}
            </Tag>
        </span>
	);

	const tagChild = tags.map(forMap);

	const getDirectorates = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_DIRECTORATES_API}?q=${q}`);
		return rs?.directorates || [];
	};

	const onSubmit = async values => {

		if (employeeStatus.id) {
			values.employment_status = employeeStatus.id;

		} else {
			values.employment_status = 11;
		}

		try {
			const config = {
				method: 'PUT',
				body: {
					...values,
					cadre_id: values.cadre?.id || null,
					language_spoken: tags,
					designation_id: values.designation?.id || null,
					gender_id: values.gender?.id || null,
					lga_id: values.lga?.id || null,
					rank_id: values.rank?.id || null,
					religion_id: values.religion?.id || null,
					specialty_id: values.specialty?.id || null,
					unit_id: values.unit?.id || null,
					directorate_id: directorate?.id || null,
					department_id: values.department_id || null,
					marital_status: maritalStatus?.name || null,
					passport_category: passportCategory?.name || null,
					employment_status: employeeStatus?.id || null,
					photo: imageUrl || null,
					cadre: undefined,
					department: undefined,
					designation: undefined,
					gender: undefined,
					lga: undefined,
					rank: undefined,
					religion: undefined,
					specialty: undefined,
					state: undefined,
					directorate: undefined,
					unit: undefined,
				},
			};
			const rs = await request(
				UPDATE_EMPLOYEE_API.replace(':id', employee.id),
				config
			);
			notifyWithIcon('success', rs.message);
			navigate('/employees/profiles');
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not save employee' };
		}
	};

	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="Edit Employee" parentPage="Employees" />
			{loaded && employee && (
				<div className="row">
					<Form
						initialValues={{
							...employee,
							directorate_id: employee?.directorate_id || '',
							department_id: employee?.department_id || '',
						}}
						onSubmit={onSubmit}
						validate={values => {
							const errors = {};
							if (!values.pf_num) {
								errors.pf_num = 'Enter Pf Number';
							}
							if (!values.date_of_appointment) {
								errors.date_of_appointment = 'select date of appointment';
							}
							if (!values.first_name) {
								errors.first_name = 'enter first name';
							}
							if (!values.last_name) {
								errors.last_name = 'enter last name';
							}
							if (!values.gender) {
								errors.gender = 'select gender';
							}
							if (!values.dob) {
								errors.dob = 'select date of birth';
							}
							if (!values.email) {
								errors.email = 'enter email';
							}
							if (!values.religion) {
								errors.religion = 'select religion';
							}
							if (!values.rank) {
								errors.rank = 'select rank';
							}
							if (!values.cadre) {
								errors.cadre = 'select cadre';
							}
							if (!values.state) {
								errors.state = 'select state';
							}
							if (!values.lga) {
								errors.lga = 'select lga';
							}
							if (!values.directorate) {
								errors.directorate_id = 'select directorate';
							}
							if (!values.grade_on_app) {
								errors.grade_on_app = 'Enter Grade';
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
												<h5 className="card-title mb-0">Employee Bio</h5>
											</div>
											<div className="card-body">
												<div className="row">
													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="first_name">
															First name
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
															Middle name
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
															Last name
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
															Date of Birth
														</label>
														<Field id="dob" name="dob">
															{({ input, meta }) => (
																<Flatpickr
																	className={`form-control ${error(meta)}`}
																	options={{
																		dateFormat: 'd M, Y',
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
															Gender
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
															Religion
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
														<ErrorBlock name="religion" />
													</div>
													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="state_id">
															State of Origin
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
																		e
																			? input.onChange(e.id)
																			: input.onChange('');
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
															Local Government Area
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
															Marital status
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
																	id="passport_offical"
																	placeholder="Enter official passport no"
																/>
															)}
														</Field>
														<ErrorBlock name="passport_official" />
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
																	placeholder="Enter diplomatic no"
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
																	placeholder="Enter personnal passport no"
																/>
															)}
														</Field>
														<ErrorBlock name="passport_personal" />
													</div>

													<div className="col-lg-4 mb-3">
														<label
															className="form-label"
															htmlFor="passport_number"
														>
															Phone
														</label>
														<Field id="phone" name="phone">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="phone"
																	placeholder="Enter phone"
																/>
															)}
														</Field>
														<ErrorBlock name="phone" />
													</div>

													<div className="col-lg-4 mb-3">
														<label
															className="form-label"
															htmlFor="year_of_grad"
														>
															Year of graduation
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
														<label
															className="form-label"
															htmlFor="qualification"
														>
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

													<div className="col-lg-4 mb-3">
													<label className="form-label" htmlFor="language_spoken">
														Language(s) Spoken
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
																		<Tag onClick={showInput} className="site-tag-plus">
																			<i className="ri-add-line" />  New Tag
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
													<ErrorBlock name="language_spoken" />
												</div>

													<div className="col-lg-12 mb-3">
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
																<textarea
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="residential_address"
																	placeholder="Enter Residential Address"
																/>
															)}
														</Field>
														<ErrorBlock name="residential_address" />
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
													<label className="form-label" htmlFor="pf_num">
														PF Number
													</label>
													<Field id="pf_num" name="pf_num">
														{({ input, meta }) => (
															<input
																{...input}
																type="text"
																className={`form-control ${error(meta)}`}
																id="pf_num"
																placeholder="Enter PF number"
															/>
														)}
													</Field>
													<ErrorBlock name="pf_num" />
												</div>
												<div className="mb-2">
													<label
														className="form-label"
														htmlFor="date_of_appointment"
													>
														Date of Appointment
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
														className="form-label"
														htmlFor="date_of_employment"
													>
														Date of Employment
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
														htmlFor="employment_status"
													>
														Employment status
													</label>

													<Field
														id="employment_status"
														name="employment_status"
													>
														{({ input, meta }) => (
															<Select
																{...input}
																placeholder="Select employment status"
																options={employeeStatusList}
																value={employeeStatus}
																className={error(meta)}
																getOptionValue={option => option.id}
																getOptionLabel={option => option.name}
																onChange={e => {
																	e ? input.onChange(e) : input.onChange('');

																	setEmployeeStatus(e);
																}}
															/>
														)}
													</Field>
													<ErrorBlock name="employment_status" />
												</div>
												{employeeStatus && employeeStatus?.id !== 0 ? (
													<div className="mb-2">
														<label
															className="form-label"
															htmlFor="date_of_employment"
														>
															{employeeStatus ? employeeStatus.name : ''} Date
														</label>
														<Field
															id="date_of_retirement"
															name="date_of_retirement"
														>
															{({ input, meta }) => (
																<Flatpickr
																	className={`form-control ${error(meta)}`}
																	options={{
																		dateFormat: 'd M, Y',
																	}}
																	placeholder="Select date"
																	value={dateOfRetirement}
																	onChange={([date]) => {
																		input.onChange(
																			moment(date).format('YYYY-MM-DD')
																		);
																		setDateOfRetirement(date);
																	}}
																/>
															)}
														</Field>
														<ErrorBlock name="date_of_employment" />
													</div>
												) : (
													''
												)}
												<div className="mb-2">
													<label
														htmlFor="confirmation_of_app"
														className="form-label"
													>
														Has appointment been confirmed?
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
																placeholder="Select Type"
																getOptionValue={option => option.name}
																getOptionLabel={option => option.name}
																value={confirmation}
																onChange={e => {
																	setConfirmation(e);
																	e
																		? input.onChange(e.name)
																		: input.onChange('');
																}}
															/>
														)}
													</Field>
													<ErrorBlock name="confirmation_of_app" />
												</div>

												<div className="mb-2">
													<label htmlFor="stagnation" className="form-label">
														Stagnation
													</label>
													<Field id="stagnation" name="stagnation">
														{({ input, meta }) => (
															<Select
																{...input}
																options={stagnationList}
																className={error(meta)}
																placeholder="Select"
																getOptionValue={option => option.id}
																getOptionLabel={option => option.name}
																value={stagnation}
																onChange={e => {
																	setStagnation(e);
																	e ? input.onChange(e.id) : input.onChange('');
																}}
															/>
														)}
													</Field>
													<ErrorBlock name="stagnation" />
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
															Directorate
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
																		e
																			? input.onChange(e.id)
																			: input.onChange('');
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
														<label
															className="form-label"
															htmlFor="department_id"
														>
															Department
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
																		e
																			? input.onChange(e.id)
																			: input.onChange('');
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
														<label className="form-label" htmlFor="unit">
															Unit
														</label>
														<Field id="unit" name="unit">
															{({ input, meta }) => (
																<Select
																	{...input}
																	placeholder="Select unit"
																	className={error(meta)}
																	options={units}
																	getOptionValue={option => option.id}
																	getOptionLabel={option => option.name}
																/>
															)}
														</Field>
														<ErrorBlock name="unit" />
													</div>
													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="cadre">
															Cadre
														</label>
														<Field id="cadre" name="cadre">
															{({ input, meta }) => (
																<Select
																	{...input}
																	placeholder="Select cadre"
																	options={cadres}
																	value={cadre}
																	className={error(meta)}
																	getOptionValue={option => option.id}
																	getOptionLabel={option => option.name}
																	onChange={e => {
																		e ? input.onChange(e) : input.onChange('');
																		setCadre(e);
																		fetchRanks(e?.id);
																		setRank(null);
																	}}
																/>
															)}
														</Field>
														<ErrorBlock name="cadre" />
													</div>

													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="rank">
															Rank
														</label>
														<Field id="rank" name="rank">
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
																		e ? input.onChange(e) : input.onChange('');
																		setRank(e);
																	}}
																/>
															)}
														</Field>
														<ErrorBlock name="rank" />
													</div>

													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="designation">
															Designation
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
														<label
															className="form-label"
															htmlFor="grade_on_app"
														>
															Grade on appointment{' '}
															<span style={{ color: 'red' }}>*</span>
														</label>
														<Field id="grade_on_app" name="grade_on_app">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="grade_on_app"
																	placeholder="Enter grade on appointment"
																/>
															)}
														</Field>
														<ErrorBlock name="grade_on_app" />
													</div>
													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="specialty">
															Specialty
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
																	placeholder="Select Type"
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
												Save Employee
											</button>
										</div>
									</div>
								</div>
							</FormWrapper>
						)}
					/>
				</div>
			)}
		</div>
	);
};

export default EditEmployee;
