import React, { useCallback, useRef } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { GET_POI_API } from '../../services/api';
import {
	antIconSync,
	formatDate,
	formatDateWord,
	formatPoiName,
	formatGetInitialsName,
	notifyWithIcon,
	request,
} from '../../services/utilities';
import Spin from 'antd/es/spin';
import '../../assets/scss/profile.css';
import profileBg from '../../assets/images/profile-bg.jpg';
import samplePicture from '../../assets/images/users/avatar-1.jpg';
import { Button } from 'antd';

import Overview from './Overview'; // Your components
import CrimeCommitted from './CrimeCommitted';
import MediaAndDocument from './MediaAndDocument';
// import Activities from './Activities';
import Timeline from './Timeline';
import ArmsRecovered from './ArmsRecovered';

const ViewPoi = () => {
	const [loaded, setLoaded] = useState(false);
	const [poiData, setPoiData] = useState(null);
	const [activeTab, setActiveTab] = useState('overview');

	const navigate = useNavigate();
	const params = useParams();

	const fetchPoiDetails = useCallback(async Id => {
		try {
			const rs = await request(GET_POI_API.replace(':id', Id));
			setPoiData(rs.poi_data);
		} catch (error) {
			throw error;
		}
	}, []);

	useEffect(() => {
		if (!loaded) {
			fetchPoiDetails(params.id)
				.then(() => setLoaded(true))
				.catch(e => {
					notifyWithIcon('error', e.message);
					navigate('/not-found');
				});
		}
	}, [fetchPoiDetails, loaded, navigate, params.id]);

	const location = useLocation();

	const getQueryParams = search => {
		const params = new URLSearchParams(search);
		return params.get('tab');
	};

	const tab = getQueryParams(location.search);
	useEffect(() => {
		if (!loaded) {
			fetchPoiDetails(params.id)
				.then(() => setLoaded(true))
				.catch(e => {
					notifyWithIcon('error', e.message);
					navigate('/not-found');
				});
			setActiveTab(tab);
		}
	}, [fetchPoiDetails, loaded, navigate, params.id, tab]);

	const handleTabClick = tabName => {
		setActiveTab(tabName);
		navigate(`/pois/${params.id}/view?tab=` + tabName);
	};

	// function to refresh
	const refreshPoiData = async () => {
		try {
			const rs = await request(GET_POI_API.replace(':id', params.id));
			setPoiData(rs.poi_data);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	};

	// Handle the print action to navigate to a new print page
	const handlePrintPage = () => {
		navigate(`/pois/${params.id}/print`);
	};

	return (
		<>
			{loaded && poiData ? (
				<>
					<div className="container-fluid">
						<div className="profile-foreground position-relative mx-n4 mt-n4">
							<div className="profile-wid-bg"></div>
						</div>
						<div className="pt-4 mb-4 mb-lg-3 pb-lg-1">
							<div className="row g-4">
								<div className="col-auto">
									<div className="profile-user position-relative d-inline-block mb-4">
										{poiData?.picture ? (
											<img
												src={poiData?.picture}
												className="rounded-circle avatar-xl img-thumbnail user-profile-image"
												alt="user-profile"
											/>
										) : (
											<div className="avatar-xl">
												<div
													className="avatar-title rounded-circle bg-light text-primary text-uppercase "
													style={{ fontSize: '60px' }}
												>
													{formatGetInitialsName(poiData)}
												</div>
											</div>
										)}
									</div>
								</div>
								<div className="col">
									<div className="p-2">
										<h3 className="text-white mb-1">
											{formatPoiName(poiData, true)}{' '}
											<span className="badge bg-danger">
												{poiData.poi_status?.name}
											</span>
										</h3>
										<p className="text-white text-opacity-75">
											{poiData.role || 'N/A'}
											{/* <br/>
											<b>Role :</b> {poiData.role || 'N/A'}
											<br />
											<b>Age :</b> {poiData.role || 'N/A'} */}
										</p>
										<div className="hstack text-white-50 gap-1">
											<div className="me-2">
												<i className="ri-map-pin-user-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
												{poiData.country?.name || 'N/A'}
											</div>
											<div>
												<i className="ri-building-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
												{poiData.age + ' Years' || 'N/A'}
											</div>
											<div>
												<i className="ri-building-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
												{poiData.alias || 'N/A'}
											</div>
										</div>
									</div>
								</div>
								<div className="col-12 col-lg-auto order-last order-lg-0">
									<div className="row text text-white-50 text-center">
										<div className="col-lg-6 col-4">
											<div className="p-1">
												<h4 className="text-white mb-1">
													{poiData.organisation?.name || 'N/A'}
												</h4>
												<p className="fs-14 mb-0">organisation</p>
											</div>
										</div>
										<div className="col-lg-6 col-4">
											<div className="p-2">
												<h4 className="text-white mb-1">
													{poiData.affiliation || 'NA'}
												</h4>
												<p className="fs-14 mb-0">Affiliation</p>
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
													style={{
														cursor: 'pointer',
													}}
													className={`nav-link fs-14 ${
														activeTab === 'overview' ? 'active' : ''
													}`}
													onClick={() => handleTabClick('overview')}
													role="tab"
												>
													Overview
												</a>
											</li>
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
													Activites
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
													Files
												</a>
											</li>
											{/* <li className="nav-item">
												<a
													className={`nav-link fs-14 ${activeTab === 'recovered' ? 'active' : ''}`}
													onClick={() => handleTabClick('recovered')}
													role="tab"
												>
													Arms Recovered
												</a>
											</li> */}
											{/* <li className="nav-item">
												<a
													className={`nav-link fs-14 ${activeTab === 'activities' ? 'active' : ''}`}
													onClick={() => handleTabClick('activities')}
													role="tab"
												>
													Activities
												</a>
											</li> */}
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
									<div className="tab-content pt-4 text-muted">
										<div
											className="tab-pane active"
											id="overview-tab"
											role="tabpanel"
										>
											<div className="row">
												<div className="col-xxl-12 col-lg-12">
													{activeTab === 'overview' && (
														<Overview refreshPoiData={refreshPoiData} />
													)}
													{activeTab === 'activities' && (
														<Timeline refreshPoiData={refreshPoiData} />
													)}
													{activeTab === 'media' && (
														<MediaAndDocument refreshPoiData={refreshPoiData} />
													)}
													{/* {activeTab === 'activities' && (
														<Activities refreshPoiData={refreshPoiData} />
													)} */}
													{activeTab === 'recovered' && (
														<ArmsRecovered refreshPoiData={refreshPoiData} />
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

export default ViewPoi;
