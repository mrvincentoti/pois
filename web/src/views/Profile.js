import React from 'react';

import { APP_SHORT_NAME } from '../services/constants';

const Profile = () => {
	document.title = `My Profile - ${APP_SHORT_NAME}`;

	return (
		<div className="container-fluid">
			<div className="profile-foreground position-relative mx-n4 mt-n4">
				<div className="profile-wid-bg">
					<img
						src="/assets/images/profile-bg.jpg"
						alt=""
						className="profile-wid-img"
					/>
				</div>
			</div>
			<div className="pt-4 mb-4 mb-lg-3 pb-lg-4 profile-wrapper">
				<div className="row g-4">
					<div className="col-auto">
						<div className="avatar-lg">
							<img
								src="/assets/images/users/avatar-1.jpg"
								alt="user-img"
								className="img-thumbnail rounded-circle"
							/>
						</div>
					</div>

					<div className="col">
						<div className="p-2">
							<h5 className="text-white mb-1">Anna Adame</h5>
							<p className="text-white text-opacity-75">Head RIDU</p>
							<div className="hstack text-white-50 gap-1">
								<div className="me-2">
									<i className="ri-map-pin-user-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
									Abuja, Nigeria
								</div>
								<div>
									<i className="ri-building-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
									DRA
								</div>
							</div>
						</div>
					</div>

					<div className="col-12 col-lg-auto order-last order-lg-0">
						<div className="row text text-white-50 text-center">
							<div className="col-lg-2 col-2">
								<div className="p-2">
									<h5 className="text-white mb-1">ACIO</h5>
									<p className="fs-14 mb-0">Rank</p>
								</div>
							</div>
							<div className="col-lg-1 col-2">
								<div className="p-2">
									<h5 className="text-white mb-1">12</h5>
									<p className="fs-14 mb-0">GL</p>
								</div>
							</div>
							<div className="col-lg-4 col-4">
								<div className="p-2">
									<h5 className="text-white mb-1">2 Jan, 2024</h5>
									<p className="fs-14 mb-0">Last Promotion</p>
								</div>
							</div>
							<div className="col-lg-4 col-4">
								<div className="p-2">
									<h5 className="text-white mb-1">2 Jan, 2024</h5>
									<p className="fs-14 mb-0">Next Promotion</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="row">
				<div className="col-lg-12">
					<div>
						<div className="d-flex profile-wrapper">
							<ul
								className="nav nav-pills animation-nav profile-nav gap-2 gap-lg-3 flex-grow-1"
								role="tablist"
							>
								<li className="nav-item">
									<a
										className="nav-link fs-14 active"
										data-bs-toggle="tab"
										href="#"
										role="tab"
									>
										<i className="ri-airplay-fill d-inline-block d-md-none"></i>{' '}
										<span className="d-none d-md-inline-block">Overview</span>
									</a>
								</li>
							</ul>
							<div className="flex-shrink-0">
								<a href="#" className="btn btn-info">
									<i className="ri-edit-box-line align-bottom"></i> Edit Profile
								</a>
							</div>
						</div>

						<div className="tab-content pt-4 text-muted">
							<div
								className="tab-pane active"
								id="overview-tab"
								role="tabpanel"
							>
								<div className="row">
									<div className="col-xxl-12">
										<div className="card">
											<div className="card-body">
												<h5 className="card-title mb-3">Basic Information</h5>
												<hr />
												<div className="table-responsive">
													<table className="table table-borderless mb-0">
														<tbody>
															{/* <tr>
																<th className="ps-0" scope="row">PFS Number :</th>
																<td className="text-muted">PFS000001</td>
															</tr> */}
															<tr>
																<th className="ps-0" scope="row">
																	First Name :
																</th>
																<td className="text-muted">Anna</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	Last Name :
																</th>
																<td className="text-muted">Adame</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	Middle Name :
																</th>
																<td className="text-muted">O.</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	Mobile :
																</th>
																<td className="text-muted">
																	+(234) 9087 6543 02
																</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	E-mail :
																</th>
																<td className="text-muted">
																	daveadame@velzon.com
																</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	Date Of Birth :
																</th>
																<td className="text-muted">16 Feb, 1993</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	Gender :
																</th>
																<td className="text-muted">Female</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	Marital Status :
																</th>
																<td className="text-muted">Married</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	State :
																</th>
																<td className="text-muted">Cross River</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	LGA :
																</th>
																<td className="text-muted">Yakurr</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	Location :
																</th>
																<td className="text-muted">Anuja, Nigeria</td>
															</tr>
															{/* <tr>
																<th className="ps-0" scope="row">Date Of Appointment</th>
																<td className="text-muted">24 Nov 2021</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">Date Of Employment</th>
																<td className="text-muted">24 Nov 2021</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">Years of Service</th>
																<td className="text-muted">11</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">Date Of Retirement</th>
																<td className="text-muted">24 Nov 2021</td>
															</tr> */}
														</tbody>
													</table>
												</div>
											</div>
										</div>

										<div className="card">
											<div className="card-body">
												<h5 className="card-title mb-3">
													Employment Information
												</h5>
												<hr />
												<div className="table-responsive">
													<table className="table table-borderless mb-0">
														<tbody>
															<tr>
																<th className="ps-0" scope="row">
																	PFS Number :
																</th>
																<td className="text-muted">PFS000001</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	Rank :
																</th>
																<td className="text-muted">ACIO</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	Grade Level :
																</th>
																<td className="text-muted">13</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	Cadre :
																</th>
																<td className="text-muted">Professional</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	Designation :
																</th>
																<td className="text-muted">Director</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	Date Of First Appointment
																</th>
																<td className="text-muted">24 Nov 2021</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	Date Of Appointment into NIA
																</th>
																<td className="text-muted">24 Nov 2021</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	Date Of Last Promotion
																</th>
																<td className="text-muted">24 Nov 2021</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	Date Of Next Promotion
																</th>
																<td className="text-muted">24 Nov 2021</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	Years of Service
																</th>
																<td className="text-muted">11</td>
															</tr>
															<tr>
																<th className="ps-0" scope="row">
																	Date Of Retirement
																</th>
																<td className="text-muted">24 Nov 2021</td>
															</tr>
														</tbody>
													</table>
												</div>
											</div>
										</div>
										<div className="card">
											<div className="card-body">
												<h5 className="card-title mb-4">Skills</h5>
												<hr />
												<div className="d-flex flex-wrap gap-2 fs-15">
													<a
														href="#"
														className="badge bg-primary-subtle text-primary"
													>
														Hacking
													</a>
													<a
														href="#"
														className="badge bg-primary-subtle text-primary"
													>
														Interception
													</a>
													<a
														href="#"
														className="badge bg-primary-subtle text-primary"
													>
														Networking
													</a>
													<a
														href="#"
														className="badge bg-primary-subtle text-primary"
													>
														Welding
													</a>
													<a
														href="#"
														className="badge bg-primary-subtle text-primary"
													>
														Mason
													</a>
												</div>
											</div>
										</div>

										<div className="card">
											<div className="card-body">
												<div className="d-flex align-items-center mb-4">
													<div className="flex-grow-1">
														<h5 className="card-title mb-0">Awards</h5>
														<hr />
													</div>
													<div className="flex-shrink-0">
														<div className="dropdown">
															<a
																href="#"
																role="button"
																id="dropdownMenuLink1"
																data-bs-toggle="dropdown"
																aria-expanded="false"
															>
																<i className="ri-more-2-fill fs-14"></i>
															</a>
														</div>
													</div>
												</div>
												<div className="d-flex mb-4">
													<div className="flex-shrink-0">
														<img
															src="./assets/images/small/img-4.jpg"
															alt=""
															height="50"
															className="rounded"
														/>
													</div>
													<div className="flex-grow-1 ms-3 overflow-hidden">
														<a href="#">
															<h6 className="text-truncate fs-14">
																Best Staff
															</h6>
														</a>
														<p className="text-muted mb-0">15 Dec 2021</p>
													</div>
												</div>
												<div className="d-flex mb-4">
													<div className="flex-shrink-0">
														<img
															src="./assets/images/small/img-5.jpg"
															alt=""
															height="50"
															className="rounded"
														/>
													</div>
													<div className="flex-grow-1 ms-3 overflow-hidden">
														<a href="#">
															<h6 className="text-truncate fs-14">
																Smartest Applications for Business Developer
															</h6>
														</a>
														<p className="text-muted mb-0">28 Nov 2021</p>
													</div>
												</div>
												<div className="d-flex">
													<div className="flex-shrink-0">
														<img
															src="./assets/images/small/img-6.jpg"
															alt=""
															height="50"
															className="rounded"
														/>
													</div>
													<div className="flex-grow-1 ms-3 overflow-hidden">
														<a href="#">
															<h6 className="text-truncate fs-14">
																How to get creative in your work Presentation
															</h6>
														</a>
														<p className="text-muted mb-0">21 Nov 2021</p>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div className="col-xxl-12">
										<div className="card">
											<div className="card-header">
												<h5 className="card-title">Certifications</h5>
												<hr />
											</div>
											<div className="card-body">
												<div className="swiper project-swiper mt-n4">
													<div className="swiper-wrapper">
														<div className="swiper-slide mb-2">
															<div className="card profile-project-card shadow-none profile-project-info mb-0">
																<div className="card-body p-4">
																	<div className="d-flex">
																		<div className="flex-grow-1 text-muted overflow-hidden">
																			<h5 className="fs-14 text-truncate mb-1">
																				<a href="#" className="text-body">
																					Ethical Hacking
																				</a>
																			</h5>
																			<p className="text-muted text-truncate mb-0">
																				Date Issued :{' '}
																				<span className="fw-semibold text-body">
																					1 Jan, 2020
																				</span>
																			</p>
																		</div>
																		<div className="flex-shrink-0 ms-2">
																			<div className="badge bg-warning-subtle text-warning fs-10">
																				{' '}
																				Pending
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</div>
														<div className="swiper-slide mb-2">
															<div className="card profile-project-card shadow-none profile-project-danger mb-0">
																<div className="card-body p-4">
																	<div className="d-flex">
																		<div className="flex-grow-1 text-muted overflow-hidden">
																			<h5 className="fs-14 text-truncate mb-1">
																				<a href="#" className="text-body">
																					Project Management
																				</a>
																			</h5>
																			<p className="text-muted text-truncate mb-0">
																				{' '}
																				Date Issued :{' '}
																				<span className="fw-semibold text-body">
																					20 Aug, 2021
																				</span>
																			</p>
																		</div>
																		<div className="flex-shrink-0 ms-2">
																			<div className="badge bg-success-subtle text-success fs-10">
																				{' '}
																				Approved
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div className="col-xxl-12">
										<div className="card">
											<div className="card-body">
												<div className="d-flex align-items-center mb-4">
													<div className="flex-grow-1">
														<h5 className="card-title mb-0">Dependents</h5>
													</div>
													<div className="flex-shrink-0">
														<div className="dropdown">
															<a
																href="#"
																role="button"
																id="dropdownMenuLink2"
																data-bs-toggle="dropdown"
																aria-expanded="false"
															>
																<i className="ri-more-2-fill fs-14"></i>
															</a>

															<ul
																className="dropdown-menu dropdown-menu-end"
																aria-labelledby="dropdownMenuLink2"
															>
																<li>
																	<a className="dropdown-item" href="#">
																		View
																	</a>
																</li>
																<li>
																	<a className="dropdown-item" href="#">
																		Edit
																	</a>
																</li>
																<li>
																	<a className="dropdown-item" href="#">
																		Delete
																	</a>
																</li>
															</ul>
														</div>
													</div>
												</div>
												<div>
													<div className="d-flex align-items-center py-3">
														<div className="avatar-xs flex-shrink-0 me-3">
															<img
																src="/assets/images/users/avatar-3.jpg"
																alt=""
																className="img-fluid rounded-circle"
															/>
														</div>
														<div className="flex-grow-1">
															<div>
																<h5 className="fs-15 mb-1">
																	Esther James - 17 Years
																</h5>
																{/* <p className="fs-13 text-muted mb-0">Frontend Developer</p> */}
																<p className="fs-13 text-muted mb-0">
																	Relationship - Daughter
																</p>
															</div>
														</div>
														<div className="flex-shrink-0 ms-2">
															<button
																type="button"
																className="btn btn-sm btn-outline-info"
															>
																<i className="ri-user-add-line align-middle"></i>
															</button>
														</div>
													</div>
												</div>
											</div>
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

export default Profile;
