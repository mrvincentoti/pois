import React, { useCallback } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { GET_ORG_API } from '../../services/api';
import {
	antIconSync,
	formatDate,
	formatDateWord,
	formatPoiName,
	formatGetInitialsName,
	formatGetInitialsNameOrg,
	notifyWithIcon,
	request,
	formatOrgName,
} from '../../services/utilities';
import Spin from 'antd/es/spin';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import {
	categoryList,
	dependentStatus,
	deploymentTypes,
	employeeStatusList,
	hasImplications,
	postingTypes,
	statusTypes,
	trainingCategory,
} from '../../services/constants';
import '../../assets/scss/profile.css';
import profileBg from '../../assets/images/profile-bg.jpg';
import samplePicture from '../../assets/images/users/avatar-1.jpg';
import sampleMedia5 from '../../assets/images/small/img-5.jpg';
import sampleMedia6 from '../../assets/images/small/img-6.jpg';
import { Button, Modal } from 'antd';
// import PoiPrint from './PoiPrint';

import Overview from './Overview'; // Your components
// import CrimeCommitted from './CrimeCommitted';
import MediaAndDocument from './MediaAndDocument';
import Activities from './Activities';
import Timeline from './Timeline';
import OperationalCapacity from './OperationalCapacity';

const ViewOrganisation = () => {
	const printRef = useRef(null);
	const [loaded, setLoaded] = useState(false);
	const [orgData, setOrgData] = useState(null);
	const [activeTab, setActiveTab] = useState('overview');
	const [showPrintModal, setShowPrintModal] = useState(false); // State for modal visibility

	const navigate = useNavigate();
	const params = useParams();

	const fetchOrgDetails = useCallback(async Id => {
		try {
			const rs = await request(GET_ORG_API.replace(':id', Id));
			setOrgData(rs.organisation);
		} catch (error) {
			throw error;
		}
	}, []);

	useEffect(() => {
		if (!loaded) {
			fetchOrgDetails(params.id)
				.then(_ => setLoaded(true))
				.catch(e => {
					notifyWithIcon('error', e.message);
					navigate('/not-found');
				});
		}
	}, [fetchOrgDetails, loaded, navigate, params.id]);

	const location = useLocation();

	const getQueryParams = search => {
		const params = new URLSearchParams(search);
		return params.get('tab');
	};

	const tab = getQueryParams(location.search);
	useEffect(() => {
		if (!loaded) {
			fetchOrgDetails(params.id)
				.then(_ => setLoaded(true))
				.catch(e => {
					notifyWithIcon('error', e.message);
					navigate('/not-found');
				});

			setActiveTab(tab);
		}
	}, [fetchOrgDetails, loaded, navigate, params.id, tab]);

	const handleTabClick = tabName => {
		setActiveTab(tabName);
		navigate(`/org/${params.id}/view?tab=` + tabName);
	};

	// function to refresh
	const refreshOrgData = async () => {
		try {
			const rs = await request(GET_ORG_API.replace(':id', params.id));
			setOrgData(rs.organisation);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	};

	// // Function to open the modal
	// const openPrintModal = () => {
	// 	setShowPrintModal(true);
	// };

	// // Function to close the modal
	// const closePrintModal = () => {
	// 	setShowPrintModal(false);
	// };

	// Handle the print action to navigate to a new print page
	const handlePrintPage = () => {
		navigate(`/org/${params.id}/print`);
	};

	return (
		<>
			{loaded && orgData ? (
				<>
					<div className="container-fluid">
						<div className="profile-foreground position-relative mx-n4 mt-n4">
							<div className="profile-wid-bg">
								{/*<img*/}
								{/*	src="/assets/images/profile-bg.jpg"*/}
								{/*	alt=""*/}
								{/*	className="profile-wid-img"*/}
								{/*/>*/}
							</div>
						</div>
						<div className="pt-4 mb-4 mb-lg-3 pb-lg-1">
							<div className="row g-4">
								<div className="col-auto">
									<div className="profile-user position-relative d-inline-block  mb-4">
										{orgData?.picture ? (
											<img
												src={orgData?.picture}
												className="rounded-circle avatar-xl img-thumbnail user-profile-image"
												alt="user-profile"
											/>
										) : (
											<div className="avatar-xl">
												<div
													className="avatar-title rounded-circle bg-light text-primary text-uppercase "
													style={{ fontSize: '60px' }}
												>
													{formatGetInitialsNameOrg(orgData)}
												</div>
											</div>
										)}
									</div>
								</div>
								{/* end col */}
								<div className="col">
									<div className="p-2">
										<h3 className="text-white mb-1">
											{formatOrgName(orgData, true)}
										</h3>
										{/* <p className="text-white text-opacity-75">
                                            REG NUMB : {orgData.reg_numb || 'N/A'}
                                        </p> */}
										<div className="hstack text-white-50 gap-1">
											<div className="me-2 d-flex align-items-center">
												<i className="ri-map-pin-user-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
												<p className="fs-14 mb-0 me-1">Leader:</p>
												<span className="badge bg-danger">
													{orgData.ceo || 'N/A'}
												</span>
											</div>

											<div className="d-flex align-items-center">
												<i className="ri-building-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
												<span>{orgData.address || 'N/A'}</span>
											</div>
										</div>
									</div>
								</div>
								{/* end col */}
								<div className="col-12 col-lg-auto order-last order-lg-0">
									<div className="row text text-white-50 text-center">
										<div className="col-lg-6 col-4">
											<div className="p-2">
												<h4 className="text-white mb-1">
													{orgData.nature_of_business || 'N/A'}
												</h4>
												<p className="fs-14 mb-0">Modus Operandi</p>
											</div>
										</div>
										<div className="col-lg-6 col-4">
											<div className="p-2">
												<h4 className="text-white mb-1">
													{orgData.employee_strength || 'N/A'}
												</h4>
												<p className="fs-14 mb-0">Total Number of Members</p>
											</div>
										</div>
									</div>
								</div>
								{/* end col */}
							</div>
							{/* end row */}
						</div>

						<div className="row">
							<div className="col-lg-12">
								<div>
									<div className="d-flex profile-wrapper">
										{/* Nav tabs */}
										<ul
											className="nav nav-pills animation-nav profile-nav gap-2 gap-lg-3 flex-grow-1"
											role="tablist"
										>
											<li className="nav-item">
												<a
													style={{
														cursor: 'pointer',
													}}
													className={`nav-link fs-14 ${
														activeTab === 'overview' ? 'active' : ''
													}`}
													onClick={() => handleTabClick('overview')}
													role="tab"
												>
													<i className="ri-airplay-fill d-inline-block d-md-none"></i>
													<span className="d-none d-md-inline-block">
														Overview
													</span>
												</a>
											</li>
											{/* <li className="nav-item">
                                                <a
                                                    className={`nav-link fs-14 ${activeTab === 'crime' ? 'active' : ''}`}
                                                    onClick={() => handleTabClick('crime')}
                                                    role="tab"
                                                >
                                                    <i className="ri-airplay-fill d-inline-block d-md-none"></i>
                                                    <span className="d-none d-md-inline-block">
                                                        Crime Committed
                                                    </span>
                                                </a>
                                            </li> */}
											<li className="nav-item">
												<a
													style={{
														cursor: 'pointer',
													}}
													className={`nav-link fs-14 ${
														activeTab === 'activities' ? 'active' : ''
													}`}
													onClick={() => handleTabClick('activities')}
													role="tab"
												>
													<i className="ri-airplay-fill d-inline-block d-md-none"></i>
													<span className="d-none d-md-inline-block">
														Activities
													</span>
												</a>
											</li>
											<li className="nav-item">
												<a
													style={{
														cursor: 'pointer',
													}}
													className={`nav-link fs-14 ${
														activeTab === 'capacity' ? 'active' : ''
													}`}
													onClick={() => handleTabClick('capacity')}
													role="tab"
												>
													<i className="ri-airplay-fill d-inline-block d-md-none"></i>
													<span className="d-none d-md-inline-block">
														Operational Capacity
													</span>
												</a>
											</li>
											<li className="nav-item">
												<a
													style={{
														cursor: 'pointer',
													}}
													className={`nav-link fs-14 ${
														activeTab === 'media' ? 'active' : ''
													}`}
													onClick={() => handleTabClick('media')}
													role="tab"
												>
													<i className="ri-airplay-fill d-inline-block d-md-none"></i>
													<span className="d-none d-md-inline-block">
														Files
													</span>
												</a>
											</li>
										</ul>
										<div className="flex-shrink-0">
											<Button
												type="primary"
												icon={<i className="ri-printer-line" />}
												onClick={handlePrintPage}
											>
												Print Preview
											</Button>
										</div>
									</div>
									{/* Tab panes */}
									<div className="tab-content pt-4 text-muted">
										<div
											className="tab-pane active"
											id="overview-tab"
											role="tabpanel"
										>
											<div className="row">
												<div className="col-xxl-12 col-lg-12">
													{activeTab === 'overview' && (
														<Overview refreshOrgData={refreshOrgData} />
													)}
													{/* {activeTab === 'crime' && (
                                                        <CrimeCommitted refreshPoiData={refreshPoiData} />
                                                    )} */}
													{activeTab === 'media' && (
														<MediaAndDocument refreshOrgData={refreshOrgData} />
													)}
													{activeTab === 'activities' && (
														<Timeline refreshOrgData={refreshOrgData} />
													)}
													{activeTab === 'capacity' && (
														<OperationalCapacity
															refreshPoiData={refreshOrgData}
														/>
													)}
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
				<div
					className="d-flex justify-content-center"
					style={{ marginTop: '20%' }}
				>
					<Spin size="large" indicator={antIconSync} />
				</div>
			)}
		</>
	);
};

export default ViewOrganisation;
