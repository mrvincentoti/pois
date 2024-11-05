import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DocumentMediaDropDown from '../../components/DocumentMediaDropDown';
import NewEditComment from './NewEditComment';
import NoResult from '../../components/NoResult'; // Import NoResult component

import { FETCH_ORG_ACTIVITIES_API } from '../../services/api';
import {
    antIconSync,
    formatActivitiesDate,
    timeAgo,
    getActivitiesInitialLetter,
    notifyWithIcon,
    request,
} from '../../services/utilities';
import Spin from 'antd/es/spin';

const Activities = () => {
    const [loaded, setLoaded] = useState(false);
    const [activitiesData, setActivitiesData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('add'); // new state for modal type
    const [currentActivity, setCurrentActivity] = useState(null); // state to hold current activity data
    const [loadError, setLoadError] = useState(''); // Track load errors

    const navigate = useNavigate();
    const params = useParams();

    const fetchActivitiesDetails = useCallback(async Id => {
        try {
            const rs = await request(FETCH_ORG_ACTIVITIES_API.replace(':id', Id));
            setActivitiesData(rs.activities);
        } catch (error) {
            setLoadError(error.message);
        }
    }, []);

    useEffect(() => {
        if (!loaded) {
            fetchActivitiesDetails(params.id)
                .then(_ => setLoaded(true))
                .catch(e => {
                    notifyWithIcon('error', e.message);
                    navigate('/not-found');
                });
        }
    }, [fetchActivitiesDetails, loaded, navigate, params.id]);

    // Function to add a new activity
    const addActivity = () => {
        document.body.classList.add('modal-open');
        setCurrentActivity(null); // No data means it's for adding
        setModalType('add');
        setShowModal(true);
    };

    // Function to edit an existing activity
    const editActivity = item => {
        document.body.classList.add('modal-open');
        setCurrentActivity(item); // Pass the selected activity data for editing
        setModalType('edit');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setCurrentActivity(null); // Reset the current activity data
        document.body.classList.remove('modal-open');
    };

    const refreshTable = async () => {
        await fetchActivitiesDetails(params.id);
    };

    return (
			<>
				<div className="card">
					<div className="card-body">
						<div className="d-flex align-items-center mb-2">
							<h5 className="card-title flex-grow-1 mb-0">Activities</h5>
							<div className="flex-shrink-0" onClick={addActivity}>
								<label htmlFor="formFile" className="btn btn-success">
									<i className="ri-add-fill me-1 align-bottom"></i> Add
								</label>
							</div>
						</div>

						<div className="row" style={{ background: '#f3f3f9' }}>
							<div className="col-lg-12">
								<div>
									<div className="timeline">
										{loaded ? (
											activitiesData && activitiesData.length > 0 ? (
												activitiesData.map((item, i) => (
													<div
														className={`timeline-item ${
															i % 2 === 0 ? 'left' : 'right'
														}`}
														key={i}>
														<i className="icon ri-stack-line"></i>
														<div className="date">
															{formatActivitiesDate(item.activity_date)}
														</div>
														<div className="content">
															<div className="d-flex">
																<div
																	className="flex-shrink-0 avatar-xs acitivity-avatar"
																	style={{ size: '20px' }}>
																	<div className="avatar-title bg-success-subtle text-success rounded-circle">
																		{getActivitiesInitialLetter(item)}
																	</div>
																</div>
																<div className="flex-grow-1 ms-3">
																	<h5 className="fs-15">
																		Title: {item.title || 'N/A'}{' '}
																	</h5>
																	<p className="text-muted mb-2">
																		Activity source:{' '}
																		{item.activity_type === 'poi'
																			? 'Person of Interest'
																			: item.activity_type === 'org'
																				? 'Organisation'
																				: 'None'}
																	</p>
																	<p className="text-muted mb-2">
																		Assessment: {item.comment || 'N/A'}
																	</p>
																	<p className="text-muted mb-2">
																		Activity source:{' '}
																		{item.activity_type === 'poi'
																			? 'Person of Interest'
																			: item.activity_type === 'org'
																				? 'Organisation'
																				: 'None'}
																	</p>
																	Created by: {item.created_by_name}{' '}
																	<small className="text-muted fs-13 fw-normal">
																		- {timeAgo(item.activity_date)}
																	</small>
																	<div className="mt-3 d-flex justify-content-end gap-2">
																		<button
																			className="btn btn-sm btn-outline-success"
																			onClick={() => editActivity(item)}>
																			Edit
																		</button>
																	</div>
																</div>
															</div>
														</div>
													</div>
												))
											) : (
												<NoResult title="Activities" /> // Display "No data found" when activitiesData is empty
											)
										) : (
											<div>
												<Spin spinning={true} indicator={antIconSync}>
													<div className="fetching" />
												</Spin>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* NewEditComment modal for both adding and editing */}
				<NewEditComment
					closeModal={closeModal}
					data={currentActivity} // Pass current activity for editing
					update={refreshTable}
					modalType={modalType} // Pass modal type (either 'add' or 'edit')
				/>
			</>
		);
};

export default Activities;
