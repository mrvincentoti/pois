import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
	APP_SHORT_NAME,
	limit,
	limits,
	paginate,
} from '../../../services/constants';
import Breadcrumbs from '../../../components/Breadcrumbs';
import data from '../../../common/data/employee-briefs.json';
import ManageEmployeeAward from '../../../modals/ManageEmployeeAward';
import ImportBrief from '../../../modals/ManageBrief';
import { useQuery } from '../../../hooks/query';
import { useDispatch } from 'react-redux';
import {
	briefStatus,
	calculateCompletionPercentage,
	changeLimit,
	confirmAction,
	doClearSearch,
	doSearch, formatDateTime, formatDateWord,
	formatEmployeeName,
	formatGetInitialsName,
	formatGetInitialsString,
	getHashString,
	getQueryString,
	notifyWithIcon,
	parseHashString,
	request,
} from '../../../services/utilities';
import {
	DELETE_EMPLOYEE_POSTINGS_API,
	DELETE_SINGLE_BRIEF_API,
	FETCH_CADRES_API,
	FETCH_EMPLOYEE_POSTINGS_API,
	FETCH_PROMOTION_BRIEFS_EMPLOYEE_API,
} from '../../../services/api';
import NoResult from '../../../components/NoResult';
import AppPagination from '../../../components/AppPagination';
import PostingFilter from '../../../components/PostingFilter';
import PromotionBriefFilter from '../../../components/PromotionBriefFilter';
import { doClearFilter } from '../../../redux/slices/employee';
import TitleSearchBar from '../../../components/TitleSearchBar';

const Briefs = () => {
	document.title = `Employee Promotion Briefs - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);
	const [showModal, setShowModal] = useState(false);
	const [selectedCadre, setSelectedCadre] = useState(null);
	const [linkDisabled, setLinkDisabled] = useState(false);
	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);

	const query = useQuery();
	const location = useLocation();
	const navigate = useNavigate();
	const [filters, setFilters] = useState(null);
	const [filterQuery, setFilterQuery] = useState('');

	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const dispatch = useDispatch();

	const fetchBriefs = useCallback(async (per_page, page, q, filters = '') => {
		try {
			const rs = await request(
				`${FETCH_PROMOTION_BRIEFS_EMPLOYEE_API}?per_page=${per_page}&page=${page}&q=${q}${filters}`
			);

			const { briefs, ...rest } = rs;

			setList(briefs);
			setMeta({ ...rest, per_page });
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not fetch briefs');
		}
	}, []);

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
			if (
				_page !== page ||
				_search !== search ||
				_limit !== queryLimit ||
				_filterQuery !== filterQuery
			) {
				setFetching(true);
			}

			fetchBriefs(_limit, _page, _search, _filterQuery).then(_ => {
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
		fetchBriefs,
		fetching,
		filterQuery,
		location.hash,
		page,
		query,
		queryLimit,
		search,
	]);

	const refreshTable = async () => {
		setFetching(true);
		const _limit = Number(query.get('entries_per_page') || limit);
		const _queryString = parseHashString(location.hash);
		const _filterQuery = _queryString
			? `&${new URLSearchParams(_queryString).toString()}`
			: '';
		await fetchBriefs(_limit, 1, '', _filterQuery);
	};

	const confirmRemove = item => {
		confirmAction(doRemove, item, 'You want to delete this brief');
	};

	const doRemove = async item => {
		try {
			setWorking(true);
			const config = { method: 'DELETE' };
			const uri = DELETE_SINGLE_BRIEF_API.replaceAll(':id', item.id);
			const rs = await request(uri, config);
			refreshTable();
			notifyWithIcon('success', rs.message);
			setWorking(false);
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not delete brief');
			setWorking(false);
		}
	};

	const closeModal = () => {
		setShowModal(false);
		document.body.classList.remove('modal-open');
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

	const importBrief = () => {
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	return (
		<>
			<div className="container-fluid">
				<div className="row">
					<Breadcrumbs
						pageTitle="Employee Promotion Briefs"
						parentPage="Promotions"
					/>
					<div className="row">
						<div className="col-lg-12">
							<div className="card" id="invoiceList">
								<TitleSearchBar
									title="Postings"
									onClick={() => importBrief()}
									queryLimit={queryLimit}
									search={search}
									searchTerm={searchTerm}
									onChangeSearch={e => setSearchTerm(e.target.value)}
									hasCreateBtn={true}
									createBtnTitle="Import"
									hasFilter={true}
									openFilter={() => setIsFilterOpen(true)}
									filters={filters}
									onRemoveFilterTag={handleRemoveFilter}
									onClearFilterTag={handleClearFilters}
								/>
							</div>
						</div>
					</div>

					<div className="row">
						{list?.map((item, key) => {
							return (
								<div key={item.id} className="col-xl-4">
									<div className="card">
										<div className="card-body">
											<button
												type="button"
												className="btn btn-icon btn-soft-success float-end"
												data-bs-toggle="button"
												aria-pressed="true"
											>
												PASS
											</button>

											<div className="avatar-sm mb-4">
												<div className="avatar-sm">
													<div className="avatar-title rounded-circle bg-light text-primary ">
														{item?.employee?.photo ? (
															<img
																src={item?.employee?.photo}
																style={{ width: '200px' }}
																alt="user-img"
																className="img-thumbnail rounded-circle "
															/>
														) : (
															formatGetInitialsName(item?.employee)
														)}
													</div>
												</div>
											</div>

											<Link
												to={`/employees/${item.employee?.id}/view`}
												className="text-underline"
											>
												<h5>
													{item.name ?? 'N/A'} - {item.employee?.pf_num ?? 'N/A'}
												</h5>
											</Link>

											<p className="text-muted">Rank - {item?.rank ?? 'N/A'}</p>

											<div className="d-flex gap-4 mb-3">
												<div>
													<i className="ri-map-pin-2-line text-primary me-1 align-bottom"></i>{' '}
													DOB - {formatDateWord(item?.dob) ?? 'N/A'}
												</div>

												<div>
													<i className="ri-time-line text-primary me-1 align-bottom"></i>{' '}
													AGE - {item?.age ?? 'N/A'}
												</div>
											</div>

											<p className="text-muted">
												<b>In-service Course Attended: </b>{' '}
												{item?.in_service_course_attended}
											</p>

											<div className="hstack gap-2 mb-1">
												<span className="badge bg-success-subtle text-success">
													CAPER SCORE - {item?.caper_score ?? 'N/A'}
												</span>
												<span className="badge bg-primary-subtle text-primary">
													EXAM SCORE - {item?.exam_score ?? 'N/A'}
												</span>
											</div>

											<div className="hstack gap-2">
												RECOMMENDED FOR PROMOTION
												<span
													className={`badge ${
														item?.recommendation === 'yes'
															? 'bg-primary-subtle text-primary'
															: 'bg-danger-subtle text-danger'
													} text-uppercase`}
												>
													{item?.recommendation ?? 'N/A'}
												</span>
											</div>
											<div className="hstack gap-2 mt-4">
												<span
													className={`badge ${
														calculateCompletionPercentage(item) === 100
															? 'bg-success'
															: 'bg-danger'
													}`}
												>
													Brief Completion status -{' '}
													{calculateCompletionPercentage(item).toFixed(2)}%
												</span>
											</div>

											<div className="hstack gap-2 mt-4">
												Status
												<span
													className={`badge ${
														item?.status === 1 ? 'bg-primary' : 'bg-danger'
													} bg-primary`}
												>
													{briefStatus(item?.status)}
												</span>
											</div>

											<div className="mt-4 hstack gap-2">
												<a
													className={`btn  ${
														item.status === 1 || item.status === 2
															? 'w-100 btn-secondary disabled'
															: 'btn-success'
													}`}
													href={`/employees/promotions/updatebrief/${item.id}`}
												>
													Update
												</a>
												<a
													className={`btn  ${
														item.status === 1 || item.status === 2
															? 'w-100 btn-secondary disabled'
															: 'btn-success'
													}`}
													onClick={() => confirmRemove(item)}
												>
													Delete
												</a>
												<a
													href={`/employees/promotions/briefs/${item.id}`}
													className="btn btn-soft-success w-100"
												>
													Overview
												</a>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>

					{list.length === 0 && (
						<div className="noresult py-5">
							<NoResult title="Briefs" />
						</div>
					)}

					<div className="d-flex justify-content-end mt-3">
						<AppPagination meta={meta} />
					</div>
				</div>

				{showModal && (
					<ImportBrief
						closeModal={() => closeModal()}
						update={async () => {
							await refreshTable().then(_ => setWorking(false));
						}}
					/>
				)}
			</div>
			<PromotionBriefFilter
				filters={filters}
				onFilter={handleFilter}
				show={isFilterOpen}
				onCloseClick={handleCloseFilter}
				onClearFilter={handleClearFilters}
			/>
		</>
	);
};

export default Briefs;
