import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { APP_SHORT_NAME, limit, paginate } from '../../services/constants';
import Breadcrumbs from '../../components/Breadcrumbs';
import AppPagination from '../../components/AppPagination';
import NoResult from '../../components/NoResult';
import ManageDepartment from '../../modals/ManageDepartment';
import TableWrapper from '../../container/TableWrapper';
import {
	confirmAction,
	notifyWithIcon,
	request,
} from '../../services/utilities';
import { useQuery } from '../../hooks/query';
import { DeleteButton, EditButton } from '../../components/Buttons';
import TitleSearchBar from '../../components/TitleSearchBar';
import {
	DELETE_DEPARTMENTS_API,
	FETCH_DEPARTMENTS_API,
} from '../../services/api';

const Departments = () => {
	document.title = `Departments - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);
	const [showModal, setShowModal] = useState(false);
	const [selectedDepartment, setSelectedDepartment] = useState(false);

	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);

	const query = useQuery();

	const fetchDepartments = useCallback(async (per_page, page, q) => {
		try {
			const rs = await request(
				`${FETCH_DEPARTMENTS_API}?per_page=${per_page}&page=${page}&q=${q}`
			);
			const { departments, ...rest } = rs;
			setList(departments);
			setMeta({ ...rest, per_page });
		} catch (e) {
			notifyWithIcon(
				'error',
				e.message || 'error, could not fetch departments'
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

			fetchDepartments(_limit, _page, _search).then(_ => {
				setFetching(false);
				setPage(_page);
				setSearch(_search);
				setSearchTerm(_search);
				setQueryLimit(_limit);
			});
		}
	}, [fetchDepartments, fetching, page, query, queryLimit, search]);

	const addDepartment = () => {
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const editDepartment = item => {
		setSelectedDepartment(item);
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setSelectedDepartment(null);
		document.body.classList.remove('modal-open');
	};

	const confirmRemove = item => {
		confirmAction(doRemove, item, 'You want to delete this department');
	};

	const doRemove = async item => {
		try {
			setWorking(true);
			const config = { method: 'DELETE' };
			const uri = DELETE_DEPARTMENTS_API.replaceAll(':id', item.id);
			const rs = await request(uri, config);
			refreshTable();
			notifyWithIcon('success', rs.message);
			setWorking(false);
		} catch (e) {
			notifyWithIcon(
				'error',
				e.message || 'error, could not delete department'
			);
			setWorking(false);
		}
	};

	const refreshTable = async () => {
		setWorking(true);
		const _limit = Number(query.get('entries_per_page') || limit);
		await fetchDepartments(_limit, 1, '');
	};

	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="Departments" parentPage="Accounts" />
			<div className="row">
				<div className="col-lg-12">
					<div className="card">
						<TitleSearchBar
							title="Departments"
							onClick={() => addDepartment()}
							queryLimit={queryLimit}
							search={search}
							searchTerm={searchTerm}
							onChangeSearch={e => setSearchTerm(e.target.value)}
							hasCreateBtn={true}
							createBtnTitle="Add Department"
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
											<th>Name</th>
											<th>Directorate</th>
											<th>Description</th>
											<th>Actions</th>
										</tr>
									</thead>
									<tbody className="list">
										{list.map((item, i) => {
											return (
												<tr key={item.id}>
													<td>{i + min}</td>
													<td>{item.name}</td>
													<td>{item.directorate.name}</td>
													<td>{item.description}</td>
													<td className="text-end">
														<div className="hstack gap-3 flex-wrap text-end">
															<EditButton
																onClick={() => editDepartment(item)}
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
										<NoResult title="Departments" />
									</div>
								)}
							</TableWrapper>
							<div className="d-flex justify-content-end mt-3">
								<AppPagination meta={meta} />
							</div>
						</div>
					</div>

					{showModal && (
						<ManageDepartment
							selectedDepartment={selectedDepartment}
							closeModal={() => closeModal()}
							update={async () => {
								await refreshTable().then(_ => setWorking(false));
							}}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default Departments;
