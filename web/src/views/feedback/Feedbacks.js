import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { APP_SHORT_NAME, limit, paginate } from '../../services/constants';
import Breadcrumbs from '../../components/Breadcrumbs';
import AppPagination from '../../components/AppPagination';
import NoResult from '../../components/NoResult';
import TableWrapper from '../../container/TableWrapper';
import {
	getHashString,
	getQueryString,
	notifyWithIcon,
	parseHashString,
	request,
	confirmAction,
} from '../../services/utilities';
import { useQuery } from '../../hooks/query';
import TitleSearchBar from '../../components/TitleSearchBar';
import { ViewLink, DeleteButton } from '../../components/Buttons';
import {
	DELETE_FEEDBACK_API,
	FETCH_FEEDBACK_API,
	UPDATE_FEEDBACK_API,
} from '../../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { doClearFilter } from '../../redux/slices/employee';
import BulkUpload from '../../components/BulkUpload';
import BriefTemplateFilter from '../../components/BriefTemplateFilter';

const Feedbacks = () => {
	document.title = `Feedback - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);
	const [showUploadModal, setShowUploadModal] = useState(false);

	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [filters, setFilters] = useState(null);
	const [filterQuery, setFilterQuery] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);

	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const query = useQuery();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const permissions = useSelector(state => state.user.permissions);

	const fetchFeedback = useCallback(async (per_page, page, q, filters = '') => {
		try {
			const rs = await request(
				`${FETCH_FEEDBACK_API}?per_page=${per_page}&page=${page}&q=${q}${filters}`
			);
			const { feedbacks, ...rest } = rs;
			setList(feedbacks);
			setMeta({ ...rest, per_page });
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not fetch feedback');
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

			fetchFeedback(_limit, _page, _search, _filterQuery).then(_ => {
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
	}, [dispatch, fetching, filterQuery, page, query, queryLimit, search]);

	const formatDate = dateString => {
		const date = new Date(dateString);
		const day = date.getDate();
		const suffix = day => {
			if (day > 3 && day < 21) return 'th';
			switch (day % 10) {
				case 1:
					return 'st';
				case 2:
					return 'nd';
				case 3:
					return 'rd';
				default:
					return 'th';
			}
		};

		const month = date.toLocaleString('en-US', { month: 'long' });
		const year = date.getFullYear();

		return `${day}${suffix(day)} ${month}, ${year}`;
	};

	const confirmRemove = item => {
		confirmAction(doRemove, item, 'You want to delete this feedback');
	};

	const doRemove = async item => {
		try {
			setWorking(true);
			const config = { method: 'DELETE' };
			const uri = DELETE_FEEDBACK_API.replaceAll(':id', item.id);
			const rs = await request(uri, config);
			refreshTable();
			notifyWithIcon('success', rs.message);
			setWorking(false);
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not delete item');
			setWorking(false);
		}
	};

	const confirmResolve = item => {
		confirmAction(doResolve, item, 'You want to resolve this feedback');
	};

	const doResolve = async item => {
		try {
			setWorking(true);
			const config = {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' }, 
				body: { status: 1 },
			};
			const uri = UPDATE_FEEDBACK_API.replaceAll(':id', item.id);
			const rs = await request(uri, config);
			refreshTable();
			notifyWithIcon('success', rs.message);
		} catch (e) {
			notifyWithIcon('error', e.message || 'Error: Could not resolve feedback');
		} finally {
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
		await fetchFeedback(_limit, 1, '', _filterQuery);
	};

	const handleFilter = filters => {
		const queryString = getQueryString(query);
		const qs = queryString !== '' ? `?${queryString}` : '';

		const _filterHashString = getHashString(filters);
		const _filterHash = _filterHashString !== '' ? `#${_filterHashString}` : '';

		navigate(`${location.pathname}${qs}${_filterHash}`);
	};

	const handleCloseFilter = () => {
		setIsFilterOpen(false);
	};

	const handleClearFilters = () => {
		const queryString = getQueryString(query);
		const qs = queryString !== '' ? `?${queryString}` : '';

		handleCloseFilter();

		navigate(`${location.pathname}${qs}`);
	};

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

	const bulkUpload = () => {
		document.body.classList.add('modal-open');
		setShowUploadModal(true);
	};

	const closeModal = () => {
		setShowUploadModal(false);
		document.body.classList.remove('modal-open');
	};

	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	return (
		<>
			<div className="container-fluid">
				<Breadcrumbs pageTitle="FEEDBACK" parentPage="Feedback" />
				<div className="row">
					<div className="col-lg-12">
						<div className="card">
							<TitleSearchBar
								title="Feedback"
								queryLimit={queryLimit}
								search={search}
								searchTerm={searchTerm}
								onChangeSearch={e => setSearchTerm(e.target.value)}
								createBtnTitle="Add Feedback"
								onClick={() => bulkUpload()}
								onBulkUploadClick={() => bulkUpload()}
								hasEmployeeCreate={false}
								linkTo="/send-feedback"
								hasFilter={false}
								openFilter={() => setIsFilterOpen(false)}
								filters={filters}
								onRemoveFilterTag={handleRemoveFilter}
								onClearFilterTag={handleClearFilters}
								permissions={permissions}
							/>
							<div className="card-body">
								<TableWrapper
									className="table-responsive table-card"
									fetching={fetching}
									working={working}>
									<table className="table align-middle table-nowrap table-hover">
										<thead className="table-light">
											<tr>
												<th>S/N</th>
												<th>NAME</th>
												<th>SUBJECT</th>
												<th>FEEDBACK</th>
												<th>STATUS</th>
												<th>DATE</th>
												<th>ACTIONS</th>
											</tr>
										</thead>
										<tbody className="list">
											{(list || []).map((item, i) => (
												<tr key={i}>
													<td>{i + min}</td>
													<td>
														<div className="d-flex align-items-center">
															<div>
																<a
																	href={`/feedback/${item.id}/view`}
																	className="text-reset text-underline">
																	<h5 className="fs-14 my-1">
																		{item.created_by_name
																			? item.created_by_name
																			: 'Anonymous'}
																	</h5>
																</a>
															</div>
														</div>
													</td>
													<td>{item.subject || 'No Subject'}</td>
													<td>
														{item.feedback
															? item.feedback.slice(0, 50) +
																(item.feedback.length > 50 ? '...' : '')
															: 'No Feedback'}
													</td>
													<td>
														<span
															className={`badge ${
																item.status === 1 ? 'bg-success' : 'bg-warning'
															}`}>
															{item.status === 1 ? 'Resolved' : 'Pending'}
														</span>
													</td>
													<td>
														{item.created_at
															? formatDate(item.created_at)
															: 'N/A'}
													</td>
													<td className="text-end">
														<div className="hstack gap-3 flex-wrap text-end">
															<ViewLink to={`/feedback/${item.id}/view`} />
															<button
																onClick={() => confirmRemove(item)}
																className="btn btn-icon text-muted btn-sm fs-18 dropdown"
																type="button"
																data-bs-toggle="dropdown"
																aria-expanded="false">
																<i
																	className="ri-delete-bin-line"
																	style={{ color: '#ff7f41' }}></i>
															</button>
															{item.status === 0 ? (
																<>
																	<button
																		onClick={() => confirmResolve(item)}
																		className="btn btn-icon text-muted btn-sm fs-18 dropdown"
																		type="button"
																		data-bs-toggle="dropdown"
																		aria-expanded="false">
																		<i className="ri-checkbox-circle-line text-success"></i>
																	</button>
																</>
															) : (
																<p className="text-muted"></p>
															)}
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
									{list?.length === 0 && (
										<div className="noresult py-5">
											<NoResult title="Feedback" />
										</div>
									)}
								</TableWrapper>
								<div className="d-flex justify-content-end mt-3">
									<AppPagination meta={meta} filters={filters} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{showUploadModal && (
				<BulkUpload
					title={'employee'}
					closeModal={() => closeModal()}
					update={async () => {
						await refreshTable().then(_ => setWorking(false));
					}}
				/>
			)}
			<BriefTemplateFilter
				filters={filters}
				onFilter={handleFilter}
				onCloseClick={handleCloseFilter}
				onClearFilter={handleClearFilters}
				show={isFilterOpen}
			/>
		</>
	);
};

export default Feedbacks;
