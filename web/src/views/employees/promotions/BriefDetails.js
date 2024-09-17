import React, { useState, useEffect, useCallback } from 'react';
import { APP_SHORT_NAME } from '../../../services/constants';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
	formatEmployeeName,
	formatGetInitialsName,
	formatGetInitialsString,
	notifyWithIcon,
	request,
} from '../../../services/utilities';
import {
	APPROVE_SINGLE_BRIEF_API,
	DECLINE_SINGLE_BRIEF_API,
	FETCH_SINGLE_BRIEF_API,
	GET_EMPLOYEE_API,
	UPDATE_SINGLE_BRIEF_API,
} from '../../../services/api';
import { FORM_ERROR } from 'final-form';
import '../../../assets/scss/briefdetails.css';

const BriefDetails = () => {
	document.title = `Employee Promotion Briefs - ${APP_SHORT_NAME}`;
	const [loaded, setLoaded] = useState(false);
	const [briefDetail, setBriefDetail] = useState(null);
	const [years, setYears] = useState([]);
	const [linkDisabled, setLinkDisabled] = useState(false);

	const navigate = useNavigate();

	const param = useParams();
	const { id } = useParams();

	function getLastThreeYears(currentYear) {
		const result = [];
		for (let i = 0; i < 4; i++) {
			result.push(currentYear - i);
		}

		return result;
	}

	useEffect(() => {
		if (!loaded) {
			fetchBriefDetails(param.id).then(item => {
				setYears(getLastThreeYears(item.year));

				if (!item) {
					notifyWithIcon('error', 'Employee not found!');
					navigate('/employees/profiles');
					return;
				}

				if (item.status === 1 || item.status === 2) {
					setLinkDisabled(true);
				}

				setBriefDetail(item);

				setLoaded(true);
			});
		}
	}, [loaded, id]);

	const fetchBriefDetails = useCallback(async id => {
		try {
			const rs = await request(FETCH_SINGLE_BRIEF_API.replace(':id', id));
			return rs.brief;
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const approveBrief = async values => {
		try {
			const config = {
				method: 'POST',
				body: {},
			};
			const rs = await request(
				APPROVE_SINGLE_BRIEF_API.replace(':id', id),
				config
			);
			rs.message
				? notifyWithIcon('success', rs.message)
				: notifyWithIcon('error', rs.error);
			navigate('/employees/promotions/briefs');
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not save brief' };
		}
	};

	const declineBrief = async values => {
		try {
			const config = {
				method: 'POST',
				body: {},
			};
			const rs = await request(
				DECLINE_SINGLE_BRIEF_API.replace(':id', id),
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
			<div className="row">
				<Breadcrumbs
					pageTitle="Employee Promotion Briefs Details"
					parentPage="Promotions"
				/>
				<div className="row">
					<div className="col-lg-12">
						<div className="card" id="demo">
							<div className="row">
								<div className="col-lg-12">
									<div className="card-header border-bottom-dashed p-4">
										<div className="d-flex">
											<div className="flex-grow-1">
												<div className="mt-22">
													{briefDetail?.employee.photo ? (
														<img
															src={briefDetail.employee.photo}
															style={{ width: '200px' }}
															alt="user-img"
															className="img-thumbnail rounded-circle "
														/>
													) : (
														<div className="avatar-group-item">
															<div className="avatar-xl">
																<div
																	className="avatar-title rounded-circle bg-light text-primary text-uppercase "
																	style={{ fontSize: '60px' }}
																>
																	{formatGetInitialsName(briefDetail?.employee)}
																</div>
															</div>
														</div>
													)}
												</div>
											</div>
											<div
												className="flex-shrink-0"
												style={{ border: '1px dashed #ccc', padding: '10px' }}
											>
												<h5>PROMOTED TO G/L - 12</h5>
												<h5>ACTUAL - 12</h5>
											</div>
										</div>
									</div>
								</div>
								<div className="col-lg-12">
									<div className="card-body p-4 ">
										<div className="table-responsive">
											<table className="table table-borderless text-center table-nowrap align-middle mb-0">
												<tbody id="products-list">
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">1.</span>
															<span className="fw-semibold ml-10">
																NAME:
															</span>{' '}
															<span className="ml-10">{briefDetail?.name}</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">2.</span>
															<span className="fw-semibold ml-10">
																RANK:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.rank || 'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">3.</span>
															<span className="fw-semibold ml-10">
																SERVICE HONOURS:
															</span>{' '}
															{briefDetail?.service_honours || 'N/A'}
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">4.</span>
															<span className="fw-semibold ml-10">
																DOB:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.dob || 'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">5.</span>
															<span className="fw-semibold ml-10">
																AGE:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.age || 'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">6.</span>
															<span className="fw-semibold ml-10">
																DATE OF FIRST APPOINTMENT:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.date_of_first_appointment ||
																	'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">7.</span>
															<span className="fw-semibold ml-10">
																DATE OF APPOINTMENT INTO ABC:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.date_of_appointment_into_abc ||
																	'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">8.</span>
															<span className="fw-semibold ml-10">
																NUMBER OF YEARS OF SERVICE AS AT 1/1/2017:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.years_of_service_as_of_now ||
																	'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">9.</span>
															<span className="fw-semibold ml-10">
																DATE OF LAST PROMOTION:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.years_of_service_as_of_now ||
																	'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">10.</span>
															<span className="fw-semibold ml-10">
																IN-SERVICE COURSE ATTENDED:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.in_service_courses_attended ||
																	'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">11.</span>
															<span className="fw-semibold ml-10">
																PLACEMENT:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.placement || 'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">12.</span>
															<span className="fw-semibold ml-10">
																NO. OF YEARS ON PRESENT GRADE AS AT 1/1/2017:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.years_of_service_as_of_now ||
																	'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">13.</span>
															<span className="fw-semibold ml-10">
																NO. OF TIMES STAFF WAS PRESENTED TO THE
																PROMOTION BOARD ON THIS RANK:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.times_presented_to_promotion_board ||
																	'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">14.</span>
															<span className="fw-semibold ml-10">
																HAS STAFF BEEN SANCTION DURING THIS PERIOD?:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.sanctioned_during_period || 'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">15.</span>
															<span className="fw-semibold ml-10">
																CURRENT DEPLOYMENT:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.current_deployment || 'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">16.</span>
															<span className="fw-semibold ml-10">
																ANNUAL PERFORMANCE EVALUATION REPORT:
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start">
															<div className="ml-10">
																<table
																	className="table table-borderless table-nowrap align-middle mb-0"
																	style={{ width: '250px' }}
																>
																	<tbody>
																		<tr>
																			<td className="fw-semibold text-uppercase">
																				{years[0]}
																			</td>
																			<td className="text-end text-uppercase">
																				{
																					briefDetail?.annual_performance_evaluation_report
																				}
																			</td>
																		</tr>

																		<tr>
																			<td className="fw-semibold text-uppercase">
																				{years[1]}
																			</td>
																			<td className="text-end text-uppercase">
																				{
																					briefDetail?.annual_performance_evaluation_report2
																				}
																			</td>
																		</tr>

																		<tr>
																			<td className="fw-semibold text-uppercase">
																				{years[2]}
																			</td>
																			<td className="text-end text-uppercase">
																				{
																					briefDetail?.annual_performance_evaluation_report3
																				}
																			</td>
																		</tr>
																		<tr>
																			<td className="fw-semibold text-uppercase">
																				{years[3]}
																			</td>
																			<td className="text-end text-uppercase">
																				{
																					briefDetail?.annual_performance_evaluation_report4
																				}
																			</td>
																		</tr>
																	</tbody>
																</table>
															</div>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">17a.</span>
															<span className="fw-semibold ml-10">
																CAPER SCORE:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.caper_score || 'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">17b.</span>
															<span className="fw-semibold ml-10">
																EXAM SCORE:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.exam_score || 'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">17c.</span>
															<span className="fw-semibold ml-10">
																INTERVIEW SCORE:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.interview_score || 'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">18.</span>
															<span className="fw-semibold ml-10">
																TOTAL SCORE:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.total_score || 'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">19.</span>
															<span className="fw-semibold ml-10">
																REMARKS:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.remarks || 'N/A'}
															</span>
														</td>
													</tr>
													<tr>
														<td className="text-start" colSpan={6}>
															<span className="fw-semibold">20.</span>
															<span className="fw-semibold ml-10">
																RECOMMENDATION:
															</span>{' '}
															<span className="ml-10">
																{briefDetail?.recommendation || 'N/A'}
															</span>
														</td>
													</tr>
													<div className="watermark">
														<h1 className="text">
															{briefDetail?.status === 1 ? 'APPROVED' : ''}
														</h1>
														<h1 className="text">
															{briefDetail?.status === 2 ? 'DECLINED' : ''}
														</h1>
													</div>
												</tbody>
											</table>
										</div>
										<div className="hstack gap-2 justify-content-end d-print-none mt-4">
											<a href="#" className="btn btn-info">
												<i className="ri-printer-line align-bottom me-1"></i>{' '}
												Print
											</a>

											<a
												href="/employees/promotions/briefs"
												className="btn btn-info"
											>
												<i className="ri-arrow-go-back-fill align-bottom me-1"></i>{' '}
												Back to briefs
											</a>
											{!linkDisabled ? (
												<>
													<a
														onClick={() => approveBrief(id)}
														className={`btn  ${
															linkDisabled
																? 'btn-secondary disabled'
																: 'btn-success'
														}`}
													>
														<i className="ri-download-2-line align-bottom me-1"></i>{' '}
														Approve
													</a>
													<a
														onClick={() => declineBrief(id)}
														className={`btn  ${
															linkDisabled
																? 'btn-secondary disabled'
																: 'btn-success'
														}`}
													>
														<i className="ri-download-2-line align-bottom me-1"></i>{' '}
														Decline
													</a>
												</>
											) : (
												''
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BriefDetails;
