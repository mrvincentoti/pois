import '../../assets/scss/profile.css';
import React, { useCallback, useEffect, useState } from 'react';

import { Button, Modal } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import DocumentMediaDropDown from '../../components/DocumentMediaDropDown';
import { GET_POI_API } from '../../services/api';
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
	formatGetInitialsName,
} from '../../services/utilities';

const PoiPrint = () => {
	const [loaded, setLoaded] = useState(false);
	const [poiData, setPoiData] = useState(null);

	const navigate = useNavigate();
	const params = useParams();

	const fetchPoiDetails = useCallback(async poiId => {
		try {
			const rs = await request(GET_POI_API.replace(':id', poiId));

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

	const handleEditClick = id => {
		navigate(`/pois/${id}/edit`);
	};

	return (
		<>
			<div className="container-fluid">
				<div className="row">
					<div className="col-md-12">
						<div className="chat-wrapper d-lg-flex gap-1 p-1" style={{border: '1px dashed #000'}}>
							<div className="row">
								<div className="col-6 border-right">
									<div className="p-3 d-flex flex-column h-100 text-left align-items-right">
										<div className="card-body">
											<div className="text-center mb-4">
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
												<h5 className="fs-16 mb-1">{formatFullName(poiData)}</h5>
												<p className="text-muted mb-0">{poiData?.alias || 'N/A'}</p> <span className="text-muted">({poiData?.ref_numb})</span>
											</div>

											<div className="d-flex align-items-left">
												<div className="mb-4 pb-2">
													<h5 className="card-title text-decoration-underline mb-3">
														PERSONAL INFORMATION
													</h5>
													<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
														<div className="flex-grow-1">
															<h6 className="fs-14 mb-2 text-black">
																Date of Birth:{' '}
																<span className="text-muted">
																	{poiData?.dob ? formatDateWord(poiData.dob) : 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																State of Origin:{' '}
																<span className="text-muted">
																	{' '}
																	{poiData?.state?.name || 'N/A'}{' '}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Marital Status:{' '}
																<span className="text-muted">
																	{poiData?.marital_status
																		? poiData?.marital_status
																		: 'N/A'}{' '}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Gender:{' '}
																<span className="text-muted">
																	{poiData?.gender
																		? poiData?.gender.name
																		: 'N/A'}{' '}
																</span>
															</h6>

															<h6 className="fs-14 mb-2 text-black">
																Mobile :{' '}
																<span className="text-muted">{poiData?.phone_number || 'N/A'}</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																E-mail :{' '}
																<span className="text-muted mb-0">{poiData?.email ? poiData.email : 'N/A'}</span>
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
																Passport Number :{' '}
																<span className="text-muted mb-0">
																	{poiData?.passport_number || 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Other ID Number :{' '}
																<span className="text-muted mb-0">
																	{poiData?.other_id_number || 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Affiliation :{' '}
																<span className="text-muted mb-0">{poiData?.affiliation || 'N/A'}</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Roles :{' '}
																<span className="text-muted mb-0">{poiData?.role || 'N/A'}</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Category :{' '}
																<span className="text-muted mb-0">{poiData?.category.name || 'N/A'}</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Source :{' '}
																<span className="text-muted mb-0">{poiData?.source.name || 'N/A'}</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Country :{' '}
																<span className="text-muted mb-0">{poiData?.country.name || 'N/A'}</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																State :{' '}
																<span className="text-muted mb-0">{poiData?.state.name || 'N/A'}</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Address :{' '}
																<span className="text-muted mb-0">{poiData?.addresses.residential || 'N/A'}</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Organisation :{' '}
																<span className="text-muted mb-0">{poiData?.organisation || 'N/A'}</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Remark :{' '}
																<span className="text-muted mb-0">{poiData?.remark || 'N/A'}</span>
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
																	{poiData?.website || 'N/A'}
																</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Facebook :{' '}
																<span className="text-muted mb-0">{poiData?.facebook || 'N/A'}</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Instagram :{' '}
																<span className="text-muted mb-0">{poiData?.instagram || 'N/A'}</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																X :{' '}
																<span className="text-muted mb-0">{poiData?.twitter || 'N/A'}</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Telegram :{' '}
																<span className="text-muted mb-0">{poiData?.telegram || 'N/A'}</span>
															</h6>
															<h6 className="fs-14 mb-2 text-black">
																Tiktok :{' '}
																<span className="text-muted mb-0">{poiData?.tiktok || 'N/A'}</span>
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
export default PoiPrint;
