import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {APP_SHORT_NAME, deploymentTypes, limit, paginate, postingTypes} from '../../services/constants';
import Breadcrumbs from '../../components/Breadcrumbs';
import AppPagination from '../../components/AppPagination';
import NoResult from '../../components/NoResult';
import ManageEmployeePosting from '../../modals/ManageEmployeePosting';
import TableWrapper from '../../container/TableWrapper';
import {
	confirmAction,
	formatEmployeeName, formatFullName, formatGetInitialsName, getHashString, getQueryString,
	notifyWithIcon, parseHashString,
	request,
} from '../../services/utilities';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import { useQuery } from '../../hooks/query';
import {
	DeleteButton,
	EditButton,
	ViewButton,
	ViewButtonPosting,
	ViewLink,
	ViewPostingHistoryLink
} from '../../components/Buttons';
import TitleSearchBar from '../../components/TitleSearchBar';
import { MenuOutlined, SmileOutlined } from '@ant-design/icons';


import {
	DELETE_EMPLOYEE_POSTINGS_API,
	FETCH_EMPLOYEE_POSTINGS_API, FETCH_EMPLOYEES_API,
	FETCH_STATIONS_API,
	FILTER_EMPLOYEE_POSTINGS,
	FILTER_EMPLOYEE_POSTINGS_API,
	FILTER_EMPLOYEES_API,
} from '../../services/api';
import '../../assets/scss/posting.css'
import ManagePostingEvent from "../../modals/ManagePostingEvent";
import ViewPostingInfo from "../../modals/ViewPostingInfo";
import PostingFilter from "../../components/PostingFilter";
import {doClearFilter} from "../../redux/slices/employee";
import BulkUpload from "../../components/BulkUpload";

const Postings = () => {
	document.title = `Postings - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);
	const [showModal, setShowModal] = useState(false);
	const [showExtendModal, setShowExtendModal] = useState(false);
	const [showPostingInfo, setShowPostingInfo] = useState(false);
	const [selectedPosting, setSelectedPosting] = useState(null);
	const [showUploadModal, setShowUploadModal] = useState(false);
	const [action, setAction] = useState(null);

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

	const fetchPostings = useCallback(async (per_page, page, q,  filters='') => {
		try {

			const rs = await request(
				`${FETCH_EMPLOYEE_POSTINGS_API}?per_page=${per_page}&page=${page}&q=${q}${filters}`
			);

			const { postings, ...rest } = rs;

			setList(postings);
			setMeta({ ...rest, per_page });
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not fetch postings');
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

	const confirmRemove = item => {
		confirmAction(doRemove, item, 'You want to delete this posting');
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
			const uri = DELETE_EMPLOYEE_POSTINGS_API.replaceAll(':id', item.id);
			const rs = await request(uri, config);
			refreshTable();
			notifyWithIcon('success', rs.message);
			setWorking(false);
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not delete posting');
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
			<Breadcrumbs pageTitle="Postings" parentPage="Accounts" />
			<div className="row">
				<div className="col-lg-12">
					<div className="card">
						<TitleSearchBar
							title="Postings"
							onClick={() => addPosting()}
							onBulkUploadClick={() => bulkUpload()}
							queryLimit={queryLimit}
							search={search}
							searchTerm={searchTerm}
							onChangeSearch={e => setSearchTerm(e.target.value)}
							hasCreateBtn={true}
							createBtnTitle="Add Posting"
							hasFilter={true}
							openFilter={() => setIsFilterOpen(true)}
							filters={filters}
							onRemoveFilterTag={handleRemoveFilter}
							onClearFilterTag={handleClearFilters}
							hasUploadBtn={true}
							uploadBtnTitle="Bulk Upload"
							permissions={permissions}
						/>
						<div className="card-body">
							<TableWrapper
								className="table-responsive table-card"
								fetching={fetching}
								working={working}
							>
								<table className="table align-middle table-nowrap  table-hover">
									<thead className="table-light">
										<tr>
											<th className="text-uppercase">S/N</th>
											<th className="text-uppercase">EMPLOYEE</th>
											<th className="text-uppercase">REGION </th>
											<th className="text-uppercase">STATION</th>
											<th className="text-uppercase">TYPE</th>
											{/*<th className="text-uppercase">D.A.P</th>*/}
											<th className="text-uppercase">ASSUMPTION Date</th>
											<th className="text-uppercase">EXPECTED DATE OF ARRIVAL</th>
											<th className="text-uppercase">DATE OF RETURN</th>
											<th className="text-uppercase">DETAIL</th>


										</tr>
									</thead>
									<tbody className="list">
										{list.map((item, i) => {

											return (

												<tr key={item.id}>
													<td>{i + min}</td>
													<td><div className="d-flex align-items-center">
																							<div className="flex-shrink-0 me-2">
																								<div className="flex-shrink-0 avatar-sm">
																									{item.employee.photo?
																										<img src={item.employee.photo} alt="" className="avatar-sm p-0 rounded-circle"/>:
																									<span className="mini-stat-icon avatar-title rounded-circle text-secondary bg-secondary-subtle fs-4 text-uppercase">
																										{formatGetInitialsName(item.employee)}
																									</span>
																									}
																								</div>
																							</div>
																							<div>
																								<a href={`/employees/${item.employee.id}/view`} 	className="text-reset text-underline">
																								<h5 className="fs-14 my-1">

																									 {formatFullName(item.employee)}
																								</h5>
																								<span>{item.employee.pf_num}</span>
																									</a>
																							</div>
																						</div>
													</td>
													<td>{item.region.name}</td>
													<td>{item.station.name}</td>
													<td>
														{
															item.posting_type && item.posting_type!==4?
																<span className={`badge badge-label ${item.posting_type === 1 || item.posting_type === 3 ? 'bg-info' : 'bg-success'}`}>
																		{postingTypes.find(type => type.id === item.posting_type).name}

																</span>:item.date_of_return?"":<span className="badge badge-label bg-success">
																		on-going
																</span>
														}

														<span className={`badge badge-label ${item.date_of_return? 'bg-danger' : ''}`}>
															{item.date_of_return? `Ended`: ""}
														</span>
													</td>
													{/*<td>{item.designation_at_post}</td>*/}
													<td>{item.assumption_date}</td>
													<td>{item.expected_date_of_return}</td>
													<td>{item.date_of_return}</td>
													<td className="text-end">
														<div className="hstack gap-3 text-end">

															<ViewPostingHistoryLink to={`/employee-posting/${item.employee.id}`} />

															<div className="hstack gap-3 flex-wrap text-end">
																
																{item.is_extended===false && item.is_recall===false && item.posting_type!==4 && item.date_of_return==null?
															<Dropdown>
															  <Dropdown.Toggle variant="light" id="defaultDropdown" className="vertical-ellipsis-toggle">
															  </Dropdown.Toggle>

															  <Dropdown.Menu style={{ zIndex: 1000, position: 'fixed !important'}}>
																<Dropdown.Item className="text-success" onClick={() => editPosting(item)}> <i className="ri-edit-2-line" /> Edit</Dropdown.Item><Dropdown.Item onClick={()=> extendPosting(item)} className="text-primary"><i className="ri-clockwise-2-fill"/> Extend</Dropdown.Item>
																<Dropdown.Item  onClick={()=> crossPosting(item)} className="text-secondary"><i className="ri-git-branch-line"/> Cross post</Dropdown.Item>
																<Dropdown.Item  onClick={()=> recallPosting(item)} className="text-danger"><i className="ri-git-branch-line"/> Recall</Dropdown.Item>
																<Dropdown.Item onClick={()=> endPosting(item)} className="text-warning"><i className="ri-stop-circle-line"/> End posting</Dropdown.Item>
																{/*<Dropdown.Item className="text-danger" onClick={() => confirmRemove(item)}> <i className="ri-delete-bin-line" /> Delete</Dropdown.Item>*/}
															  </Dropdown.Menu>
															</Dropdown>:""}



														</div>

														</div>
													</td>


												</tr>
											);
										})}
									</tbody>
								</table>
								{list.length === 0 && (
									<div className="noresult py-5">
										<NoResult title="Postings" />
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
						<ManageEmployeePosting
							selectedPosting={selectedPosting}
							closeModal={() => closeModal()}
							update={async () => {
								await refreshTable().then(_ => setFetching(false));
							}}
						/>
					)}


					{showExtendModal && (
						<ManagePostingEvent
							action={action}
							selectedPosting={selectedPosting}
							closeModal={() => closeModal()}
							update={async () => {
								await refreshTable().then(_ => setFetching(false));
							}}
						/>
					)}

					{showPostingInfo && (
						<ViewPostingInfo
							action={action}
							selectedPosting={selectedPosting}
							closeModal={() => closeModal()}
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

export default Postings;
