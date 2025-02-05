import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { USER_API } from '../services/api';
import {
	notifyWithIcon,
	request,
} from '../services/utilities';
import Spin from 'antd/es/spin';

const Profile = () => {
	const [loaded, setLoaded] = useState(false);
	const [userData, setUserData] = useState(null);

	const navigate = useNavigate();
	const params = useParams();

	const fetchUserDetails = useCallback(async userId => {
		try {
			const rs = await request(USER_API.replace(':id', userId));
			setUserData(rs.user_data);
			
		} catch (error) {
			throw error;
		}
	}, []);

	useEffect(() => {
		if (!loaded) {
			fetchUserDetails(params.id)
				.then(_ => setLoaded(true))
				.catch(e => {
					notifyWithIcon('error', e.message);
					navigate('/not-found');
				});
		}
	}, [fetchUserDetails, loaded, navigate, params.id]);

	const handleEditClick = id => {
		navigate(`/user/${id}/edit`);
	};

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
							<h5 className="text-white mb-1">{userData?.user?.username || 'N/A'}</h5>
							<p className="text-white text-opacity-75">
								{userData?.role?.name || 'N/A'}
							</p>
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
								role="tablist">
								<li className="nav-item">
									<a
										className="nav-link fs-14 active"
										data-bs-toggle="tab"
										href="#"
										role="tab">
										<i className="ri-airplay-fill d-inline-block d-md-none"></i>{' '}
										<span className="d-none d-md-inline-block">Overview</span>
									</a>
								</li>
							</ul>
							{/* <div className="flex-shrink-0">
								<a href="#" className="btn btn-info">
									<i className="ri-edit-box-line align-bottom"></i> Edit Profile
								</a>
							</div> */}
						</div>

						<div className="tab-content pt-4 text-muted">
							<div
								className="tab-pane active"
								id="overview-tab"
								role="tabpanel">
								<div className="row">
									<div className="col-xxl-12">
										<div className="card">
											<div className="card-body">
												<h5 className="card-title mb-3">Basic Information</h5>
												<hr />
												<div className="table-responsive">
													<table className="table table-borderless mb-0">
														<tbody>
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
														</tbody>
													</table>
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
