import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'antd';
import DocumentMediaDropDown from '../../components/DocumentMediaDropDown';
import NewEditCrime from './NewEditCrime';
import AppPagination from '../../components/AppPagination';
import NoResult from '../../components/NoResult';
import ManageActivities from '../../modals/ManageActivities';
import ManageArmsRecovered from '../../modals/ManageArmsRecovered'; // Import the new modal for managing arms
import ManageCrimesMedia from '../../modals/ManageCrimesMedia'; // Import the new modal for managing media
import CrimeDetailsModal from './CrimeDetailsModal';
import NewEditComment from './NewEditComment';
import { FETCH_ACTIVITIES_API, GET_ACTIVITIES_API } from '../../services/api';
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
import { APP_SHORT_NAME, limit, paginate } from '../../services/constants';
import { useQuery } from '../../hooks/query';
import TitleSearchBar from '../../components/TitleSearchBar';

const Timeline = ({ refreshPoiData }) => {
	const [loaded, setLoaded] = useState(false);
	const [crimesData, setCrimesData] = useState([]);
	const [activitiesData, setActivitiesData] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [showArmsModal, setShowArmsModal] = useState(false); // State for Arms modal
	const [showNotesModal, setShowNotesModal] = useState(false);
	const [showMediaModal, setShowMediaModal] = useState(false); // State for Media modal
	const [working, setWorking] = useState(false);
	const [crimes, setCrimes] = useState(null);
	const [arms, setArms] = useState(null);
	const [notes, setNotes] = useState(null);
	const [loadError, setLoadError] = useState('');
	const [activities, setActivities] = useState(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);

	const [meta, setMeta] = useState(paginate);
	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);

	const navigate = useNavigate();
	const params = useParams();
	const query = useQuery();

	const [fetching, setFetching] = useState(true);

	const fetchActivityDetails = useCallback(async (id, per_page, page, q) => {
		try {
			const rs = await request(
				`${FETCH_ACTIVITIES_API.replace(':id', id)}?per_page=${per_page}&page=${page}&q=${q}`
			);
			const { activities, ...rest } = rs;
			setActivitiesData(activities);
			setMeta({ ...rest, per_page });
		} catch (error) {
			setLoadError(error.message);
		}
	}, []);

	useEffect(() => {
		const _page = Number(query.get('page') || 1);
		const _search = query.get('q') || '';
		const _limit = Number(query.get('entries_per_page') || limit);

		if (!loaded) {
			fetchActivityDetails(params.id);
			setLoaded(true);
		}
		if (
			fetching ||
			_page !== page ||
			_search !== search ||
			_limit !== queryLimit
		) {
			if (_page !== page || _search !== search || _limit !== queryLimit) {
				setFetching(true);
			}

			fetchActivityDetails(params.id, _limit, _page, _search).then(() => {
				setFetching(false);
				setPage(_page);
				setSearch(_search);
				setSearchTerm(_search);
				setQueryLimit(_limit);
			});
		}
	}, [
		fetchActivityDetails,
		fetching,
		loaded,
		params.id,
		page,
		query,
		queryLimit,
		search,
	]);

	const handleEditClick = id => {
		navigate(`/pois/${id}/edit`);
	};

	const addActivity = () => {
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const addArms = item => {
		if (item) {
			setActivities(item);
		} else {
			setActivities(null);
		}
		document.body.classList.add('modal-open');
		setShowArmsModal(true); // Open Arms modal
	};

	const addNotes = item => {
		if (item) {
			setActivities(item);
		} else {
			setActivities(null);
		}
		document.body.classList.add('modal-open');
		setShowNotesModal(true); // Open Notes modal
	};

	const addMedia = item => {
		if (item) {
			setActivities(item);
		} else {
			setActivities(null);
		}
		document.body.classList.add('modal-open');
		setShowMediaModal(true); // Open Media modal
	};

	const editActivity = item => {
		document.body.classList.add('modal-open');
		setActivities(item);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setActivities(null);
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
		const _limit = Number(query.get('entries_per_page') || limit);
		await fetchActivityDetails(params.id, _limit, 1, '');
		setWorking(false);
	};

	const showDetails = item => {
		setActivities(item);
		setShowDetailsModal(true);
		document.body.classList.add('modal-open');
	};

	const closeDetailsModal = () => {
		setShowDetailsModal(false);
		document.body.classList.remove('modal-open');
	};

	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	return (
		<>
			<div className="container-fluid no-printme mb-5">
				{loaded ? (
					<div className="card">
						<TitleSearchBar
							title="Activities"
							onClick={() => addActivity()}
							queryLimit={queryLimit}
							search={search}
							searchTerm={searchTerm}
							onChangeSearch={e => setSearchTerm(e.target.value)}
							hasCreateBtn={true}
							createBtnTitle="Add Activity"
						/>
						<div className="card-body">
							{/* <div className="d-flex align-items-center mb-4">
								<h5 className="card-title flex-grow-1 mb-0">Activities</h5>
								<div className="d-flex gap-2">
									<div onClick={addActivity}>
										<label htmlFor="formFile" className="btn btn-success">
											<i className="ri-add-fill me-1 align-bottom"></i> Add
											Activity
										</label>
									</div>
								</div>
							</div> */}
							{activitiesData.length > 0 ? (
								<div className="row">
									{activitiesData.map((item, i) => (
										<div key={i} className="col-xxl-4 col-sm-4">
											<div className="card profile-project-card shadow-none profile-project-warning">
												<div className="card-body p-4">
													<div className="d-flex">
														<div className="flex-grow-1 text-muted overflow-hidden">
															<h5 className="fs-14 text-truncate">
																<a href="#" className="text-body">
																	{item.activity_type || 'N/A'}
																</a>
															</h5>
															<p className="text-muted text-truncate mb-0">
																Activity Date:
																<span className="fw-semibold text-body">
																	{item.activity_date || 'N/A'}
																</span>
															</p>
															<p className="text-muted text-truncate mb-0">
																Comment:
																<span className="fw-semibold text-body">
																	{item.comment || 'N/A'}
																</span>
															</p>
															<p className="text-muted text-truncate mb-0">
																Items:
																<span className="fw-semibold text-body">
																	{item.items.map((item, index) => (
																		<span key={index}>
																			{item.item} ({item.qty})
																			{index !== item.items?.length - 1 && ', '}
																		</span>
																	))}
																</span>
															</p>
															<p className="text-muted text-truncate mb-0">
																Media Files:
																<span className="fw-semibold text-body">
																	{item.media_files.length > 0 ? 'Yes' : 'No'}
																</span>
															</p>
															{/* <p className="text-muted text-truncate mb-0">
																Nature of Attack:
																<span className="fw-semibold text-body">
																	{'N/A'}
																</span>
															</p> */}
															{/* <p className="text-muted text-truncate mb-0">
																Assessment:
																<span className="fw-semibold text-body">
																	{'N/A'}
																</span>
															</p> */}
														</div>
													</div>
													<div className="mt-3 d-flex justify-content-end gap-2">
														<button
															className="btn btn-sm btn-outline-secondary"
															onClick={() => editActivity(item)}
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
									title={
										loadError
											? 'Error Loading Activities'
											: 'No Activities Found'
									}
								/>
							)}
							<div className="d-flex justify-content-end mt-3">
								<AppPagination meta={meta} />
							</div>
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
				<ManageActivities
					closeModal={closeModal}
					activities={activities}
					update={async () => {
						await refreshTable();
						refreshPoiData(); // Refresh POI data after updating crimes
					}}
				/>
			)}
			{/* {showArmsModal && (
				<ManageArmsRecovered
					closeModal={closeArmsModal}
					armsRecovered={arms}
					activities={activities}
					update={async () => {
						await refreshTable();
						refreshPoiData(); // Refresh POI data after updating arms
					}}
				/>
			)} */}
			{/* {showNotesModal && (
				<NewEditComment
					closeModal={closeNotesModal}
					notes={notes}
					crimeCommitted={crimeCommitted}
					update={async () => {
						await refreshTable();
						refreshPoiData(); // Refresh POI data after updating notes
					}}
				/>
			)} */}
			{/* {showMediaModal && ( // Render Media Modal
				<ManageCrimesMedia
					id={params.id}
					closeModal={closeMediaModal}
					crimeCommitted={crimeCommitted}
					update={async () => {
						await refreshTable();
						refreshPoiData();
					}}
				/>
			)} */}
			{/* {showDetailsModal && (
				<CrimeDetailsModal
					id={params.id}
					closeModal={closeDetailsModal}
					crimeCommitted={crimeCommitted}
					update={async () => {
						await refreshTable();
						refreshPoiData();
					}}
				/>
			)} */}
		</>
	);
};

export default Timeline;
