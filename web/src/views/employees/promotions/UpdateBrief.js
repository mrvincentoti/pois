/* eslint-disable no-script-url */
import React, {useCallback, useEffect, useState} from 'react';
import { APP_SHORT_NAME } from '../../../services/constants';
import Breadcrumbs from '../../../components/Breadcrumbs';
import Flatpickr from 'react-flatpickr';
import {Link, useNavigate, useParams} from "react-router-dom";
import {notifyWithIcon, request} from "../../../services/utilities";
import {
	FETCH_CADRES_API,
	FETCH_RANKS_BY_CADRE_API,
	FETCH_SINGLE_BRIEF_API,
	UPDATE_EMPLOYEE_API, UPDATE_SINGLE_BRIEF_API
} from "../../../services/api";
import {error, ErrorBlock, FormSubmitError} from "../../../components/FormBlock";
import Select from "react-select";
import moment from "moment/moment";
import {FORM_ERROR} from "final-form";
import {Field, Form} from "react-final-form";
import FormWrapper from "../../../container/FormWrapper";
import AsyncSelect from "react-select/async";

const UpdateBrief = () => {
	document.title = `Update Promotion Brief - ${APP_SHORT_NAME}`;
	const [loaded, setLoaded] = useState(false);
	const [fullName, setFullName] = useState(null);
	const [brief, setBrief] = useState(null);
	const [cadre, setCadre] = useState(null);
	const [rank, setRank] = useState(null);
	const [serviceHours, setServiceHours] = useState(null);
	const [dateOfBirth, setDateOfBirth] = useState(null);
	const [briefDetail, setBriefDetail] = useState(null);
	const [dateOfFirstAppointment, setDateOfFirstAppointment] = useState(null);
	const [dateOfAppointmentABC, setDateOfAppointmentABC] = useState(null);
	const [dateOfLastPromotion, setDateOfLastPromotion] = useState(null);
	const [inServiceCourseAttended, setInServiceCourseAttended] = useState(null);
	const [placement, setPlacement] = useState(null);
	const [serviceYearOnPresentGrade, setServiceYearOnPresentGrade] = useState(null);
	const [noTimesPresentedBoard, setNoTimesPresentedBoard] = useState(null);
	const [sanctionDuringPeriod, setSanctionDuringPeriod] = useState(null);
	const [currentDeployment, setCurrentDeployment] = useState(null);
	const [annualPerfEval, setAnnualPerEval] = useState(null);
	const [caperScore, setCaperScore] = useState(null);
	const [examScore, setExamScore] = useState(null);
	const [interviewScore, setInterviewScore] = useState(null);
	const [totalScore, setTotalScore] = useState(null);
	const [remarks, setRemarks] = useState(null);

	const [age, setAge] = useState(null);
	const [cadres, setCadres] = useState([]);
	const [ranks, setRanks] = useState([]);



	const navigate = useNavigate();

	const param = useParams();
	const { id } = useParams();

	useEffect(() => {

		if (!loaded) {
			fetchCadres()
			fetchRanks()

			fetchBriefDetails(param.id).then(item => {

				setBrief(item)
				if (!item) {
					notifyWithIcon('error', 'Employee not found!');
					navigate('/employees/promotions/briefs');
					return;
				}

				setFullName(item.name)

				setDateOfFirstAppointment(item.date_of_first_appointment)
				setDateOfAppointmentABC(item.date_of_appointment_into_abc)
				setServiceHours(item.years_of_service_as_of_now)
				setDateOfLastPromotion(item.date_of_last_promotion)
				setDateOfBirth(item.dob)
				setAge(item.age)
				setInServiceCourseAttended(item.in_service_courses_attended)
				setBriefDetail(item)
				setPlacement(item.placement)
				setServiceYearOnPresentGrade(item.years_of_service_as_of_now)
				setNoTimesPresentedBoard(item.times_presented_to_promotion_board)
				setSanctionDuringPeriod(item.sanctioned_during_period)
				setCurrentDeployment(item.current_deployment)
				setAnnualPerEval(item.annual_performance_evaluation_report)
				setTotalScore(item.total_score)
				setInterviewScore(item.interview_score)
				setCaperScore(item.caper_score)
				setExamScore(item.exam_score)
				setRemarks(item.remarks)



				setLoaded(true);
			});
		}
	}, [loaded, id]);

	const fetchRanks = useCallback(async (id) => {


		try {
			const rs = await request(
				FETCH_RANKS_BY_CADRE_API.replace(':cadre_id', id)
			);

			const cadreNamesArray = rs.ranks.map(rank => rank.name);
			setRanks(cadreNamesArray)




		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, [cadre]);

	const fetchCadres = useCallback(async id => {
		try {
			const rs = await request(
				FETCH_CADRES_API
			);

			setCadres(rs.cadres);

			fetchBriefDetails(param.id).then(item => {
				const matchCadre= rs.cadres.find(cadre => cadre.name === item.cadre)
				setCadre(matchCadre)
				fetchRanks(matchCadre.id)
				setRank(item.rank)
			})


		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, [brief]);

	const fetchBriefDetails = useCallback(async id => {
		try {
			const rs = await request(FETCH_SINGLE_BRIEF_API.replace(':id', id));
			return rs.brief;
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);


		const onSubmit = async values => {
		try {
				const config = {
				method: 'PUT',
				body: {
					...values
				},
			};
			const rs = await request(
				UPDATE_SINGLE_BRIEF_API.replace(':id', brief.id),
				config
			);

			notifyWithIcon('success', rs.message);
			navigate('/employees/promotions/briefs');
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not save brief' };
		}
	};

	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="Update Brief" parentPage="Employees" />
			{loaded && brief && (
				<div className="row">
					<Form
						initialValues={{
							...brief
						}}
						onSubmit={onSubmit}
						validate={values => {
							const errors = {};

												 // Validation for Full name
						if (!values.name) {
						  errors.name = 'Full name is required';
						}

						// Validation for Date of Birth
						if (!values.dob) {
						  errors.dob = 'Date of Birth is required';
						}

						// Validation for Age
						if (!values.age) {
						  errors.age = 'Age is required';
						} else if (isNaN(values.age) || parseInt(values.age, 10) <= 0) {
						  errors.age = 'Age must be a valid positive number';
						}

						// Validation for Date of Appointment
						if (!values.date_of_appointment_into_abc) {
						  errors.date_of_appointment_into_abc = 'Date of Appointment is required';
						}
						// Validation for Date of Appointment
						if (!values.date_of_first_appointment) {
						  errors.date_of_first_appointment = 'Date of first Appointment is required';
						}
						// Validation for Date of Appointment
						if (!values.cadre) {
						  errors.cadre = 'Cadre is required';
						}
						// Validation for Date of Appointment
						if (!values.rank) {
						  errors.rank = 'Rank is required';
						}
											// Validation for Exam Score
						if (!values.exam_score) {
						  errors.exam_score = 'Exam Score is required';
						}
						if (!values.total_score) {
						  errors.total_score = 'Total Score is required';
						}

						// Validation for In-Service Courses Attended
						if (!values.in_service_courses_attended) {
						  errors.in_service_courses_attended = 'In-Service Courses Attended is required';
						}

						// Validation for Interview Score
						if (!values.interview_score) {
						  errors.interview_score = 'Interview Score is required';
						}

						// Validation for Placement
						if (!values.placement) {
						  errors.placement = 'Placement is required';
						}

						if (!values.caper_score) {
						  errors.caper_score = 'Caper score is required';
						}
						if (!values.sanctioned_during_period) {
						  errors.sanctioned_during_period = 'Enter value';
						}

						if (!values.service_honours) {
						  errors.service_honours = 'Enter value';
						}

						if (!values.remarks) {
						  errors.remarks = 'Enter remarks';
						}
						if (!values.annual_performance_evaluation_report) {
						  errors.annual_performance_evaluation_report = 'Enter Annual performance report';
						}

						if (!values.times_presented_to_promotion_board) {
						  errors.times_presented_to_promotion_board = 'Enter value';
						}
						if (!values.current_deployment) {
						  errors.current_deployment = 'Enter value';
						}
						if (!values.years_of_service_as_of_now) {
						  errors.years_of_service_as_of_now = 'Enter value';
						}
						if (!values.years_on_present_grade_as_of_now) {
						  errors.years_on_present_grade_as_of_now = 'Enter value';
						}

							return errors;
						}}
						render={({ handleSubmit, submitError, submitting, form }) => (
							<FormWrapper onSubmit={handleSubmit} submitting={submitting}>
								<div className="row">
									<div className="col-lg-12">
										<FormSubmitError error={submitError} />
									</div>
									<div className="col-lg-10">
										<div className="card">
											<div className="card-header">
												<h5 className="card-title mb-0">Brief Details</h5>
											</div>
											<div className="card-body">
												<div className="row">
													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="name">
															Full name
														</label>
														<Field id="name" name="name">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="name"
																	placeholder="Enter full name"
																/>
															)}
														</Field>
														<ErrorBlock name="name" />
													</div>
													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="dob">
															Date of Birth
														</label>
														<Field id="dob" name="dob">
															{({ input, meta }) => (
																<Flatpickr
																	className={`form-control ${error(meta)}`}

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
														<label className="form-label" htmlFor="age">
															Age
														</label>
														<Field id="age" name="age">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="age"
																	placeholder="Enter age"
																/>
															)}
														</Field>
														<ErrorBlock name="age" />
													</div>

													<div className="col-lg-4 mb-3">
													<label
														className="form-label"
														htmlFor="date_of_appointment_into_abc"
													>
														Date of Appointment
													</label>
													<Field
														id="date_of_appointment_into_abc"
														name="date_of_appointment_into_abc"
													>
														{({ input, meta }) => (
															<Flatpickr
																className={`form-control ${error(meta)}`}

																placeholder="Select date of appointment"
																value={dateOfAppointmentABC}
																onChange={([date]) => {
																	input.onChange(
																		moment(date).format('YYYY-MM-DD')
																	);
																	setDateOfAppointmentABC(date);
																}}
															/>
														)}
													</Field>
													<ErrorBlock name="date_of_appointment_into_abc" />
												</div>
												<div className="col-lg-4 mb-3">
													<label
														className="form-label"
														htmlFor="date_of_first_appointment"
													>
														Date of First Appointment
													</label>
													<Field
														id="date_of_first_appointment"
														name="date_of_first_appointment"
													>
														{({ input, meta }) => (
															<Flatpickr
																className={`form-control ${error(meta)}`}
																placeholder="Select date of first employment"
																value={dateOfFirstAppointment}
																onChange={([date]) => {
																	input.onChange(
																		moment(date).format('YYYY-MM-DD')
																	);
																	setDateOfFirstAppointment(date);
																}}
															/>
														)}
													</Field>
													<ErrorBlock name="date_of_first_appointment" />
												</div>
													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="cadre">
															Cadre
														</label>
														<Field id="cadre" name="cadre">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="cadre"
																	placeholder=""
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
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="rank"
																	placeholder=""
																/>
															)}
														</Field>
														<ErrorBlock name="rank" />
													</div>

													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="first_name">
															Has staff been sanction during this period
														</label>
														<Field id="sanctioned_during_period" name="sanctioned_during_period">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="sanctioned_during_period"
																	placeholder=""
																/>
															)}
														</Field>
														<ErrorBlock name="sanctioned_during_period" />
													</div>

													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="first_name">
															No. of times presented to board for promotion at this rank
														</label>
														<Field id="times_presented_to_promotion_board" name="times_presented_to_promotion_board">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="times_presented_to_promotion_board"
																	placeholder=""

																/>
															)}
														</Field>
														<ErrorBlock name="times_presented_to_promotion_board" />
													</div>

													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="current_deployment">
															Current Deployment
														</label>
														<Field id="current_deployment" name="current_deployment">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="current_deployment"
																	placeholder=""
																	onChange={(e) => {
																	  input.onChange(e);
																	  setCurrentDeployment(e.target.value); // Update the state manually
																	}}

																/>
															)}
														</Field>
														<ErrorBlock name="current_deployment" />
													</div>
													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="first_name">
															IN-SERVICE course attended
														</label>
														<Field id="in_service_courses_attended" name="in_service_courses_attended">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="in_service_courses_attended"
																	placeholder="Enter course attended"
																	onChange={(e) => {
																	  input.onChange(e);
																	  setInServiceCourseAttended(e.target.value); // Update the state manually
																	}}

																/>
															)}
														</Field>
														<ErrorBlock name="in_service_courses_attended" />
													</div>
													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="placement">
															Placement
														</label>
														<Field id="placement" name="placement">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="placement"
																	placeholder="Enter placement"
																	onChange={(e) => {
																	  input.onChange(e);
																	  setPlacement(e.target.value); // Update the state manually
																	}}

																/>
															)}
														</Field>
														<ErrorBlock name="placement" />
													</div>
													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="service_honours">
															Service hours
														</label>
														<Field id="service_honours" name="service_honours">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="service_honours"
																	placeholder="Enter service hours"
																	onChange={(e) => {
																	  input.onChange(e);
																	  setServiceHours(e.target.value); // Update the state manually
																	}}

																/>
															)}
														</Field>
														<ErrorBlock name="service_honours" />
													</div>

													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="first_name">
															No. of years present at grade as at 1/1/2017
														</label>
														<Field id="years_on_present_grade_as_of_now" name="years_on_present_grade_as_of_now">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="years_on_present_grade_as_of_now"
																	placeholder="Enter service "

																/>
															)}
														</Field>
														<ErrorBlock name="years_on_present_grade_as_of_now" />
													</div>
													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="first_name">
															No. of years in service as at 1/1/2017
														</label>
														<Field id="years_of_service_as_of_now" name="years_of_service_as_of_now">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="years_of_service_as_of_now"
																	placeholder="Enter service years"

																/>
															)}
														</Field>
														<ErrorBlock name="years_of_service_as_of_now" />
													</div>

													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="annual_performance_evaluation_report">
															Annual performance evaluation report
														</label>
														<Field id="annual_performance_evaluation_report" name="annual_performance_evaluation_report">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="annual_performance_evaluation_report"
																	placeholder="Enter annual perf score"
																/>
															)}
														</Field>
														<ErrorBlock name="annual_performance_evaluation_report" />
													</div>
													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="annual_performance_evaluation_report2">
															Annual performance evaluation report2
														</label>
														<Field id="annual_performance_evaluation_report2" name="annual_performance_evaluation_report2">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="annual_performance_evaluation_report2"
																	placeholder="Enter annual perf score"
																/>
															)}
														</Field>
														<ErrorBlock name="annual_performance_evaluation_report2" />
													</div>
													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="annual_performance_evaluation_report3">
															Annual performance evaluation report3
														</label>
														<Field id="annual_performance_evaluation_report" name="annual_performance_evaluation_report3">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="annual_performance_evaluation_report3"
																	placeholder="Enter annual perf score"
																/>
															)}
														</Field>
														<ErrorBlock name="annual_performance_evaluation_report3" />
													</div>
													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="annual_performance_evaluation_report4">
															Annual performance evaluation report4
														</label>
														<Field id="annual_performance_evaluation_report4" name="annual_performance_evaluation_report4">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="annual_performance_evaluation_report4"
																	placeholder="Enter annual perf score"
																/>
															)}
														</Field>
														<ErrorBlock name="annual_performance_evaluation_report4" />
													</div>

													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="remarks">
															Remarks
														</label>
														<Field id="remarks" name="remarks">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="remarks"
																	placeholder="Enter remarks"

																/>
															)}
														</Field>
														<ErrorBlock name="remarks" />
													</div>
													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="recommendation">
															Recommendation for promotion
														</label>
														<Field id="recommendation" name="recommendation">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="recommendation"
																	placeholder="Enter recommedation"
																/>
															)}
														</Field>
														<ErrorBlock name="recommendation" />
													</div>

													<div className="col-lg-4 mb-3">
														<label className="form-label" htmlFor="year">
															Brief year
														</label>
														<Field id="year" name="year">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="year"
																	placeholder="Enter year"
																/>
															)}
														</Field>
														<ErrorBlock name="year" />
													</div>



												</div>


											</div>
										</div>
									</div>
									<div className="col-lg-2">
										<div className="card">
											<div className="card-header">
												<h5 className="card-title mb-0">Promotion Assessment</h5>
											</div>
											<div className="card-body">
												<div className="row">
													<div className="mb-3">
														<label className="form-label" htmlFor="exam_score">
															Exam score
														</label>
														<Field id="exam_score" name="exam_score">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="exam_score"
																	placeholder="Enter exam score"
																/>
															)}
														</Field>
														<ErrorBlock name="exam_score" />
													</div>
													<div className="mb-3">
														<label className="form-label" htmlFor="interview_score">
															Interview score
														</label>
														<Field id="interview_score" name="interview_score">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="interview_score"
																	placeholder="Enter interview score"
																/>
															)}
														</Field>
														<ErrorBlock name="interview_score" />
													</div>
													<div className="mb-3">
														<label className="form-label" htmlFor="caper_score">
															Caper score
														</label>
														<Field id="caper_score" name="caper_score">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="caper_score"
																	placeholder="Enter caper score"
																/>
															)}
														</Field>
														<ErrorBlock name="caper_score" />
													</div>

													<div className="mb-3">
														<label className="form-label" htmlFor="total_score">
															Total score
														</label>
														<Field id="total_score" name="total_score">
															{({ input, meta }) => (
																<input
																	{...input}
																	type="text"
																	className={`form-control ${error(meta)}`}
																	id="total_score"
																	placeholder="Enter total score"
																/>
															)}
														</Field>
														<ErrorBlock name="total_score" />
													</div>
												</div>
											</div>
										</div>
									</div>


									<div className="col-lg-12">
										<div className="text-end mb-4">
											<Link
												to="/employees/promotions/briefs"
												className="btn btn-danger w-sm me-1"
											>
												Cancel
											</Link>
											<button type="submit" className="btn btn-success w-sm">
												Update Brief
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

export default UpdateBrief;
