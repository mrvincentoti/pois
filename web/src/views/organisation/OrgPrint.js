import '../../assets/scss/profile.css';
import React, { useCallback, useEffect, useState } from 'react';

import { Button, Modal } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import DocumentMediaDropDown from '../../components/DocumentMediaDropDown';
import { GET_ORG_API } from '../../services/api';
import {
	antIconSync,
	formatPoiName,
	notifyWithIcon,
	request,
} from '../../services/utilities';
import Spin from 'antd/es/spin';
import {
	formatCadre,
	formatDate,
	formatDateWord,
	formatDateYear,
	formatFullName,
	formatGetInitialsNameOrg,
	formatGetInitialsName,
} from '../../services/utilities';

const OrgPrint = () => {
	const [loaded, setLoaded] = useState(false);
	const [OrgData, setOrgData] = useState(null);

	const navigate = useNavigate();
	const params = useParams();

	const fetchPoiDetails = useCallback(async orgId => {
		try {
			const rs = await request(GET_ORG_API.replace(':id', orgId));

			setOrgData(rs.organisation);
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

	const handleEditClick = id => {
		navigate(`/pois/${id}/edit`);
	};

	const handlePrintPage = () => {
		window.print();
	};

	return (
		<>
			<div className="container-fluid">
				<div className="row">
					<div className="col-md-12">
						{/* <div className="mb-3" style={{ textAlign: 'right' }}>
							<div className="flex-shrink-0">
								<Button
									id="printButton"
									type="primary"
									icon={<i className="ri-printer-line" />}
									onClick={handlePrintPage}
								>
									Print
								</Button>
							</div>
						</div> */}
						<div
							className="mb-3"
							style={{
								textAlign: 'right',
								display: 'flex',
								justifyContent: 'space-between',
							}}
						>
							<div className="flex-shrink-0">
								<Button
									id="backButton"
									type="primary"
									icon={<i className="ri-arrow-left-line" />}
									onClick={() => window.history.back()}
								>
									Back
								</Button>
							</div>
							<div className="flex-shrink-0">
								<Button
									id="printButton"
									type="primary"
									icon={<i className="ri-printer-line" />}
									onClick={handlePrintPage}
								>
									Print
								</Button>
							</div>
						</div>
						<div
							id="printDiv"
							className="chat-wrapper d-lg-flex gap-1 p-1"
							style={{ border: '1px dashed #000' }}
						>
							<div className="row">
								<div className="col-6 border-right">
									<div className="p-3 d-flex flex-column h-100 text-left align-items-right">
										<div className="card-body">
											<div className="text-center mb-4">
												<div className="profile-user position-relative d-inline-block  mb-4">
													{OrgData?.picture ? (
														<img
															src={OrgData?.picture}
															className="rounded-circle avatar-xl img-thumbnail user-profile-image"
															alt="user-profile"
														/>
													) : (
														<div className="avatar-xl">
															<div
																className="avatar-title rounded-circle bg-light text-primary text-uppercase "
																style={{ fontSize: '60px' }}
															>
																{formatGetInitialsNameOrg(OrgData)}
															</div>
														</div>
													)}
												</div>
												<h5 className="fs-16 mb-1">
													{formatFullName(OrgData)}
												</h5>
												<p className="text-muted mb-0">
													{OrgData?.org_name || 'N/A'}
												</p>{' '}
												<span className="text-muted">
													({OrgData?.ref_numb})
												</span>
											</div>

											<div className="d-flex align-items-left">
												<div className="mb-4 pb-2">
													<h5 className="card-title text-decoration-underline mb-3">
														PERSONAL INFORMATION
													</h5>
													<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
														<div className="flex-grow-1">
															<h6 className="fs-14 mb-2 text-black">
																Date of Establishment:{' '}
																<span className="text-muted">
																	{OrgData?.reg_numb
																		? formatDateWord(OrgData.reg_numb)
																		: 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Category:{' '}
																<span className="text-muted">
																	{' '}
																	{OrgData?.category?.name || 'N/A'}{' '}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Mobile :{' '}
																<span className="text-muted">
																	{OrgData?.phone_number || 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																E-mail :{' '}
																<span className="text-muted mb-0">
																	{OrgData?.email ? OrgData.email : 'N/A'}
																</span>
															</h6>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="col-6">
									<div className="w-100 pt-4 px-4 file-manager-content-scroll">
										<div id="folder-list" className="mb-2">
											<div className="row g-2 mb-3">
												<div className="col-12">
													<div className="d-flex align-items-center">
														<div className="mb-4 pb-2 w-100">
															<h5 className="card-title text-decoration-underline mb-3">
																TECHNICAL INFORMATION
															</h5>
															<h6 className="fs-14 mb-2 text-black">
																Registration Number :{' '}
																<span className="text-muted mb-0">
																	{OrgData?.reg_numb || 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Leader :{' '}
																<span className="text-muted mb-0">
																	{OrgData?.ceo || 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Top Commanders :{' '}
																<span className="text-muted mb-0">
																	{OrgData?.board_of_directors || 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Modus Operandi :{' '}
																<span className="text-muted mb-0">
																	{OrgData?.nature_of_business || 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Affiliation :{' '}
																<span className="text-muted mb-0">
																	{OrgData?.affiliation?.name || 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Category :{' '}
																<span className="text-muted mb-0">
																	{OrgData?.category?.name || 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Source :{' '}
																<span className="text-muted mb-0">
																	{OrgData?.source?.name || 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Operational Countries :{' '}
																<span className="text-muted mb-0">
																	{OrgData?.countries_operational?.name ||
																		'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Strength :{' '}
																<span className="text-muted mb-0">
																	{OrgData?.employee_strength || 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Address :{' '}
																<span className="text-muted mb-0">
																	{OrgData?.address || 'N/A'}
																</span>
															</h6>
														</div>
													</div>

													<div className="d-flex align-items-center">
														<div className="mb-4 pb-2 w-100">
															<h5 className="card-title text-decoration-underline mb-3">
																SOCIAL MEDIA
															</h5>
															<h6 className="fs-14 mb-2 text-black">
																Website :{' '}
																<span className="text-muted mb-0">
																	{OrgData?.website || 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Facebook :{' '}
																<span className="text-muted mb-0">
																	{OrgData?.facebook || 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Instagram :{' '}
																<span className="text-muted mb-0">
																	{OrgData?.instagram || 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																X :{' '}
																<span className="text-muted mb-0">
																	{OrgData?.twitter || 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Telegram :{' '}
																<span className="text-muted mb-0">
																	{OrgData?.telegram || 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Tiktok :{' '}
																<span className="text-muted mb-0">
																	{OrgData?.tiktok || 'N/A'}
																</span>
															</h6>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
export default OrgPrint;
