// OrganizationDetailsModal.js
import React, {useEffect} from 'react';
import { Modal } from 'antd';

import {
	antIconSync,
	formatDate,
	formatDateWord,
	formatOrgName,
	formatGetInitialsName,
	notifyWithIcon,
	request,
} from '../../services/utilities';

const OrganisationDetail = ({ visible, onClose, organization }) => {

	return (
		<Modal
			visible={visible}
			title="organization Details"
			onCancel={onClose}
			footer={null}
		>
			<div className="organization-details">
				{/* <p>
					<strong>Name:</strong> {organization??.name || 'N/A'}
				</p>
				<p>
					<strong>Address:</strong> {organization??.website || 'N/A'}
				</p> */}
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
								{/* <button
									className="btn btn-info"
									onClick={() => handleEditClick(params.id)}
								>
									<i className="ri-pencil-line me-1 align-bottom"></i> Edit
								</button> */}
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
												{formatOrgName(organization, true)}
											</td>
											<th className="ps-0" scope="row">
												Reference Number :
											</th>
											<td className="text-muted">
												{organization?.ref_numb || 'N/A'}
											</td>
											<th className="ps-0" scope="row">
												Registration Number :
											</th>
											<td className="text-muted">
												{organization?.reg_numb || 'N/A'}
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
											{formatDate(organization?.date_of_registration) || 'N/A'}
										</h6>
									</div>
								</div>
							</div>
							{/* end col */}
							{/* <div className="col-6 col-md-4">
										<div className="d-flex mt-4">
											<div className="flex-shrink-0 avatar-xs align-self-center me-3">
												<div className="avatar-title bg-light rounded-circle fs-16 text-primary">
													<i className="ri-file-hwp-line"></i>
												</div>
											</div>
											<div className="flex-grow-1 overflow-hidden">
												<p className="mb-1">Headquarter :</p>
												<h6 className="text-truncate">{organization?.hq || 'N/A'}</h6>
											</div>
										</div>
									</div> */}
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
											{organization?.phone_number || 'N/A'}
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
											{organization?.countries_operational || 'N/A'}
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
										<h6 className="fw-semibold">{organization?.ceo || 'N/A'}</h6>
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
											{organization?.employee_strength || 'N/A'}
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
													{organization?.category?.name || 'N/A'}
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
											{organization?.address || 'N/A'}
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
											{organization?.nature_of_business || 'N/A'}
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
											{organization?.email || 'N/A'}
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
													{organization?.investors || 'N/A'}
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
											{organization?.board_of_directors || 'N/A'}
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
											{organization?.affiliations || 'N/A'}
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
											{organization?.source?.name || 'N/A'}
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
											{organization?.website || 'N/A'}
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
										<h6 className="text-truncate">{organization?.fb || 'N/A'}</h6>
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
											{organization?.instagram || 'N/A'}
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
											{organization?.twitter || 'N/A'}
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
											{organization?.telegram || 'N/A'}
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
											{organization?.tiktok || 'N/A'}
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
			</div>
		</Modal>
	);
};

export default OrganisationDetail;
