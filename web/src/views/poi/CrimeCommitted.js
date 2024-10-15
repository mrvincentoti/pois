import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'antd';
import DocumentMediaDropDown from '../../components/DocumentMediaDropDown';
import NewEditCrime from './NewEditCrime';
import NoResult from '../../components/NoResult';
import ManageCrimes from '../../modals/ManageCrimes';
import ManageArmsRecovered from '../../modals/ManageArmsRecovered'; // Import the new modal for managing arms
import ManageCrimesMedia from '../../modals/ManageCrimesMedia'; // Import the new modal for managing media
import CrimeDetailsModal from './CrimeDetailsModal';
import NewEditComment from './NewEditComment';
import { GET_CRIMES_COMMITTED_API } from '../../services/api';
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

const CrimeCommitted = ({ refreshPoiData }) => {
	const [loaded, setLoaded] = useState(false);
	const [crimesData, setCrimesData] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [showArmsModal, setShowArmsModal] = useState(false); // State for Arms modal
	const [showNotesModal, setShowNotesModal] = useState(false);
	const [showMediaModal, setShowMediaModal] = useState(false); // State for Media modal
	const [working, setWorking] = useState(false);
	const [crimes, setCrimes] = useState(null);
	const [arms, setArms] = useState(null);
	const [notes, setNotes] = useState(null);
	const [loadError, setLoadError] = useState('');
	const [crimeCommitted, setCrimeCommitted] = useState(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);

	const navigate = useNavigate();
	const params = useParams();

	const fetchCrimesDetails = useCallback(async id => {
		try {
			const rs = await request(GET_CRIMES_COMMITTED_API.replace(':id', id));
			setCrimesData(rs.crimes_committed);
		} catch (error) {
			setLoadError(error.message);
		}
	}, []);

	useEffect(() => {
		if (!loaded) {
			fetchCrimesDetails(params.id);
			setLoaded(true);
		}
	}, [fetchCrimesDetails, loaded, params.id]);

	const handleEditClick = id => {
		navigate(`/pois/${id}/edit`);
	};

	const addCrimes = () => {
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const addArms = item => {
		if (item) {
			setCrimeCommitted(item);
		} else {
			setCrimeCommitted(null);
		}
		document.body.classList.add('modal-open');
		setShowArmsModal(true); // Open Arms modal
	};

	const addNotes = item => {
		if (item) {
			setCrimeCommitted(item);
		} else {
			setCrimeCommitted(null);
		}
		document.body.classList.add('modal-open');
		setShowNotesModal(true); // Open Notes modal
	};

	const addMedia = item => {
		if (item) {
			setCrimeCommitted(item);
		} else {
			setCrimeCommitted(null);
		}
		document.body.classList.add('modal-open');
		setShowMediaModal(true); // Open Media modal
	};

	const editCrimes = item => {
		document.body.classList.add('modal-open');
		setCrimes(item);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setCrimes(null);
		document.body.classList.remove('modal-open');
	};

	const closeArmsModal = () => {
		setShowArmsModal(false); // Close Arms modal
		document.body.classList.remove('modal-open');
	};

	const closeNotesModal = () => {
		setShowNotesModal(false); // Close notes modal
		document.body.classList.remove('modal-open');
	};

	const closeMediaModal = () => {
		setShowMediaModal(false); // Close Media modal
		document.body.classList.remove('modal-open');
	};

	const refreshTable = async () => {
		setWorking(true);
		await fetchCrimesDetails(params.id);
		setWorking(false);
	};

	const showDetails = item => {
		setCrimeCommitted(item);
		setShowDetailsModal(true);
		document.body.classList.add('modal-open');
	};

	const closeDetailsModal = () => {
		setShowDetailsModal(false);
		document.body.classList.remove('modal-open');
	};

	return (
		<>
			<div className="container-fluid no-printme mb-5">
				{loaded ? (
					<div className="card">
						<div className="card-body">
							<div className="d-flex align-items-center mb-4">
								<h5 className="card-title flex-grow-1 mb-0">Activities</h5>
								<div className="d-flex gap-2">
									<div onClick={addCrimes}>
										<label htmlFor="formFile" className="btn btn-success">
											<i className="ri-add-fill me-1 align-bottom"></i> Add
											Activity
										</label>
									</div>
								</div>
							</div>
							{crimesData.length > 0 ? (
								<div className="row">
									{crimesData.map((item, i) => (
										<div key={i} className="col-xxl-4 col-sm-4">
											<div className="card profile-project-card shadow-none profile-project-warning">
												<div className="card-body p-4">
													<div className="d-flex">
														<div className="flex-grow-1 text-muted overflow-hidden">
															<h5 className="fs-14 text-truncate">
																<a href="#" className="text-body">
																	{item.crime.name || 'N/A'}
																</a>
															</h5>
															<p className="text-muted text-truncate mb-0">
																Crime Date:
																<span className="fw-semibold text-body">
																	{item.crime_date || 'N/A'}
																</span>
															</p>
															<p className="text-muted text-truncate mb-0">
																Casualties Recorded:
																<span className="fw-semibold text-body">
																	{item.casualties_recorded || 'N/A'}
																</span>
															</p>
															<p className="text-muted text-truncate mb-0">
																Location:
																<span className="fw-semibold text-body">
																	{'N/A'}
																</span>
															</p>
															{/* <p className="text-muted text-truncate mb-0">
																Arresting Body:
																<span className="fw-semibold text-body">
																	{item.arresting_body?.name || 'N/A'}
																</span>
															</p> */}
															{/* <p className="text-muted text-truncate mb-0">
																Place Of Detention:
																<span className="fw-semibold text-body">
																	{item.place_of_detention || 'N/A'}
																</span>
															</p> */}
															<p className="text-muted text-truncate mb-0">
																Action Taken:
																<span className="fw-semibold text-body">
																	{item.action_taken || 'N/A'}
																</span>
															</p>
															<p className="text-muted text-truncate mb-0">
																Nature of Attack:
																<span className="fw-semibold text-body">
																	{'N/A'}
																</span>
															</p>
															<p className="text-muted text-truncate mb-0">
																Assessment:
																<span className="fw-semibold text-body">
																	{'N/A'}
																</span>
															</p>
														</div>
													</div>
													<div className="mt-3 d-flex justify-content-end gap-2">
														<button
															className="btn btn-sm btn-outline-secondary"
															onClick={() => editCrimes(item)}
														>
															Edit
														</button>
														<button
															className="btn btn-sm btn-outline-success"
															onClick={() => addNotes(item)}
														>
															Add Note
														</button>
														<button
															className="btn btn-sm btn-outline-warning"
															onClick={() => addMedia(item)}
														>
															Add Media
														</button>
														<button
															className="btn btn-sm btn-outline-primary"
															onClick={() => showDetails(item)}
														>
															Details
														</button>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<NoResult
									title={loadError ? 'Error Loading Crimes' : 'No Crimes Found'}
								/>
							)}
						</div>
					</div>
				) : (
					<div>
						<Spin spinning={true} indicator={antIconSync}>
							<div className="fetching" />
						</Spin>
					</div>
				)}
			</div>
			{showModal && (
				<ManageCrimes
					closeModal={closeModal}
					crimesCommitted={crimes}
					update={async () => {
						await refreshTable();
						refreshPoiData(); // Refresh POI data after updating crimes
					}}
				/>
			)}
			{showArmsModal && (
				<ManageArmsRecovered
					closeModal={closeArmsModal}
					armsRecovered={arms}
					crimeCommitted={crimeCommitted}
					update={async () => {
						await refreshTable();
						refreshPoiData(); // Refresh POI data after updating arms
					}}
				/>
			)}
			{showNotesModal && (
				<NewEditComment
					closeModal={closeNotesModal}
					notes={notes}
					crimeCommitted={crimeCommitted}
					update={async () => {
						await refreshTable();
						refreshPoiData(); // Refresh POI data after updating notes
					}}
				/>
			)}
			{showMediaModal && ( // Render Media Modal
				<ManageCrimesMedia
					id={params.id}
					closeModal={closeMediaModal}
					crimeCommitted={crimeCommitted}
					update={async () => {
						await refreshTable();
						refreshPoiData();
					}}
				/>
			)}
			{showDetailsModal && (
				<CrimeDetailsModal
					id={params.id}
					closeModal={closeDetailsModal}
					crimeCommitted={crimeCommitted}
					update={async () => {
						await refreshTable();
						refreshPoiData();
					}}
				/>
			)}
		</>
	);
};

export default CrimeCommitted;
