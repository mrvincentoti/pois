import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DocumentMediaDropDown from '../../components/DocumentMediaDropDown';
import { useEffect, useState } from 'react';
import { GET_ORG_API } from '../../services/api';
import {
	antIconSync,
	formatDate,
	formatDateWord,
	formatOrgName,
	formatGetInitialsName,
	notifyWithIcon,
	request,
} from '../../services/utilities';
import Spin from 'antd/es/spin';
// import PoiPrint from "./PoiProfilePrint";

const Overview = () => {
	const [loaded, setLoaded] = useState(false);
	const [orgData, setOrgData] = useState(null);

	const navigate = useNavigate();
	const params = useParams();

	const fetchOrgDetails = useCallback(async orgId => {
		try {
			const rs = await request(GET_ORG_API.replace(':id', orgId));
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

	const handleEditClick = id => {
		navigate(`/org/${id}/edit`);
	};

	const handlePrint = () => {
		window.print();
	};

	return (
		<>
			<div className="container-fluid no-printme mb-5">
				{loaded && orgData ? (
					<>
						<div className="card">
							<div className="card-body">
								<div className="d-flex align-items-center mb-4">
									<h5 className="card-title flex-grow-1 mb-0">
										Organisational Information
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
														Organisation Name :
													</th>
													<td className="text-muted">
														{formatOrgName(orgData, true)}
													</td>
												</tr>
												{/* <tr>
													<th className="ps-0" scope="row">
														Company Registration Number :
													</th>
													<td className="text-muted">
														{orgData.reg_numb || 'N/A'}
													</td>
												</tr> */}
												<tr>
													<th className="ps-0" scope="row">
														Reference Number :
													</th>
													<td className="text-muted">
														{orgData.ref_numb || 'N/A'}
													</td>
												</tr>
												<tr>
													<th className="ps-0" scope="row">
														Registration Number :
													</th>
													<td className="text-muted">
														{orgData.reg_numb || 'N/A'}
													</td>
												</tr>
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
												<p className="mb-1">Establishment Date :</p>
												<h6 className="text-truncate mb-0">
													{formatDate(orgData.date_of_registration) || 'N/A'}
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
												<p className="mb-1">Headquarter :</p>
												<h6 className="text-truncate">{orgData.hq || 'N/A'}</h6>
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
												<p className="mb-1">Phone Number :</p>
												<h6 className="fw-semibold">
													{orgData.phone_number || 'N/A'}
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
												<p className="mb-1">Operational Countries :</p>
												<h6 className="fw-semibold">
													{orgData.countries_operational || 'N/A'}
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
												<p className="mb-1">Leader :</p>
												<h6 className="fw-semibold">{orgData.ceo || 'N/A'}</h6>
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
												<p className="mb-1">Strength :</p>
												<h6 className="fw-semibold">
													{orgData.employee_strength || 'N/A'}
												</h6>
											</div>
										</div>
									</div>
									{/* end col */}
									{/* <div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-flag-line"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Category :</p>
												<h6 className="fw-semibold">
													{orgData.category?.name || 'N/A'}
												</h6>
											</div>
										</div>
									</div> */}
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
													{orgData.address || 'N/A'}
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
												<p className="mb-1">Modus Operandi :</p>
												<h6 className="fw-semibold">
													{orgData.nature_of_business || 'N/A'}
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
												<p className="mb-1">Email :</p>
												<h6 className="fw-semibold">
													{orgData.email || 'N/A'}
												</h6>
											</div>
										</div>
									</div>
									{/* end col */}
									{/* <div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-chat-smile-3-line"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Investors :</p>
												<h6 className="fw-semibold">
													{orgData.investors || 'N/A'}
												</h6>
											</div>
										</div>
									</div> */}
									{/* end col */}
									<div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-chat-smile-3-line"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Top Commanders :</p>
												<h6 className="fw-semibold">
													{orgData.board_of_directors || 'N/A'}
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
												<p className="mb-1">Affiliation :</p>
												<h6 className="fw-semibold">
													{orgData.affiliations || 'N/A'}
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
												<p className="mb-1">Source :</p>
												<h6 className="fw-semibold">
													{orgData.source?.name || 'N/A'}
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
		</>
	);
};

export default Overview;
