import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { APP_SHORT_NAME, limit, paginate } from '../../services/constants';
import Breadcrumbs from '../../components/Breadcrumbs';
import AppPagination from '../../components/AppPagination';
import NoResult from '../../components/NoResult';
import TableWrapper from '../../container/TableWrapper';
import {
	confirmAction,
	formatDate,
	formatFullName,
	formatGetInitialsName,
	getHashString,
	getQueryString,
	notifyWithIcon,
	parseHashString,
	request,
	formatName,
	formatOrgName,
	formatUserName,
} from '../../services/utilities';
import { useQuery } from '../../hooks/query';
import TitleSearchBar from '../../components/TitleSearchBar';
import { EditLink, ViewLink } from '../../components/Buttons';
import { DELETE_POI_API, FETCH_ORG_API } from '../../services/api';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { doClearFilter } from '../../redux/slices/employee';
import ImportBrief from '../../modals/ManageBrief';
import BulkUpload from '../../components/BulkUpload';
import OrgTemplateFilter from '../../components/OrgTemplateFilter';

const Organisation = () => {
	document.title = `POI - ${APP_SHORT_NAME}`;

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

	const [categoryId, setCategoryId] = useState('');
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const query = useQuery();
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();
	const params = useParams();
	const permissions = useSelector(state => state.user.permissions);

	const fetchProfiles = useCallback(
		async (per_page, page, q, cid, filters = '') => {
			try {
				const rs = await request(
					`${FETCH_ORG_API}?per_page=${per_page}&page=${page}&q=${q}&category_id=${cid}${filters}`
				);
				const { orgs, ...rest } = rs;
				setList(orgs);
				setMeta({ ...rest, per_page });
			} catch (e) {
				notifyWithIcon('error', e.message || 'error, could not fetch pois');
			}
		},
		[]
	);

	useEffect(() => {
		const _page = Number(query.get('page') || 1);
		const _search = query.get('q') || '';
		const _limit = Number(query.get('entries_per_page') || limit);

		const _categoryId = params?.category;

		const _queryString = parseHashString(location.hash);
		const _filterQuery = _queryString
			? `&${new URLSearchParams(_queryString).toString()}`
			: '';

		if (
			fetching ||
			_page !== page ||
			_search !== search ||
			_limit !== queryLimit ||
			_categoryId !== categoryId ||
			_filterQuery !== filterQuery
		) {
			if (
				_page !== page ||
				_search !== search ||
				_limit !== queryLimit ||
				_categoryId !== categoryId ||
				_filterQuery !== filterQuery
			) {
				setFetching(true);
			}

			fetchProfiles(_limit, _page, _search, _categoryId, _filterQuery).then(
				_ => {
					setFetching(false);
					setPage(_page);
					setSearch(_search);
					setSearchTerm(_search);
					setCategoryId(_categoryId);
					setQueryLimit(_limit);
					setFilters(_queryString);
					setFilterQuery(_filterQuery);
					if (_filterQuery === '') {
						dispatch(doClearFilter(true));
					}
				}
			);
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
		params?.category,
	]);

	// eslint-disable-next-line no-unused-vars
	const confirmRemove = item => {
		confirmAction(doRemove, item, 'You want to deactivate this poi;');
	};

	const doRemove = async item => {
		try {
			setWorking(true);
			const config = { method: 'DELETE' };
			const uri = DELETE_POI_API.replaceAll(':id', item.id);
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
				<Breadcrumbs pageTitle="Organisation List" parentPage="Organisation" />
				<div className="row">
					<div className="col-lg-12">
						<div className="card">
							<TitleSearchBar
								title="Organisation"
								queryLimit={queryLimit}
								search={search}
								searchTerm={searchTerm}
								onChangeSearch={e => setSearchTerm(e.target.value)}
								createBtnTitle="Add"
								onClick={() => bulkUpload()}
								onBulkUploadClick={() => bulkUpload()}
								hasEmployeeCreate={true}
								hasUploadBtn={false}
								uploadBtnTitle="Bulk Upload"
								linkTo="/org/new"
								hasFilter={true}
								openFilter={() => setIsFilterOpen(true)}
								filters={filters}
								onRemoveFilterTag={handleRemoveFilter}
								onClearFilterTag={handleClearFilters}
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
												<th>S/N</th>
												<th>NAME</th>
												<th>LEADER</th>
												<th>ESTABLISHMENT DATE</th>
												<th>AFFILIATION</th>
												{/* <th>ORG SOURCE</th> */}
												<th>ADDED BY</th>
												<th>ACTIONS</th>
											</tr>
										</thead>
										<tbody className="list">
											{list.map((item, i) => {
												return (
													<tr key={i}>
														<td>{i + min}</td>

														<td>
															<div className="d-flex align-items-center">
																<div className="flex-shrink-0 me-2">
																	<div className="flex-shrink-0 avatar-sm">
																		{item.picture ? (
																			<img
																				src={item.picture}
																				alt=""
																				className="avatar-sm p-0 rounded-circle"
																			/>
																		) : (
																			<span className="mini-stat-icon avatar-title rounded-circle text-secondary bg-secondary-subtle fs-4 text-uppercase">
																				{formatName(item)}
																			</span>
																		)}
																	</div>
																</div>
																<div>
																	<a
																		href={`/org/${item.id}/view?tab=overview`}
																		className="text-reset text-underline"
																	>
																		<h5 className="fs-14 my-1">
																			{formatOrgName(item)}
																		</h5>
																		<span>{item.ref_numb}</span>
																	</a>
																</div>
															</div>
														</td>

														<td>{item.ceo || 'N/A'} </td>
														<td>
															{formatDate(item.date_of_registration) || 'N/A'}
														</td>
														<td>{item.affiliations?.name || 'N/A'}</td>
														{/* <td>{item.source?.name || 'N/A'}</td> */}
														<td>{formatUserName(item.user)}</td>
														<td className="text-end">
															<div className="hstack gap-3 flex-wrap text-end">
																<ViewLink
																	to={`/org/${item.id}/view?tab=overview`}
																/>
																<EditLink to={`/org/${item.id}/edit`} />
															</div>
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
									{list.length === 0 && (
										<div className="noresult py-5">
											<NoResult title="POIs" />
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
			<OrgTemplateFilter
				filters={filters}
				onFilter={handleFilter}
				onCloseClick={handleCloseFilter}
				onClearFilter={handleClearFilters}
				show={isFilterOpen}
			/>
		</>
	);
};

export default Organisation;
