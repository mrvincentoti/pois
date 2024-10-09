import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
	notifyWithIcon,
	request,
	createHeaders,
	antIconSync,
	timeAgo,
	formatActivitiesDate,
	getActivitiesInitialLetter,
} from '../../services/utilities';
import {
	FETCH_ACTIVITIES_API,
	FETCH_CRIMES_API,
	UPDATE_MEDIA_API,
} from '../../services/api';
import { Button } from 'antd';
import Spin from 'antd/es/spin';
import NoResult from '../../components/NoResult';
import testMedia from '../../assets/images/users/avatar-1.jpg';
import NewEditComment from './NewEditComment'; // Import the comment editing modal

const CrimeDetailsModal = ({
	id,
	closeModal,
	update,
	media,
	crimeCommitted,
}) => {
	const [fileList, setFileList] = useState([]);
	const [uploading, setUploading] = useState(false);
	const [crime, setCrime] = useState(null);
	const [crimesOptions, setCrimesOptions] = useState([]);
	const [activitiesData, setActivitiesData] = useState(null);
	const [loaded, setLoaded] = useState(false);
	const params = useParams();
	const [currentActivity, setCurrentActivity] = useState(null); // State for current activity
	const [showModal, setShowModal] = useState(false); // State to control the edit modal

	useEffect(() => {
		loadCrimes();
		fetchActivitiesDetails(params.id);
	}, [params.id]);

	const loadCrimes = async () => {
		const rs = await request(FETCH_CRIMES_API);
		setCrimesOptions(rs?.crimes || []);
	};

	const fetchActivitiesDetails = useCallback(async id => {
		try {
			const rs = await request(FETCH_ACTIVITIES_API.replace(':id', id));
			setActivitiesData(rs.activities);
			setLoaded(true);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const editActivity = item => {
		setCurrentActivity(item); // Set the current activity for editing
		setShowModal(true); // Show the edit modal
	};

	const closeEditModal = () => {
		setShowModal(false);
		setCurrentActivity(null); // Reset the current activity data
	};

	return (
		<div
			className="modal fade bs-example-modal-lg show"
			tabIndex={-1}
			role="dialog"
			aria-modal="true"
			style={{ display: 'block', paddingLeft: 0 }}
		>
			<div className="modal-dialog modal-lg">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title" id="myLargeModalLabel">
							{crimeCommitted?.crime.name} - {crimeCommitted?.crime_date}
						</h5>
						<button type="button" className="btn-close" onClick={closeModal} />
					</div>
					<div className="modal-body">
						<h6 className="fs-15">Arms Recovered</h6>
						<table className="table table-bordered border-secondary">
							<thead>
								<tr>
									<th>Title</th>
									<th>Date</th>
									<th>Casualties</th>
									<th>Location</th>
									<th>Nature of Attack</th>
									<th>Action Taken</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>{crimeCommitted?.crime.name || 'N/A'}</td>
									<td>{crimeCommitted?.crime_date || 'N/A'}</td>
									<td>{crimeCommitted?.casualties_recorded || 'N/A'}</td>
									<td>{crimeCommitted?.location || 'N/A'}</td>
									<td>{crimeCommitted?.nature_of_attack || 'N/A'}</td>
									<td>{crimeCommitted?.action_taken || 'N/A'}</td>
								</tr>
							</tbody>
						</table>

						<h6 className="fs-16 my-3">Media</h6>
						<div className="gallery-container">
							<img
								className="gallery-img img-fluid mx-auto"
								src={testMedia}
								alt="Media"
							/>
							<h5 className="overlay-caption">Media Caption</h5>
						</div>

						<h6 className="fs-16 my-3">Activities</h6>
						<div className="timeline">
							{loaded ? (
								activitiesData && activitiesData.length > 0 ? (
									activitiesData.map((item, i) => (
										<div
											className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}
											key={i}
										>
											<i className="icon ri-stack-line"></i>
											<div className="date">
												{formatActivitiesDate(item.activity_date)}
											</div>
											<div className="content">
												<div className="d-flex">
													<div className="avatar-title bg-success-subtle text-success rounded-circle">
														{getActivitiesInitialLetter(item)}
													</div>
													<div className="flex-grow-1 ms-3">
														<h5 className="fs-15">
															{item.created_by_name} -{' '}
															{timeAgo(item.activity_date)}
														</h5>
														<p className="text-muted">{item.comment}</p>
														<button
															className="btn btn-sm btn-outline-success"
															onClick={() => editActivity(item)} // Trigger edit modal
														>
															Edit
														</button>
													</div>
												</div>
											</div>
										</div>
									))
								) : (
									<NoResult title="Activities" />
								)
							) : (
								<Spin spinning={true} indicator={antIconSync} />
							)}
						</div>
					</div>
					<div className="modal-footer">
						<button type="button" className="btn btn-link" onClick={closeModal}>
							Close
						</button>
					</div>
				</div>
			</div>

			{/* NewEditComment modal for editing */}
			{showModal && (
				<NewEditComment
					closeModal={closeEditModal}
					data={currentActivity} // Pass current activity for editing
					update={() => fetchActivitiesDetails(params.id)} // Update activities list after editing
					modalType="edit" // Indicate that this is an edit action
				/>
			)}
		</div>
	);
};

export default CrimeDetailsModal;
