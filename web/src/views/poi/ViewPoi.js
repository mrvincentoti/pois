import React, { useCallback } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
import PoiPrint from './PoiPrint';


import Overview from './Overview'; // Your components
import CrimeCommitted from './CrimeCommitted';
import MediaAndDocument from './MediaAndDocument';
import Activities from './Activities';
import ArmsRecovered from './ArmsRecovered';

const ViewPoi = () => {
	const printRef = useRef(null);
	const [loaded, setLoaded] = useState(false);
	const [poiData, setPoiData] = useState(null);
	const [activeTab, setActiveTab] = useState('overview');
	const [showPrintModal, setShowPrintModal] = useState(false); // State for modal visibility

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
				.then(_ => setLoaded(true))
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
				.then(_ => setLoaded(true))
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

	// Function to open the modal
	const openPrintModal = () => {
		console.log("i am here");
		setShowPrintModal(true);
	};

	// Function to close the modal
	const closePrintModal = () => {
		setShowPrintModal(false);
	};

	const handlePrint = () => {
		if (printRef.current) {
			const printWindow = window.open('', '', 'width=1000,height=800');
			printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print POI</title>
                <style>
                    /* Add your custom styles here */
					@media print {
					/* Adjust the layout for printing */
					.row {
						display: flex;
						flex-wrap: nowrap; /* Ensure the columns stay on the same row */
					}

					.col {
						flex: 0 0 auto; /* Reset flex properties to default */
						width: auto; /* Reset width to auto */
					}

					/* Optionally, you can adjust specific columns' widths if needed */
					.col-6 {
						width: 50%; /* Make each column take up 50% of the row */
					}
					}


					.setRight{
					text-align: right !important;
					}

					.border-right{
					border-right: 1px dashed black;
					}

					.printme{
					display: none !important;
					}
					@media print {
						.no-printme  {
							display: none !important;
						}
						.printme  {
							display: block !important;
						}

					.folder-list {
						height: 100vh !important;
					}
					}

                </style>
            </head>
            <body>
                ${printRef.current.innerHTML}
            </body>
            </html>
        `);

			// Ensure the content is loaded before printing
			printWindow.document.close();
			printWindow.focus();

			// Trigger the print dialog
			printWindow.print();

			// Close the window after printing is completed
			printWindow.onafterprint = function () {
				printWindow.close();
			};
		}

		// Close the modal after the print operation
		setShowPrintModal(false);
	};



	return (
		<>
			{loaded && poiData ? (
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
										{poiData?.photo ? (
											<img
												src={poiData?.photo}
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
								{/* end col */}
								<div className="col">
									<div className="p-2">
										<h3 className="text-white mb-1">
											{formatPoiName(poiData, true)}
										</h3>
										<p className="text-white text-opacity-75">
											Alias : {poiData.alias || 'N/A'}
										</p>
										<div className="hstack text-white-50 gap-1">
											<div className="me-2">
												<i className="ri-map-pin-user-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
												{poiData.country?.name || 'N/A'}
											</div>
											<div>
												<i className="ri-building-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
												{poiData.gender?.name || 'N/A'}
											</div>
										</div>
									</div>
								</div>
								{/* end col */}
								<div className="col-12 col-lg-auto order-last order-lg-0">
									<div className="row text text-white-50 text-center">
										<div className="col-lg-6 col-4">
											<div className="p-2">
												<h4 className="text-white mb-1">{poiData.crime_count || 0 }</h4>
												<p className="fs-14 mb-0">Crime</p>
											</div>
										</div>
										<div className="col-lg-6 col-4">
											<div className="p-2">
												<h4 className="text-white mb-1">{poiData.arms_count || 0}</h4>
												<p className="fs-14 mb-0">Arms</p>
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
													className={`nav-link fs-14 ${activeTab === 'overview' ? 'active' : ''}`}
													onClick={() => handleTabClick('overview')}
													role="tab"
												>
													<i className="ri-airplay-fill d-inline-block d-md-none"></i>
													<span className="d-none d-md-inline-block">
														Overview
													</span>
												</a>
											</li>
											<li className="nav-item">
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
											</li>
											<li className="nav-item">
												<a
													className={`nav-link fs-14 ${activeTab === 'media' ? 'active' : ''}`}
													onClick={() => handleTabClick('media')}
													role="tab"
												>
													<i className="ri-airplay-fill d-inline-block d-md-none"></i>
													<span className="d-none d-md-inline-block">
														Media/Document
													</span>
												</a>
											</li>
											<li className="nav-item">
												<a
													className={`nav-link fs-14 ${activeTab === 'recovered' ? 'active' : ''}`}
													onClick={() => handleTabClick('recovered')}
													role="tab"
												>
													<i className="ri-airplay-fill d-inline-block d-md-none"></i>
													<span className="d-none d-md-inline-block">
														Arms Recovered
													</span>
												</a>
											</li>
											<li className="nav-item">
												<a
													className={`nav-link fs-14 ${activeTab === 'activities' ? 'active' : ''}`}
													onClick={() => handleTabClick('activities')}
													role="tab"
												>
													<i className="ri-airplay-fill d-inline-block d-md-none"></i>
													<span className="d-none d-md-inline-block">
														Activities
													</span>
												</a>
											</li>
										</ul>
										<div className="flex-shrink-0">
											<a
												className="btn btn-info"
												onClick={() => openPrintModal()}
											>
												<i className="ri-edit-box-line align-bottom"></i> Print
											</a>
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
													{activeTab === 'overview' && <Overview />}
													{activeTab === 'crime' && <CrimeCommitted />}
													{activeTab === 'media' && <MediaAndDocument />}
													{activeTab === 'activities' && <Activities />}
													{activeTab === 'recovered' && <ArmsRecovered />}
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

			{/* Ant Design Modal */}
			<Modal
				title=""
				visible={showPrintModal}
				onCancel={closePrintModal}
				footer={[
					<Button key="back" onClick={closePrintModal}>
						Cancel
					</Button>,
					<Button key="print" type="primary" onClick={handlePrint}>
						Print
					</Button>,
				]}
				width={1000}
			>
				<div ref={printRef}>
					<PoiPrint poiData={poiData} />
				</div>
			</Modal>
		</>
	);
};

export default ViewPoi;
