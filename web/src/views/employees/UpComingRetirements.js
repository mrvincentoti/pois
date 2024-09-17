import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { APP_SHORT_NAME, limit, paginate } from '../../services/constants';
import Breadcrumbs from '../../components/Breadcrumbs';
import AppPagination from '../../components/AppPagination';
import NoResult from '../../components/NoResult';
import TableWrapper from '../../container/TableWrapper';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
	changeLimit,
	confirmAction,
	formatDate,
	formatFullName,
	formatGetInitialsName,
	getHashString,
	getQueryString,
	notifyWithIcon,
	parseHashString,
	request,
} from '../../services/utilities';
import { useQuery } from '../../hooks/query';
import TitleSearchBar from '../../components/TitleSearchBar';
import { DeleteButton, EditLink, ViewLink } from '../../components/Buttons';
import EmployeeFilter from '../../components/EmployeeFilter';
import {
	DELETE_EMPLOYEE_API,
	FETCH_EMPLOYEE_RETIRING_SOON_API,
	DELETE_EMPLOYEE_AWARD_API,
	FETCH_EMPLOYEE_POSTINGS_API,
	FETCH_EMPLOYEES_API,
	FILTER_EMPLOYEES_API,
} from '../../services/api';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Space, Tag } from 'antd';
import RetiredEmployeeFilter from '../../components/RetiredEmployeeFilter';
import { doClearFilter } from '../../redux/slices/employee';

const UpComingRetirements = () => {
	document.title = `Profiles - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);

	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [filter, setFilter] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);
	const [filters, setFilters] = useState(null);
	const [filterQuery, setFilterQuery] = useState('');

	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const query = useQuery();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();

	const fetchProfiles = useCallback(async (per_page, page, q, filters = '') => {
		try {
			const rs = await request(
				`${FETCH_EMPLOYEE_RETIRING_SOON_API}?per_page=${per_page}&page=${page}&employment_status=1&q=${q}${filters}`
			);

			const { employees, ...rest } = rs;
			setList(employees);

			setMeta({ ...rest, per_page });
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not fetch employees');
		}
	}, []);

	const confirmRemove = item => {
		confirmAction(doRemove, item, 'You want to deactivate this employee;');
	};

	const doRemove = async item => {
		try {
			setWorking(true);
			const config = { method: 'DELETE' };
			const uri = DELETE_EMPLOYEE_API.replaceAll(':id', item.id);
			const rs = await request(uri, config);
			refreshTable();
			notifyWithIcon('success', rs.message);
			setWorking(false);
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not delete awards');
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
		await fetchProfiles(_limit, 1, '', _filterQuery);
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

			fetchProfiles(_limit, _page, _search, _filterQuery).then(_ => {
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
		fetchProfiles,
		fetching,
		filterQuery,
		location.hash,
		page,
		query,
		queryLimit,
		search,
	]);

	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	return (
		<>
			<div className="container-fluid">
				<Breadcrumbs pageTitle="Up Coming Retirements" parentPage="Employees" />
				<div className="row">
					<div className="col-lg-12">
						<div className="card">
							<TitleSearchBar
								title="List of Up-Coming Retirees"
								queryLimit={queryLimit}
								search={search}
								searchTerm={searchTerm}
								onChangeSearch={e => setSearchTerm(e.target.value)}
								createBtnTitle="Add Employee"
								hasCreateLink={false}
								linkTo="/employees/new"
								hasFilter={true}
								openFilter={() => setIsFilterOpen(true)}
								filters={filters}
								onRemoveFilterTag={handleRemoveFilter}
								onClearFilterTag={handleClearFilters}
							/>
							<div className="card-body">
								<TableWrapper
									className="table-responsive table-card"
									fetching={fetching}
									working={working}
								>
									<table className="table align-middle table-nowrap">
										<thead className="table-light">
											<tr>
												<th>S/N</th>
												<th>EMPLOYEE</th>
												<th>RANK</th>
												<th>DIRECTORATE</th>
												<th>DEPARTMENT</th>
												<th>DATE OF RETIREMENT</th>
											</tr>
										</thead>
										<tbody className="list">
											{list.map((item, i) => {
												return (
													<tr key={i}>
														<td>{i + min}</td>
														{/* <td>
															<div className="d-flex gap-2 align-items-center">
																<div className="flex-shrink-0">
																	{item.photo ? (
																		<img
																			src={item.photo}
																			alt=""
																			className="avatar-xs rounded-circle"
																		/>
																	) : (
																		<div className="avatar-xs">
																			<div className="avatar-title rounded-circle bg-light text-primary text-uppercase ">
																				{formatGetInitialsName(item)}
																			</div>
																		</div>
																	)}
																</div>
																<div className="flex-grow-1">{item.pf_num}</div>
															</div>
														</td> */}
														<td>
															<div className="d-flex align-items-center">
																<div className="flex-shrink-0 me-2">
																	<div className="flex-shrink-0 avatar-sm">
																		{item.photo ? (
																			<img
																				src={item.photo}
																				alt=""
																				className="avatar-sm p-0 rounded-circle"
																			/>
																		) : (
																			<span className="mini-stat-icon avatar-title rounded-circle text-secondary bg-secondary-subtle fs-4 text-uppercase">
																				{formatGetInitialsName(item)}
																			</span>
																		)}
																	</div>
																</div>
																<div>
																	<a
																		href={`/employees/${item.id}/view`}
																		className="text-reset text-underline"
																	>
																		<h5 className="fs-14 my-1">
																			{formatFullName(item)}
																		</h5>
																		<span>{item.pf_num}</span>
																	</a>
																</div>
															</div>
														</td>

														<td>{item.rank?.name || '--'}</td>
														<td>{item.directorate?.name || '--'}</td>
														<td>{item.department?.name || '--'}</td>
														{/* <td>{formatDate(item.date_of_employment)}</td> */}
														<td>{formatDate(item.retirement_date)}</td>
														{/* <td className="text-end">
															<div className="hstack gap-3 flex-wrap text-end">
																<ViewLink to={`/employees/${item.id}/view`} />
																<EditLink to={`/employees/${item.id}/edit`} />
																<DeleteButton
																	onClick={() => confirmRemove(item)}
																/>
															</div>
														</td> */}
													</tr>
												);
											})}
										</tbody>
									</table>
									{list.length === 0 && (
										<div className="noresult py-5">
											<NoResult title="Employees" />
										</div>
									)}
								</TableWrapper>
								<div className="d-flex justify-content-end mt-3">
									<AppPagination meta={meta} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<RetiredEmployeeFilter
				filters={filters}
				onFilter={handleFilter}
				show={isFilterOpen}
				onCloseClick={handleCloseFilter}
				onClearFilter={handleClearFilters}
			/>
		</>
	);
};

export default UpComingRetirements;
