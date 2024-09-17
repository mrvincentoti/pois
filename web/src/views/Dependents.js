import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
	APP_SHORT_NAME,
	dependentStatus,
	dependentTypes,
	limit,
	paginate,
} from './../services/constants';
import Breadcrumbs from '../components/Breadcrumbs';
import AppPagination from '../components/AppPagination';
import NoResult from '../components/NoResult';
import ManageEmployeesDependent from './../modals/ManageEmployeesDependent';
import TableWrapper from '../container/TableWrapper';
import {
	calculateAge,
	confirmAction, formatDateWord,
	formatEmployeeName,
	formatFullName,
	formatGetInitialsName,
	notifyWithIcon,
	request,
} from '../services/utilities';
import { useQuery } from '../hooks/query';
import {
	ViewLink,
	EditButton,
	ViewButton,
	ViewButtonPosting,
	ViewPostingHistoryLink,
	ViewListLink
} from '../components/Buttons';
import TitleSearchBar from '../components/TitleSearchBar';
import {
	// DELETE_EMPLOYEE_DEPENDENTS_API,
	FETCH_EMPLOYEE_DEPENDENTS_API,
} from '../services/api';
import bulkUpload from '../components/BulkUpload';
import BulkUpload from '../components/BulkUpload';
import ViewLog from "../modals/ViewLog";
import * as PropTypes from "prop-types";
import ViewDetail from "./employees/ViewDetail";

function ViewDetailList(props) {
	return null;
}

ViewDetailList.propTypes = {
	update: PropTypes.func,
	closeModal: PropTypes.func
};
const Dependents = () => {
	document.title = `Dependents - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);
	const [showModal, setShowModal] = useState(false);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [showUploadModal, setShowUploadModal] = useState(false);
	const [selectedDependent, setSelectedDependent] = useState(null);

	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);
	const permissions = useSelector(state => state.user.permissions);

	const query = useQuery();

	const fetchDependents = useCallback(async (per_page, page, q) => {
		try {
			const rs = await request(
				`${FETCH_EMPLOYEE_DEPENDENTS_API}?per_page=${per_page}&page=${page}&q=${q}`
			);

			const { employee_dependents, ...rest } = rs;
			setList(employee_dependents);
			setMeta({ ...rest, per_page });
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not fetch dependent');
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

			fetchDependents(_limit, _page, _search).then(_ => {
				setFetching(false);
				setPage(_page);
				setSearch(_search);
				setSearchTerm(_search);
				setQueryLimit(_limit);
			});
		}
	}, [fetchDependents, fetching, page, query, queryLimit, search]);

	const addDependent = () => {
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const editDependent = item => {
		setSelectedDependent(item);
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const showDetailList = item => {
		setSelectedDependent(item);
		document.body.classList.add('modal-open');
		setShowDetailsModal(true);
	};

	const closeModal = () => {
		setSelectedDependent(null);
		setShowModal(false);
		document.body.classList.remove('modal-open');
	};

	const bulkUpload = () => {
		document.body.classList.add('modal-open');
		setShowUploadModal(true);
	};

	const refreshTable = async () => {
		setFetching(true);
		const _limit = Number(query.get('entries_per_page') || limit);
		await fetchDependents(_limit, 1, '');
	};

	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="Dependants" parentPage="Employees" />
			<div className="row">
				<div className="col-lg-12">
					<div className="card">
						<TitleSearchBar
							title="Dependants"
							onClick={() => addDependent()}
							onBulkUploadClick={() => bulkUpload()}
							queryLimit={queryLimit}
							search={search}
							searchTerm={searchTerm}
							onChangeSearch={e => setSearchTerm(e.target.value)}
							hasCreateBtn={true}
							createBtnTitle="Add Dependent"
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
											<th className="text-uppercase"> NAME</th>
											<th className="text-uppercase"> TYPE</th>
											<th className="text-uppercase">RELATIONSHIP</th>
											<th className="text-uppercase">DOB</th>
											<th className="text-uppercase">STATUS</th>
											<th className="text-uppercase">AGE</th>
											<th className="text-uppercase">ACTIONS</th>
										</tr>
									</thead>
									<tbody className="list">
										{list.map((item, i) => {
											const status = dependentStatus.find(
												d => d.id === item.status
											);
											const type = dependentTypes.find(
												d => d.id === item.dependent_type
											);

											return (
												<tr key={item.id}>
													<td>{i + min}</td>
													<td>
														<div className="d-flex align-items-center">
															<div className="flex-shrink-0 me-2">
																<div className="flex-shrink-0 avatar-sm">
																	{item.employee.photo ? (
																		<img
																			src={item.employee.photo}
																			alt=""
																			className="avatar-sm p-0 rounded-circle"
																		/>
																	) : (
																		<span className="mini-stat-icon avatar-title rounded-circle text-secondary bg-secondary-subtle fs-4 text-uppercase">
																			{formatGetInitialsName(item.employee)}
																		</span>
																	)}
																</div>
															</div>
															<div>
																<a
																	href={`/employees/${item.employee.id}/view`}
																	className="text-reset text-underline"
																>
																	<h5 className="fs-14 my-1">
																		{formatFullName(item.employee)}
																	</h5>
																	<span>{item.employee.pf_num}</span>
																</a>
															</div>
														</div>
													</td>
													<td>{item.name}</td>
													<td>
														{item.dependent_type === 1 && (
															<span>{type?.name || ''}</span>
														)}
														{item.dependent_type === 2 && (
															<span>{type?.name || ''}</span>
														)}
													</td>
													<td>{item.relationship}</td>
													<td>{formatDateWord(item.date_of_birth)}</td>
													<td>
														{item.status === 0 && (
															<span className="badge bg-success">
																{status?.name || ''}
															</span>
														)}
														{item.status === 1 && (
															<span className="badge bg-secondary">
																{status?.name || ''}
															</span>
														)}
														{item.status === 2 && (
															<span className="badge bg-danger">
																{status?.name || ''}
															</span>
														)}
													</td>
													<td>
														{' '}
														<span
															className={`badge ${
																calculateAge(item?.date_of_birth) >18
																	? 'bg-danger'
																	: calculateAge(item?.date_of_birth) < 6
																	  ? 'bg-secondary'
																	  : 'bg-primary'
															}`}
														>
															{calculateAge(item?.date_of_birth)} years
														</span>
													</td>
													<td className="text-end">
														<div className="hstack gap-3 flex-wrap text-end">
															<ViewListLink to={`/dependents/${item.employee.id}`} />
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
								{list.length === 0 && (
									<div className="noresult py-5">
										<NoResult title="Dependents" />
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
							title={'dependant'}
							closeModal={() => closeModal()}
							update={async () => {
								await refreshTable().then(_ => setWorking(false));
							}}
						/>
					)}

					{showModal && (
						<ManageEmployeesDependent
							selectedDependent={selectedDependent}
							closeModal={() => closeModal()}
							update={async () => {
								await refreshTable().then(_ => setFetching(false));
							}}
						/>
					)}

					{showDetailsModal && (
						<ViewDetail
							selectedItem={selectedDependent}
							type={'dependant'}
							closeModal={() => closeModal()}
							update={async () => {
								await refreshTable().then(_ => setFetching(false));
							}}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default Dependents;
