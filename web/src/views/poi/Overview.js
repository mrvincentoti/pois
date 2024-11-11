import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DocumentMediaDropDown from '../../components/DocumentMediaDropDown';
import { useEffect, useState } from 'react';
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
import OrganisationDetail from '../../modals/Organisation/OrganisationDetail';
// import PoiPrint from "./PoiProfilePrint";

const Overview = () => {
	const [loaded, setLoaded] = useState(false);
	const [poiData, setPoiData] = useState(null);

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [organizationDetails, setOrganizationDetails] = useState(null);
	const [closeTimeout, setCloseTimeout] = useState(null);

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
		console.log(poiData);
	}, [fetchPoiDetails, loaded, navigate, params.id]);

	const handleEditClick = id => {
		navigate(`/pois/${id}/edit`);
	};

	const handlePrint = () => {
		window.print();
	};

	const handleOrganisationClick = orgId => {
		navigate(`/org/${orgId}/view?tab=overview`);
	};

	const handleOpenModal = org => {
		if (closeTimeout) {
			clearTimeout(closeTimeout);
			setCloseTimeout(null);
		}
		setOrganizationDetails(org);
		setIsModalVisible(true);
	};

	const handleCloseModal = () => {
		const timeout = setTimeout(() => {
			setIsModalVisible(false);
			setOrganizationDetails(null);
		}, 2000); // delay of 200ms
		setCloseTimeout(timeout);
	};
	return (
		<>
			<div className="container-fluid no-printme mb-5">
				{loaded && poiData ? (
					<>
						<div className="card">
							<div className="card-body">
								<div className="d-flex align-items-center mb-4">
									<h5 className="card-title flex-grow-1 mb-0">
										Personal Information
									</h5>
									<div className="flex-shrink-0">
										<input
											className="form-control d-none"
											type="file"
											id="formFile"
										/>
										<button
											className="btn btn-info"
											onClick={() => handleEditClick(params.id)}
										>
											<i className="ri-pencil-line me-1 align-bottom"></i> Edit
										</button>
									</div>
								</div>
								<div className="row">
									<div className="table-responsive">
										<table className="table table-borderless mb-0">
											<tbody>
												<tr>
													<th className="ps-0" scope="row">
														Full Name :
													</th>
													<td className="text-muted">
														{formatPoiName(poiData, true)}
													</td>

													<th className="ps-0" scope="row">
														Alias :
													</th>
													<td className="text-muted">
														{poiData.alias || 'N/A'}
													</td>

													<th className="ps-0" scope="row">
														Mobile :
													</th>
													<td className="text-muted">
														{poiData.phone_number || 'N/A'}
													</td>
												</tr>
												<tr>
													<th className="ps-0" scope="row">
														E-mail :
													</th>
													<td className="text-muted">
														{poiData.email ? poiData.email : 'N/A'}
													</td>

													<th className="ps-0" scope="row">
														Gender :
													</th>
													<td className="text-muted">
														{poiData.gender?.name || 'N/A'}
													</td>

													<th className="ps-0" scope="row">
														DOB :
													</th>
													<td className="text-muted">
														{formatDate(poiData.dob) || 'N/A'}
													</td>

													<th className="ps-0" scope="row">
														Marital Status :
													</th>
													<td className="text-muted">
														{poiData.marital_status || 'N/A'}
													</td>
												</tr>
												{poiData?.poi_status?.id === 3 && (
													<tr>
														<th className="ps-0" scope="row">
															Arresting Body :
														</th>
														<td className="text-muted">
															{poiData?.arresting_body?.name || 'N/A'}
														</td>

														<th className="ps-0" scope="row">
															Place Of Detention :
														</th>
														<td className="text-muted">
															{poiData.place_of_detention || 'N/A'}
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
								</div>
							</div>
							{/* end card body */}
						</div>
						{/* end card */}
						<div className="card">
							<div className="card-body">
								<h5 className="card-title mb-3">Technical Information</h5>
								<div className="row">
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-git-repository-fill"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Passport Number :</p>
												<h6 className="text-truncate mb-0">
													{poiData.passport_number || 'N/A'}
												</h6>
											</div>
										</div>
									</div>
									{/* end col */}
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-file-hwp-line"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Other ID Number :</p>
												<h6 className="text-truncate">
													{poiData.other_id_number || 'N/A'}
												</h6>
											</div>
										</div>
									</div>
									{/* end col */}
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-guide-line"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Affiliation :</p>
												<h6 className="fw-semibold">
													{poiData.affiliation || 'N/A'}
												</h6>
											</div>
										</div>
									</div>
									{/* end col */}
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-user-2-fill"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Role :</p>
												<h6 className="fw-semibold">{poiData.role || 'N/A'}</h6>
											</div>
										</div>
									</div>
									{/* end col */}
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-stack-fill"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Category :</p>
												<h6 className="fw-semibold">
													{poiData.category?.name || 'N/A'}
												</h6>
											</div>
										</div>
									</div>
									{/* end col */}
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-chat-1-fill"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Source :</p>
												<h6 className="fw-semibold">
													{poiData.source?.name || 'N/A'}
												</h6>
											</div>
										</div>
									</div>
									{/* end col */}
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-flag-line"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Country :</p>
												<h6 className="fw-semibold">
													{poiData.country?.name || 'N/A'}
												</h6>
											</div>
										</div>
									</div>
									{/* end col */}
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-global-line"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">State :</p>
												<h6 className="fw-semibold">
													{poiData.state?.name || 'N/A'}
												</h6>
											</div>
										</div>
									</div>
									{/* end col */}
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-global-line"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Address :</p>
												<h6 className="fw-semibold">
													{poiData?.address || 'N/A'}
												</h6>
											</div>
										</div>
									</div>
									{/* end col */}
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-chat-smile-3-line"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Remark :</p>
												<h6 className="fw-semibold">
													{poiData?.remark || 'N/A'}
												</h6>
											</div>
										</div>
									</div>
									{/* <div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-stack-fill"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Organisation :</p>
												<h6 className="fw-semibold">
													{poiData.organisation?.name || 'N/A'}
												</h6>
											</div>
										</div>
									</div> */}
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-stack-fill"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Organisation :</p>
												<h6 className="fw-semibold">
													{poiData.organisation ? (
														<span
															className="text-primary"
															style={{ cursor: 'pointer' }}
															onClick={() =>
																handleOrganisationClick(
																	poiData?.organisation.id
																)
															}
															onMouseEnter={() =>
																handleOpenModal(poiData.organisation)
															}
															onMouseLeave={handleCloseModal}
														>
															{poiData?.organisation?.name}
														</span>
													) : (
														'N/A'
													)}
												</h6>
											</div>
										</div>
									</div>
									{/* end col */}
								</div>
								{/* end row */}
							</div>
							{/* end card-body */}
						</div>
						<div className="card">
							<div className="card-body">
								<h5 className="card-title mb-3">Social Media</h5>
								<div className="row">
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-git-repository-fill"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Website :</p>
												<h6 className="text-truncate mb-0">
													{poiData.website || 'N/A'}
												</h6>
											</div>
										</div>
									</div>
									{/* end col */}
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-file-hwp-line"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Facebook :</p>
												<h6 className="text-truncate">{poiData.fb || 'N/A'}</h6>
											</div>
										</div>
									</div>
									{/* end col */}
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-guide-line"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Instagram :</p>
												<h6 className="fw-semibold">
													{poiData.instagram || 'N/A'}
												</h6>
											</div>
										</div>
									</div>
									{/* end col */}
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-user-2-fill"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">X :</p>
												<h6 className="fw-semibold">
													{poiData.twitter || 'N/A'}
												</h6>
											</div>
										</div>
									</div>
									{/* end col */}
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-stack-fill"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Telegram :</p>
												<h6 className="fw-semibold">
													{poiData.telegram || 'N/A'}
												</h6>
											</div>
										</div>
									</div>
									{/* end col */}
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-chat-1-fill"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Tiktok :</p>
												<h6 className="fw-semibold">
													{poiData.tiktok || 'N/A'}
												</h6>
											</div>
										</div>
									</div>
									{/* end col */}
								</div>
								{/* end row */}
							</div>
							{/* end card-body */}
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
			{isModalVisible && (
				<OrganisationDetail
					visible={isModalVisible}
					onMouseEnter={() => handleOpenModal(organizationDetails)}
					onMouseLeave={handleCloseModal}
					organization={organizationDetails}
				/>
			)}
		</>
	);
};

export default Overview;
