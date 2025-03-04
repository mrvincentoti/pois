import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'antd';
import DocumentMediaDropDown from '../../components/DocumentMediaDropDown';
//import NewEditCrime from './NewEditCrime';
import AppPagination from '../../components/AppPagination';
import NoResult from '../../components/NoResult';
import ManageOrgActivities from '../../modals/ManageOrgActivities';
import ManageArmsRecovered from '../../modals/ManageArmsRecovered'; // Import the new modal for managing arms
import ManageCrimesMedia from '../../modals/ManageCrimesMedia'; // Import the new modal for managing media
//import CrimeDetailsModal from './CrimeDetailsModal';
import NewEditComment from './NewEditComment';
import {
	FETCH_ORG_ACTIVITIES_API,
	GET_ORG_ACTIVITIES_API,
} from '../../services/api';
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

import EditAttack from '../../modals/Organisation/EditAttack';
import EditProcurement from '../../modals/Organisation/EditProcurement';
import EditItemsCartedAway from '../../modals/Organisation/EditItemsCartedAway';
import EditPressRelease from '../../modals/Organisation/EditPressRelease';
import EditOthers from '../../modals/Organisation/EditOthers';
import ActivityDetails from '../../modals/ActivityDetails';

const Timeline = ({ refreshOrgData }) => {
	const [loaded, setLoaded] = useState(false);
	const [crimesData, setCrimesData] = useState([]);
	const [activitiesData, setActivitiesData] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [selectedActivity, setSelectedActivity] = useState(null);
	const [showArmsModal, setShowArmsModal] = useState(false); // State for Arms modal
	const [showNotesModal, setShowNotesModal] = useState(false);
	const [showMediaModal, setShowMediaModal] = useState(false); // State for Media modal
	const [working, setWorking] = useState(false);
	const [crimes, setCrimes] = useState(null);
	const [arms, setArms] = useState(null);
	const [notes, setNotes] = useState(null);
	const [loadError, setLoadError] = useState('');
	const [activities, setActivities] = useState(null);

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
				`${FETCH_ORG_ACTIVITIES_API.replace(':id', id)}?per_page=${per_page}&page=${page}&q=${q}`
			);
			const { activities, ...rest } = rs;
			setActivitiesData(activities);
			setMeta({ ...rest });
		} catch (error) {
			setLoadError(error.message);
		}
	}, []);

	useEffect(() => {
		const _page = Number(query.get('page') || 1);
		const _search = query.get('q') || '';
		const _limit = Number(query.get('entries_per_page') || limit);

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
		params.id,
		page,
		query,
		queryLimit,
		search,
	]);

	const handleEditClick = activity => {
		document.body.classList.add('modal-open');
		setSelectedActivity(activity);
		setShowEditModal(true);
	};

	const closeEditModal = () => {
		setShowEditModal(false);
		setSelectedActivity(null);
		document.body.classList.remove('modal-open');
	};

	const renderEditModal = () => {
		if (!selectedActivity || !showEditModal) return null;
		switch (selectedActivity.activity_type) {
			case 'Attack':
				return (
					<EditAttack
						visible={showEditModal}
						activity={selectedActivity}
						closeModal={closeEditModal}
					/>
				);
			case 'Procurement':
				return (
					<EditProcurement
						visible={showEditModal}
						activity={selectedActivity}
						closeModal={closeEditModal}
					/>
				);
			case 'Items Carted Away':
				return (
					<EditItemsCartedAway
						visible={showEditModal}
						activity={selectedActivity}
						closeModal={closeEditModal}
					/>
				);
			case 'Press Release':
				return (
					<EditPressRelease
						visible={showEditModal}
						activity={selectedActivity}
						closeModal={closeEditModal}
					/>
				);
			case 'Others':
				return (
					<EditOthers
						visible={showEditModal}
						activity={selectedActivity}
						closeModal={closeEditModal}
					/>
				);
			default:
				return null;
		}
	};

	const addActivity = () => {
		document.body.classList.add('modal-open');
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
		setSelectedActivity(item);
		setShowDetailsModal(true);
		document.body.classList.add('modal-open');
	};

	const closeDetailsModal = () => {
		setShowDetailsModal(false);
		setSelectedActivity(null);
		document.body.classList.remove('modal-open');
	};
	const renderDetailsModal = () => {
		if (!selectedActivity || !showDetailsModal) return null;

		return (
			<ActivityDetails
				visible={showDetailsModal}
				activity={selectedActivity}
				closeModal={closeDetailsModal}
			/>
		);
	};

	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	return (
		<>
			<div className="container-fluid no-printme mb-5">
				{fetching ? (
					<div>
						<Spin spinning={true} indicator={antIconSync}>
							<div className="fetching" />
						</Spin>
					</div>
				) : (
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
											<div className="card profile-project-card shadow-lg profile-project-dark">
												<div className="card-body p-4">
													<div className="d-flex">
														<div className="flex-grow-1 text-muted overflow-hidden">
															<h5 className="fs-14 text-truncate">
																<span
																	className={
																		item.type_id === 1
																			? 'bg-success text-light'
																			: item.type_id === 2
																				? ' bg-info text-light'
																				: item.type_id === 3
																					? 'bg-danger text-light'
																					: item.type_id === 4
																						? 'bg-warning text-light'
																						: item.type_id === 5
																							? 'bg-secondary text-light'
																							: 'bg-dark text-light'
																	}
																	style={{
																		cursor: 'pointer',
																		borderStyle: 'solid',
																		borderWidth: '1px',
																		borderRadius: '5px',
																		padding: '5px 10px',
																		textDecoration: 'none',
																		display: 'inline-block',
																	}}>
																	{item.activity_type || 'N/A'}
																</span>
															</h5>

															<p className="text-muted text-truncate mb-0">
																Title:
																<span className="fw-semibold text-body p-2 text-success">
																	{item.title || 'N/A'}
																</span>
															</p>
															<p className="text-muted text-truncate mb-0">
																Location:
																<span className="fw-semibold text-body p-2">
																	{item.location || item.location_from || 'N/A'}
																</span>
															</p>
															<p className="text-muted text-truncate mb-0">
																Media Files:
																<span className="fw-semibold text-body p-2">
																	{item.media_files.length > 0 ? 'Yes' : 'No'}
																</span>
															</p>
															<p className="text-muted text-truncate mb-0">
																Activity Date:
																<span className="fw-semibold text-body p-2">
																	{item.activity_date
																		? new Date(
																				item.activity_date
																			).toLocaleDateString()
																		: 'N/A'}
																</span>
															</p>
															<p className="text-muted text-truncate mb-0">
																Source:
																<u>
																	<span className="fw-semibold text-body p-2">
																		{item.source || 'N/A'}
																	</span>
																</u>
															</p>
															<p className="text-muted text-truncate mb-0">
																Created by:
																<span className="fw-semibold text-body p-2">
																	{item.created_by_name || 'N/A'}
																</span>
															</p>
														</div>
													</div>
													<div className="mt-3 d-flex justify-content-end gap-2">
														<button
															className="btn btn-sm btn-outline-secondary"
															onClick={() => handleEditClick(item)}>
															Edit
														</button>
														<button
															className="btn btn-sm btn-success"
															onClick={() => showDetails(item)}>
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
				)}
			</div>
			{showModal && (
				<ManageOrgActivities
					closeModal={closeModal}
					activities={activities}
					update={async () => {
						await refreshTable();
						refreshOrgData();
					}}
				/>
			)}

			{renderEditModal()}
			{renderDetailsModal()}
		</>
	);
};

export default Timeline;
