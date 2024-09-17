import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { APP_SHORT_NAME, limit, paginate } from '../../services/constants';
import Breadcrumbs from '../../components/Breadcrumbs';
import AppPagination from '../../components/AppPagination';
import NoResult from '../../components/NoResult';
import ManageEmployeeConference from '../../modals/ManageEmployeeConference';
import TableWrapper from '../../container/TableWrapper';
import {
	confirmAction, formatDateWord,
	formatEmployeeName, formatFullName, formatGetInitialsName,
	notifyWithIcon,
	request,
} from '../../services/utilities';
import { useQuery } from '../../hooks/query';
import {DeleteButton, EditButton, ViewListLink} from '../../components/Buttons';
import TitleSearchBar from '../../components/TitleSearchBar';
import { useDispatch, useSelector } from 'react-redux';
import {
	DELETE_EMPLOYEE_CONFERENCE_API,
	FETCH_EMPLOYEE_CONFERENCES_API,
} from '../../services/api';
import BulkUpload from "../../components/BulkUpload";

const Conferences = () => {
	document.title = `Seminars/Conferences - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);
	const [showModal, setShowModal] = useState(false);
	const [conference, setConference] = useState(null);
	const [showUploadModal, setShowUploadModal] = useState(false);


	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);

	const query = useQuery();
	const permissions = useSelector(state => state.user.permissions);

	const fetchConferences = useCallback(async (per_page, page, q) => {
		try {
			const rs = await request(
				`${FETCH_EMPLOYEE_CONFERENCES_API}?per_page=${per_page}&page=${page}&q=${q}`
			);
			const { conferences, ...rest } = rs;
			setList(conferences);
			setMeta({ ...rest, per_page });
		} catch (e) {
			notifyWithIcon(
				'error',
				e.message || 'error, could not fetch conferences'
			);
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

			fetchConferences(_limit, _page, _search).then(_ => {
				setFetching(false);
				setPage(_page);
				setSearch(_search);
				setSearchTerm(_search);
				setQueryLimit(_limit);
			});
		}
	}, [fetchConferences, fetching, page, query, queryLimit, search]);

	const addConference = () => {
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const editConference = item => {
		document.body.classList.add('modal-open');
		setConference(item);
		setShowModal(true);
	};

	const closeModal = () => {
		setConference(null);
		setShowModal(false);
		document.body.classList.remove('modal-open');
	};

	const confirmRemove = item => {
		confirmAction(doRemove, item, 'You want to delete this conference');
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

	const bulkUpload = () => {
		document.body.classList.add('modal-open');
		setShowUploadModal(true);
	};

	const refreshTable = async () => {
		setFetching(true);
		const _limit = Number(query.get('entries_per_page') || limit);
		await fetchConferences(_limit, 1, '');
	};

	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="Seminars/Conferences" parentPage="Accounts" />
			<div className="row">
				<div className="col-lg-12">
					<div className="card">
						<TitleSearchBar
							title="Seminar / Conferences"
							onClick={() => addConference()}
							onBulkUploadClick={() => bulkUpload()}
							queryLimit={queryLimit}
							search={search}
							searchTerm={searchTerm}
							onChangeSearch={e => setSearchTerm(e.target.value)}
							hasCreateBtn={true}
							createBtnTitle="Add Seminar/Conference"
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
								<table className="table align-middle table-nowrap table-hover">
									<thead className="table-light">
										<tr>
											<th className="text-uppercase">S/N</th>
											<th className="text-uppercase">Employee</th>
											<th className="text-uppercase">Conference</th>
											<th className="text-uppercase">Date Attended</th>
											<th className="text-uppercase">Status</th>
											<th className="text-uppercase">Actions</th>
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
																						</div></td>
													<td>{item.conference.name}</td>
													<td>{formatDateWord(item.date_attended)}</td>
													<td>{item.deleted_at?"deleted":"active"}</td>
													<td className="text-end">
														<div className="hstack gap-3 flex-wrap text-end">
															<ViewListLink to={`/conferences/${item.employee.id}`} />
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
								{list.length === 0 && (
									<div className="noresult py-5">
										<NoResult title="Conferences" />
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
							title={"conferences"}
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
	);
};

export default Conferences;
