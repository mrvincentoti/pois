import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
	APP_SHORT_NAME,
	deploymentTypes,
	limit,
	paginate,
	postingTypes,
	trainingCategory
} from '../../services/constants';
import Breadcrumbs from '../../components/Breadcrumbs';
import AppPagination from '../../components/AppPagination';
import NoResult from '../../components/NoResult';
import ManageEmployeePosting from '../../modals/ManageEmployeePosting';
import TableWrapper from '../../container/TableWrapper';
import {
	confirmAction, dateChecker, formatDateWord,
	formatEmployeeName, formatFullName, formatGetInitialsName, getHashString, getQueryString,
	notifyWithIcon, parseHashString,
	request,
} from '../../services/utilities';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import { useQuery } from '../../hooks/query';
import {DeleteButton, EditButton, ViewButton, ViewButtonPosting, ViewListLink} from '../../components/Buttons';
import TitleSearchBar from '../../components/TitleSearchBar';
import { MenuOutlined, SmileOutlined } from '@ant-design/icons';


import {
	DELETE_EMPLOYEE_CONFERENCE_API,
	DELETE_EMPLOYEE_DEPLOYMENTS_API,
	DELETE_EMPLOYEE_POSTINGS_API, DELETE_EMPLOYEE_TRAINING_API, FETCH_EMPLOYEE_CONFERENCE_BY_EMPLOYEE_API,
	FETCH_EMPLOYEE_DEPLOYMENT_BY_EMPLOYEE_API,
	FETCH_EMPLOYEE_POSTINGS_API,
	FETCH_EMPLOYEE_POSTINGS_BY_EMPLOYEE_API,
	FETCH_EMPLOYEE_TRAINING_BY_EMPLOYEE_API,
	FETCH_EMPLOYEES_API,
	FETCH_STATIONS_API,
	FILTER_EMPLOYEE_POSTINGS,
	FILTER_EMPLOYEE_POSTINGS_API,
	FILTER_EMPLOYEES_API,
	GET_EMPLOYEE_API,
} from '../../services/api';
import '../../assets/scss/posting.css'
import ManagePostingEvent from "../../modals/ManagePostingEvent";
import ViewPostingInfo from "../../modals/ViewPostingInfo";
import PostingFilter from "../../components/PostingFilter";
import {doClearFilter} from "../../redux/slices/employee";
import BulkUpload from "../../components/BulkUpload";
import ManageEmployeesDependent from "../../modals/ManageEmployeesDependent";
import ManageEmployeesDeployment from "../../modals/ManageEmployeesDeployment";
import ManageEmployeeTraining from "../../modals/ManageEmployeeTraining";
import ManageEmployeeConference from "../../modals/ManageEmployeeConference";

const TrainingsProfile = () => {
	document.title = `Employee Conferences/Seminar History - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);
	const [showModal, setShowModal] = useState(false);
	const [showExtendModal, setShowExtendModal] = useState(false);
	const [showPostingInfo, setShowPostingInfo] = useState(false);
	const [selectedPosting, setSelectedPosting] = useState(null);
	const [conference, setConference] = useState(null);
	const [showUploadModal, setShowUploadModal] = useState(false);
	const [action, setAction] = useState(null);
	const [training, setTraining] = useState(null);
	const [employeeData, setEmployeeData] = useState(null);
	const [selectedDeployment, setSelectedDeployment] = useState(null);


	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);
	const [filters, setFilters] = useState(null);
	const [filterQuery, setFilterQuery] = useState('');

	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const query = useQuery();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const permissions = useSelector(state => state.user.permissions);

	const params = useParams();

	const fetchPostings = useCallback(async (per_page, page, q,  filters='') => {
		try {


			const rs = await request(FETCH_EMPLOYEE_CONFERENCE_BY_EMPLOYEE_API.replace(':id', params.id));

			const { emp_conferences, ...rest } = rs;

			setList(emp_conferences);
			setMeta({ ...rest, per_page });
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not fetch employee trainings');
		}
	}, []);

	const fetchEmployeeDetails = useCallback(async employeeId => {
		try {
			const rs = await request(GET_EMPLOYEE_API.replace(':id', employeeId));

			setEmployeeData(rs.employee);
		} catch (error) {
			throw error;
		}
	}, []);

	useEffect(() => {
		if (!loaded) {
			fetchEmployeeDetails(params.id)
				.then(_ => setLoaded(true))
				.catch(e => {
					notifyWithIcon('error', e.message);
					navigate('/not-found');
				});
		}
	}, [fetchEmployeeDetails, loaded, navigate, params.id]);



	useEffect(() => {
		const _page = Number(query.get('page') || 1);
		const _search = query.get('q') || '';
		const _limit = Number(query.get('entries_per_page') || limit);

		const _queryString = parseHashString(location.hash);
		const _filterQuery = _queryString
			? `&${new URLSearchParams(_queryString).toString()}`
			: '';


		if (
			fetching ||
			_page !== page ||
			_search !== search ||
			_limit !== queryLimit ||
			_filterQuery !== filterQuery
		) {
			if (_page !== page ||
				_search !== search ||
				_limit !== queryLimit ||
			    _filterQuery !== filterQuery) {
				setFetching(true);
			}

			fetchPostings(_limit, _page, _search, _filterQuery).then(_ => {
				setFetching(false);
				setPage(_page);
				setSearch(_search);
				setSearchTerm(_search);
				setQueryLimit(_limit);
				setFilters(_queryString);
				setFilterQuery(_filterQuery);
				if (_filterQuery === '') {
					dispatch(doClearFilter(true));
				}
			});
		}
	}, [
		dispatch,
		fetchPostings,
		fetching,
		filterQuery,
		location.hash,
		page,
		query,
		queryLimit,
		search]);

	const addPosting = () => {
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const editPosting = item => {
		setSelectedPosting(item);
		document.body.classList.add('modal-open');
		setShowModal(true);
		setShowExtendModal(false);
		setAction(item.posting_type);

	};

	const extendPosting = item => {
		setSelectedPosting(item);
		document.body.classList.add('modal-open');
		setShowExtendModal(true);
		setShowModal(false);
		setAction(1);
	};

	const crossPosting=item=>{
		setSelectedPosting(item);
		document.body.classList.add('modal-open');
		setShowExtendModal(true);
		setShowModal(false);
		setShowPostingInfo(false);
		setAction(3);
	}

	const recallPosting=item=>{
		setSelectedPosting(item);
		document.body.classList.add('modal-open');
		setShowExtendModal(true);
		setShowModal(false);
		setShowPostingInfo(false);
		setAction(2);
	}

	const endPosting=item=>{
		setSelectedPosting(item);
		document.body.classList.add('modal-open');
		setShowExtendModal(true);
		setShowModal(false);
		setShowPostingInfo(false);
		setAction(4);
	}


	const closeModal = () => {
		setSelectedPosting(null);
		setShowModal(false);
		setShowExtendModal(false);
		setShowPostingInfo(false);
		document.body.classList.remove('modal-open');
	};



	const editConference = item => {
		document.body.classList.add('modal-open');
		setConference(item);
		setShowModal(true);
	};
	const confirmRemove = item => {
		confirmAction(doRemove, item, 'You want to delete this seminar/conferences');
	};

	const editTraining = item => {
		document.body.classList.add('modal-open');
		setTraining(item);
		setShowModal(true);
	};

	const editDeployment = item => {
		setSelectedDeployment(item);
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const bulkUpload = () => {
		document.body.classList.add('modal-open');
		setShowUploadModal(true);
	};
	const showLog = item => {
		setSelectedPosting(item);
		document.body.classList.add('modal-open');
		setShowPostingInfo(true);
		setShowModal(false);
		setShowExtendModal(false);
	};

	const doRemove = async item => {
		try {
			setWorking(true);
			const config = { method: 'DELETE' };
			const uri = DELETE_EMPLOYEE_CONFERENCE_API.replaceAll(':id', item.id);
			const rs = await request(uri, config);
			refreshTable();
			notifyWithIcon('success', rs.message);
			setWorking(false);
		} catch (e) {
			notifyWithIcon(
				'error',
				e.message || 'error, could not delete conferences'
			);
			setWorking(false);
		}
	};


	const refreshTable = async () => {
		setFetching(true);
		const _limit = Number(query.get('entries_per_page') || limit);
		const _queryString = parseHashString(location.hash);
		const _filterQuery = _queryString
			? `&${new URLSearchParams(_queryString).toString()}`
			: '';
		await fetchPostings(_limit, 1, '', _filterQuery);
	};

	const handleFilter = filters => {
		const queryString = getQueryString(query);
		const qs = queryString !== '' ? `?${queryString}` : '';

		const _filterHashString = getHashString(filters);
		const _filterHash = _filterHashString !== '' ? `#${_filterHashString}` : '';

		navigate(`${location.pathname}${qs}${_filterHash}`);
	};


	const handleCloseFilter = useCallback(filters => {
		setIsFilterOpen(false);
	});

	const handleRemoveFilter = key => {
		const obj = { ...filters, [key]: undefined };
		const newFilters = Object.keys(obj).reduce((accumulator, key) => {
			if (obj[key] !== undefined) {
				accumulator[key] = obj[key];
			}

			return accumulator;
		}, {});
		handleFilter(newFilters);
	};


	const handleClearFilters = () => {
		const queryString = getQueryString(query);
		const qs = queryString !== '' ? `?${queryString}` : '';

		handleCloseFilter();
		navigate(`${location.pathname}${qs}`);
	};


	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);


	return (
		<>
		<div className="container-fluid">
			<Breadcrumbs pageTitle="Seminar/Conferences" parentPage="Accounts" />
			<div className="row">
				<div className="col-lg-12">
					<div className="card">
						<TitleSearchBar
							title={`Seminar/Conferences History - ${formatFullName(employeeData)}`}
							onClick={() => addPosting()}
							onBulkUploadClick={() => bulkUpload()}
							queryLimit={queryLimit}
							search={search}
							searchTerm={searchTerm}
							onChangeSearch={e => setSearchTerm(e.target.value)}
							hasBackLink={true}
							hasCreateLink={true}
							Profilelink={`/employees/${employeeData?.id}/view`}
							linkTo={`/employees/conferences`}
							createBtnTitle="Back to Seminar/Conferences"
							openFilter={() => setIsFilterOpen(true)}
							filters={filters}
							onRemoveFilterTag={handleRemoveFilter}
							onClearFilterTag={handleClearFilters}
							uploadBtnTitle="Bulk Upload"
							permissions={permissions}
						/>
						<div className="card-body">
							<TableWrapper
								className="table-responsive table-card"
								fetching={fetching}
								working={working}
							>
								<table className="table align-middle table-nowrap table-hover">
									<thead className="table-light">
										<tr>
											<th className="text-uppercase">S/N</th>
											<th className="text-uppercase">CONFERENCE</th>
											<th className="text-uppercase">DATE ATTENDED</th>
											<th className="text-uppercase">STATUS</th>
											<th className="text-uppercase">ACTIONS</th>
										</tr>
									</thead>
									<tbody className="list">
										{list.map((item, i) => {
											return (
												<tr key={item.id}>
													<td>{i + min}</td>

													<td>{item.conference.name}</td>
													<td>{formatDateWord(item.date_attended)}</td>
													<td>{item.deleted_at?"deleted":"active"}</td>
													<td className="text-end">
														<div className="hstack gap-3 flex-wrap text-end">
															<EditButton
																onClick={() => editConference(item)}
															/>
															<DeleteButton
																onClick={() => confirmRemove(item)}
															/>

														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
								{list.length === 0 && (
									<div className="noresult py-5">
										<NoResult title="conferences" />
									</div>
								)}
							</TableWrapper>
							<div className="d-flex justify-content-end mt-3">
								<AppPagination meta={meta} />
							</div>
						</div>
					</div>

					{showUploadModal && (
						<BulkUpload
							title={"postings"}
							closeModal={() => closeModal()}
						 	update={async () => {
								await refreshTable().then(_ => setWorking(false));
							}}
						/>
					)}


					{showModal && (
						<ManageEmployeeConference
							closeModal={() => closeModal()}
							employeeConference={conference}
							update={async () => {
								await refreshTable().then(_ => setFetching(false));
							}}
						/>
					)}



				</div>
			</div>
		</div>
		<PostingFilter
				filters={filters}
				onFilter={handleFilter}
				show={isFilterOpen}
				onCloseClick={handleCloseFilter}
				onClearFilter={handleClearFilters}
			/>


		</>
	);
};

export default TrainingsProfile;