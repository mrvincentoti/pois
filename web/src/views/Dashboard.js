import React, { useCallback, useEffect, useState } from 'react';
import Spin from 'antd/es/spin';

import { APP_SHORT_NAME } from '../services/constants';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/auth';
import {
	antIconSync,
	formatDate,
	formatFullName,
	formatGetInitialsName,
	notifyWithIcon,
	request,
} from '../services/utilities';
import { FETCH_DASHBOARD_API } from '../services/api';
import StatBoxItem from '../components/StatBoxItem';
import StatDuePromotion from '../components/StatDuePromotion';
import StatRetiringSoon from '../components/StatRetiringSoon';
import StatEmployeeChart from '../components/StatEmployeeChart';
import StatEmployeeAnalysis from '../components/StatEmployeeAnalysis';
import StatReturningSoon from '../components/StatReturningSoon';
import NoResult from '../components/NoResult';
import PieChart from '../components/PieChart';
import '../assets/scss/posting.css';

const Dashboard = () => {
	document.title = `Dashboard - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [data, setData] = useState(null);

	const { user } = useAuth();

	const fetchStatistics = useCallback(async () => {
		try {
			const rs = await request(FETCH_DASHBOARD_API);

			setData(rs);
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not fetch dashboard');
		}
	}, []);

	useEffect(() => {
		if (fetching) {
			fetchStatistics().then(_ => setFetching(false));
		}
	}, [fetchStatistics, fetching]);

	return (
		<div className="container-fluid">
			<div className="row">
				<div className="col">
					<div className="h-100">
						<div className="row mb-3 pb-1">
							<div className="col-12">
								<div className="d-flex align-items-lg-center flex-lg-row flex-column">
									<div className="flex-grow-1">
										<h4 className="fs-16 mb-1">Welcome, {user?.username}!</h4>
										<p className="text-muted mb-0">
											Here's what's happening today.
										</p>
									</div>
									<div className="mt-3 mt-lg-0">
										<form>
											<div className="row g-3 mb-0 align-items-center">
												<div className="col-auto">
													<Link to="/employees/new" className="btn btn-success">
														<i className="ri-add-circle-line align-middle me-2"></i>
														Add Employee
													</Link>
												</div>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>

						{fetching && (
							<div>
								<Spin spinning={true} indicator={antIconSync}>
									<div className="fetching" />
								</Spin>
							</div>
						)}

						{!fetching && data && (
							<>
								<div className="row">
									<StatBoxItem
										title="Employees"
										record={data.employee_count}
										to="/employees/profiles"
										icon="bx-user-circle"
										color="primary"
									/>

									<StatBoxItem
										title="Directorates"
										record={data.directorate_count}
										to="/setup/directorates"
										icon="bx-grid-alt"
										color="dark"
									/>

									<StatBoxItem
										title="Departments"
										record={data.department_count}
										to="/setup/departments"
										icon="bx-layer"
										color="secondary"
									/>

									<StatBoxItem
										title="Deployments"
										record={data.deployment_count}
										to="/employees/deployments"
										icon="bx-tag-alt"
										color="success"
									/>
								</div>

								<div className="row">
									<div className="col-xl-8">
										<StatEmployeeAnalysis
											title={'Analysis by Cadre'}
											statistics={data.employee_in_cadre}
											categories={data.cadre_categories}
										/>
									</div>

									<div className="col-xl-4">
										<div className="card  mb-2">
											<div className="card-header align-items-center d-flex">
												<h4 className="card-title mb-0 flex-grow-1">
													Analysis By Region
												</h4>
											</div>
											<div className="card-body">
												<PieChart
													categories={data.analysis_by_region.region_names}
													statistics={data.analysis_by_region.employee_count}
													size={'350px'}
												/>
											</div>
										</div>

										<div className="card ">
											<div className="card-header align-items-center d-flex">
												<h4 className="card-title mb-0 flex-grow-1">
													Analysis By Gender
												</h4>
											</div>
											<div className="card-body">
												<PieChart
													categories={['Male', 'Female']}
													statistics={data.analysis_by_gender}
													size={'350px'}
												/>
											</div>
										</div>
									</div>
								</div>
								<div className="row">
									<div className="col-xl-4">
										<div className="card card-equal mb-0">
											<div className="card-header align-items-center d-flex">
												<h4 className="card-title mb-0 flex-grow-1">
													Up-coming Retirements
												</h4>
												<div className="flex-shrink-0">
													<Link
														to="employees/upcoming-retirees"
														className="btn btn-soft-primary btn-sm"
													>
														View All
													</Link>
												</div>
											</div>

											<div className="card-body">
												<div className="table-responsive table-card">
													<table className="table table-hover table-centered align-middle table-nowrap mb-0">
														<tbody>
															{data.retiring_in_four_months.length > 0
																? data.retiring_in_four_months.map(
																		(item, i) => {
																			return (
																				<tr>
																					<td>
																						<div className="d-flex align-items-center">
																							<div className="flex-shrink-0 me-2">
																								<div className="flex-shrink-0 avatar-sm">
																									{item.photo ? (
																										<img
																											src={item.photo}
																											alt=""
																											className="avatar-sm p-0 rounded-circle"
																										/>
																									) : (
																										<span className="mini-stat-icon avatar-title rounded-circle text-secondary bg-secondary-subtle fs-4 text-uppercase">
																											{formatGetInitialsName(
																												item
																											)}
																										</span>
																									)}
																								</div>
																							</div>
																							<div>
																								<a
																									href={`/employees/${item.id}/view`}
																									className="text-reset text-underline"
																								>
																									<h5 className="fs-14 my-1">
																										{formatFullName(item)}
																									</h5>
																									<span>{item.pf_num}</span>
																								</a>
																							</div>
																						</div>
																					</td>

																					<td>
																						<h5 className="fs-14 my-1 fw-normal">
																							{item.directorate?.name}
																						</h5>
																						<span className="text-muted">
																							{item.department?.name}
																						</span>
																					</td>

																					<td>
																						<h5 className="fs-14 my-1 fw-normal">
																							{formatDate(
																								item.retirement_date,
																								'D MMM, YYYY'
																							)}
																						</h5>
																						<span className="text-muted">
																							Retirement Date
																						</span>
																					</td>
																					<td>
																						<h5 className="fs-14 my-1 fw-normal">
																							<span className="badge bg-danger-subtle text-danger">
																								{(item.past_retirement_date &&
																									item.past_retirement_date) ||
																									''}
																							</span>
																						</h5>
																					</td>
																				</tr>
																			);
																		}
																  )
																: ''}
														</tbody>
													</table>
													{data.retiring_in_four_months.length === 0 && (
														<div className="noresult py-4">
															<NoResult title="data" />
														</div>
													)}
												</div>
											</div>
										</div>
									</div>

									<div className="col-xl-4">
										<div className="card card-equal mb-0">
											<div className="card-header align-items-center d-flex">
												<h4 className="card-title mb-0 flex-grow-1">
													Returning from posting in 4 months
												</h4>

												<div className="flex-shrink-0">
													<Link
														to="employees/returning-from-post"
														className="btn btn-soft-primary btn-sm"
													>
														View All
													</Link>
												</div>
											</div>

											<div className="card-body card-body-equal">
												<div className="table-responsive table-card">
													<table className="table table-centered table-hover align-middle table-nowrap mb-0">
														<tbody>
															{data.due_for_return_posting.length > 0
																? data.due_for_return_posting.map((item, i) => {
																		return (
																			<tr>
																				<td>
																					<div className="d-flex align-items-center">
																						<div className="flex-shrink-0 me-2">
																							<div className="flex-shrink-0 avatar-sm">
																								{item.employee.photo ? (
																									<img
																										src={item.employee.photo}
																										alt=""
																										className="avatar-sm p-0 rounded-circle"
																									/>
																								) : (
																									<span className="mini-stat-icon avatar-title rounded-circle text-secondary bg-secondary-subtle fs-4 text-uppercase">
																										{formatGetInitialsName(
																											item.employee
																										)}
																									</span>
																								)}
																							</div>
																						</div>
																						<div>
																							<a
																								href={`/employees/${item.id}/view`}
																								className="text-reset text-underline"
																							>
																								<h5 className="fs-14 my-1">
																									{formatFullName(
																										item.employee
																									)}
																								</h5>
																								<span>
																									{item.employee.pf_num}
																								</span>
																							</a>
																						</div>
																					</div>
																				</td>

																				<td>
																					<h5 className="fs-14 my-1 fw-normal">
																						{item.station?.name}
																					</h5>
																					<span className="text-muted">
																						Station
																					</span>
																				</td>
																				<td>
																					<h5 className="fs-14 my-1 fw-normal">
																						{item.department?.name}
																					</h5>
																					<span className="text-muted">
																						Department
																					</span>
																				</td>
																				<td>
																					<h5 className="fs-14 my-1 fw-normal">
																						{formatDate(
																							item.expected_date_of_return,
																							'D MMM, YYYY'
																						)}
																					</h5>
																					<span className="text-muted">
																						Return Date
																					</span>
																				</td>
																				<td>
																					<h5 className="fs-14 my-1 fw-normal">
																						<span className="badge bg-danger-subtle text-danger">
																							{(item.past_retirement_date &&
																								item.past_retirement_date) ||
																								''}
																						</span>
																					</h5>
																				</td>
																			</tr>
																		);
																  })
																: ''}
														</tbody>
													</table>
													{data.due_for_return_posting.length === 0 && (
														<div className="noresult py-4">
															<NoResult title="data" />
														</div>
													)}
												</div>
											</div>
										</div>
									</div>

									<div className="col-xl-4">
										<div className="card card-equal mb-0">
											<div className="card-header align-items-center d-flex">
												<h4 className="card-title mb-0 flex-grow-1">
													Due for promotion
												</h4>

												<div className="flex-shrink-0">
													<Link
														to="/employees/promotions/due"
														className="btn btn-soft-primary btn-sm"
													>
														View All
													</Link>
												</div>
											</div>

											<div className="card-body card-body-equal">
												<div className="table-responsive table-card">
													<table className="table table-centered table-hover align-middle table-nowrap mb-0">
														<tbody>
															{data.due_for_promotion.length > 0
																? data.due_for_promotion.map((item, i) => {
																		return (
																			<tr>
																				<td>
																					<div className="d-flex align-items-center">
																						<div className="flex-shrink-0 me-2">
																							<div className="flex-shrink-0 avatar-sm">
																								{item.employee.photo ? (
																									<img
																										src={item.employee.photo}
																										alt=""
																										className="avatar-sm p-0 rounded-circle"
																									/>
																								) : (
																									<span className="mini-stat-icon avatar-title rounded-circle text-secondary bg-secondary-subtle fs-4 text-uppercase">
																										{formatGetInitialsName(
																											item.employee
																										)}
																									</span>
																								)}
																							</div>
																						</div>
																						<div>
																							<a
																								href={`/employees/${item.id}/view`}
																								className="text-reset text-underline"
																							>
																								<h5 className="fs-14 my-1">
																									{formatFullName(
																										item.employee
																									)}
																								</h5>
																								<span>
																									{item.employee.pf_num}
																								</span>
																							</a>
																						</div>
																					</div>
																				</td>

																				<td>
																					<h5 className="fs-14 my-1 fw-normal">
																						{item.directorate?.name}
																					</h5>
																					<span className="text-muted">
																						Directorate
																					</span>
																				</td>
																				<td>
																					<h5 className="fs-14 my-1 fw-normal">
																						{item.department?.name}
																					</h5>
																					<span className="text-muted">
																						Department
																					</span>
																				</td>
																				<td>
																					<h5 className="fs-14 my-1 fw-normal">
																						{formatDate(
																							item.promotion_due_date,
																							'D MMM, YYYY'
																						)}
																					</h5>
																					<span className="text-muted">
																						Due Date
																					</span>
																				</td>
																				<td>
																					<h5 className="fs-14 my-1 fw-normal">
																						<span className="badge bg-danger-subtle text-danger">
																							{(item.past_retirement_date &&
																								item.past_retirement_date) ||
																								''}
																						</span>
																					</h5>
																				</td>
																			</tr>
																		);
																  })
																: ''}
														</tbody>
													</table>
													{data.due_for_promotion.length === 0 && (
														<div className="noresult py-4">
															<NoResult title="data" />
														</div>
													)}
												</div>
											</div>
										</div>
									</div>
								</div>

								<div className="row mt-4">
									<div>
										<StatEmployeeAnalysis
											title={'Analysis by Directorate'}
											statistics={data.employee_vs_retiring_in_directorate}
											categories={
												data.employee_vs_retiring_in_directorate_category
											}
										/>
									</div>
								</div>

								{/*<div className="row">*/}
								{/*	<div className="col-xl-12">*/}
								{/*		<StatDuePromotion items={data.due_for_promotion} />*/}
								{/*	</div>*/}
								{/*</div>*/}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
