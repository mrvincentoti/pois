import React, { useCallback } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GET_EMPLOYEE_API } from '../../services/api';
import {
	antIconSync,
	formatDate, formatDateWord,
	formatEmployeeName,
	formatGetInitialsName,
	notifyWithIcon,
	request,
} from '../../services/utilities';
import Spin from 'antd/es/spin';
import { Link } from 'react-router-dom';
import { useRef } from "react";
import {
	categoryList,
	dependentStatus,
	deploymentTypes,
	employeeStatusList,
	hasImplications,
	postingTypes,
	statusTypes, trainingCategory,
} from '../../services/constants';
import EmployeePrint from "./EmployeeProfilePrint";
import '../../assets/scss/profile.css'
import {Button} from "antd";
import EmployeePrintPage from "./EmployeePrintPage";

const ViewEmployee = () => {
	const [loaded, setLoaded] = useState(false);
	const [employeeData, setEmployeeData] = useState(null);


	const navigate = useNavigate();
	const params = useParams();

	const fetchEmployeeDetails = useCallback(async employeeId => {
		try {
			const rs = await request(GET_EMPLOYEE_API.replace(':id', employeeId));

			setEmployeeData(rs.employee);
		} catch (error) {
			throw error;
		}
	}, []);

	useEffect(() => {
		if (!loaded) {
			fetchEmployeeDetails(params.id)
				.then(_ => setLoaded(true))
				.catch(e => {
					notifyWithIcon('error', e.message);
					navigate('/not-found');
				});
		}
	}, [fetchEmployeeDetails, loaded, navigate, params.id]);


	const handlePrint = () => {
    window.print();
	  };



	return (
		<>
		<div className="container-fluid no-printme mb-5">
			{loaded && employeeData ? (
				<>
					<div className="profile-foreground position-relative mx-n4 mt-n4">
						<div className="profile-wid-bg">
							{/*<img*/}
							{/*	src="/assets/images/profile-bg.jpg"*/}
							{/*	alt=""*/}
							{/*	className="profile-wid-img"*/}
							{/*/>*/}
						</div>
					</div>
					<div className="pt-4 mb-4 mb-lg-3 pb-lg-4">
						<div className="row g-4">
							<div className="col-auto">
								<div className="profile-user position-relative d-inline-block  mb-4">
									{employeeData?.photo ? (
										<img
											src={employeeData?.photo}
											className="rounded-circle avatar-xl img-thumbnail user-profile-image"
											alt="user-profile"
										/>
									) : (
										<div className="avatar-xl">
											<div
												className="avatar-title rounded-circle bg-light text-primary text-uppercase "
												style={{ fontSize: '60px' }}
											>
												{formatGetInitialsName(employeeData)}
											</div>
										</div>
									)}
								</div>
							</div>

							<div className="col">
								<div className="p-2">
									<h3 className="text-white mb-1 text-uppercase">
										{formatEmployeeName(employeeData, true)}
									</h3>
									<p className="text-white text-opacity-75">
										{employeeData.email?employeeData.email: 'N/A'}
									</p>
									<div className="hstack text-white-50 gap-1">
										<div className="me-2">
											<i className="ri-suitcase-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
											{employeeData.directorate?.name || 'N/A'}
										</div>
										<div>
											<i className="ri-suitcase-2-fill me-1 text-white text-opacity-75 fs-16 align-middle"></i>
											{employeeData.designation?.name || 'N/A'}
										</div>
									</div>
								</div>
							</div>

							<div className="col-lg-auto order-last order-lg-0 col-12">
								<div className="text text-white-50 text-center row">
									<div className="col-4 col-lg-6">
										<div className="p-2">
											<h4 className="text-white mb-1">
												{employeeData.rank?.name || 'N/A'}
											</h4>
											<p className="fs-14 mb-0">Rank</p>
										</div>
									</div>
									<div className="col-4 col-lg-6">
										<div className="p-2">
											<h4 className="text-white mb-1">
												{employeeData.rank.level?employeeData.rank.level:"N/A"}
											</h4>
											<p className="fs-14 mb-0">GL</p>
										</div>
									</div>
									<div className="col-4 col-lg-6">
										<div className="p-2">
											<h4 className="text-white mb-1">
												{employeeData.last_promotion_date? formatDate(employeeData.last_promotion_date) :"N/A" }
											</h4>
											<p className="fs-14 mb-0">Effective Date Of Last Promotion</p>
										</div>
									</div>
									<div className="col-4 col-lg-6">
										<div className="p-2">
											<h4 className="text-white mb-1">
												{employeeData.date_of_next_promotion? employeeData.date_of_next_promotion:"N/A" }
											</h4>
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

												 href={`/dependents/${employeeData.id}`}
												role="tab"
											>
												<i className="ri-airplay-fill d-inline-block d-md-none"></i>{' '}
												<span className="d-none d-md-inline-block">
													Dependants
												</span>
											</a>


										</li>

										<li className="nav-item">
											<a
												className="nav-link fs-14 active"
												data-bs-toggle="tab"

												 href={`/next-of-kin/${employeeData.id}`}
												role="tab"
											>
												<i className="ri-airplay-fill d-inline-block d-md-none"></i>{' '}
												<span className="d-none d-md-inline-block">
													Next of kin
												</span>
											</a>


										</li>



										<li className="nav-item">
											<a
												className="nav-link fs-14 active"
												data-bs-toggle="tab"
												 href={`/deployments/${employeeData.id}`}
												role="tab"
											>
												<i className="ri-airplay-fill d-inline-block d-md-none"></i>{' '}
												<span className="d-none d-md-inline-block">
													Deployments
												</span>
											</a>


										</li>

										<li className="nav-item">
											<a
												className="nav-link fs-14 active"
												data-bs-toggle="tab"
												 href={`/employee-posting/${employeeData.id}`}
												role="tab"
											>
												<i className="ri-airplay-fill d-inline-block d-md-none"></i>{' '}
												<span className="d-none d-md-inline-block">
													Postings
												</span>
											</a>


										</li>

										<li className="nav-item">
											<a
												className="nav-link fs-14 active"
												data-bs-toggle="tab"
												 href={`/trainings/${employeeData.id}`}
												role="tab"
											>
												<i className="ri-airplay-fill d-inline-block d-md-none"></i>{' '}
												<span className="d-none d-md-inline-block">
													Trainings
												</span>
											</a>


										</li>

										<li className="nav-item">
											<a
												className="nav-link fs-14 active"
												data-bs-toggle="tab"
												 href={`/conferences/${employeeData.id}`}
												role="tab"
											>
												<i className="ri-airplay-fill d-inline-block d-md-none"></i>{' '}
												<span className="d-none d-md-inline-block">
													Seminars/Conferences
												</span>
											</a>


										</li>

										<li className="nav-item">
											<a
												className="nav-link fs-14 active"
												data-bs-toggle="tab"
												 href={`/awards/${employeeData.id}`}
												role="tab"
											>
												<i className="ri-airplay-fill d-inline-block d-md-none"></i>{' '}
												<span className="d-none d-md-inline-block">
													Awards
												</span>
											</a>


										</li>
										<li className="nav-item">
											<a
												className="nav-link fs-14 active"
												data-bs-toggle="tab"
												 href={`/sanctions/${employeeData.id}`}
												role="tab"
											>
												<i className="ri-airplay-fill d-inline-block d-md-none"></i>{' '}
												<span className="d-none d-md-inline-block">
													Sanctions
												</span>
											</a>


										</li>
									</ul>



											<div className="flex-shrink-0 me-2 btn btn-secondary" onClick={handlePrint}>
																		 <i className="ri-edit-box-line align-bottom"></i> Print
																	</div>




									<div className="flex-shrink-0">
										<a
											href={`/employees/${employeeData.id}/edit`}
											className="btn btn-secondary"
										>
											<i className="ri-edit-box-line align-bottom"></i> Edit
											Profile
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

												</div>


											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>


				</>
			) : (
				<div>
					<Spin spinning={true} indicator={antIconSync}>
						<div className="fetching" />
					</Spin>
				</div>
			)}


		</div>
		<EmployeePrint employeeData={employeeData}/>

	</>

	);
};

export default ViewEmployee;
