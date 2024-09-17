import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { APP_SHORT_NAME, limit, paginate } from '../../services/constants';
import Breadcrumbs from '../../components/Breadcrumbs';
import AppPagination from '../../components/AppPagination';
import NoResult from '../../components/NoResult';
import ManageDesignation from '../../modals/ManageDesignation';
import TableWrapper from '../../container/TableWrapper';
import {
	confirmAction,
	notifyWithIcon,
	request,
} from '../../services/utilities';
import { useQuery } from '../../hooks/query';
import TitleSearchBar from '../../components/TitleSearchBar';
import { DeleteButton, EditButton } from '../../components/Buttons';
import {
	DELETE_DESIGNATION_API,
	FETCH_DESIGNATIONS_API,
} from '../../services/api';

const Designations = () => {
	document.title = `Designations - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);
	const [showModal, setShowModal] = useState(false);
	const [designation, setDesignation] = useState(false);

	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);

	const query = useQuery();

	const fetchDesignations = useCallback(async (per_page, page, q) => {
		try {
			const rs = await request(
				`${FETCH_DESIGNATIONS_API}?per_page=${per_page}&page=${page}&q=${q}`
			);
			const { designations, ...rest } = rs;
			setList(designations);
			setMeta({ ...rest, per_page });
		} catch (e) {
			notifyWithIcon(
				'error',
				e.message || 'error, could not fetch designations'
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

			fetchDesignations(_limit, _page, _search).then(_ => {
				setFetching(false);
				setPage(_page);
				setSearch(_search);
				setSearchTerm(_search);
				setQueryLimit(_limit);
			});
		}
	}, [fetchDesignations, fetching, page, query, queryLimit, search]);

	const addDesignation = () => {
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const editDesignation = item => {
		document.body.classList.add('modal-open');
		setDesignation(item);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setDesignation(null);
		document.body.classList.remove('modal-open');
	};

	const confirmRemove = item => {
		confirmAction(doRemove, item, 'You want to delete this designation');
	};

	const refreshTable = async () => {
		setFetching(true);
		const _limit = Number(query.get('entries_per_page') || limit);
		await fetchDesignations(_limit, 1, '');
	};

	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	const doRemove = async item => {
		try {
			setWorking(true);
			const config = { method: 'DELETE' };
			const uri = DELETE_DESIGNATION_API.replaceAll(':id', item.id);
			const rs = await request(uri, config);
			refreshTable();
			notifyWithIcon('success', rs.message);
			setWorking(false);
		} catch (e) {
			notifyWithIcon(
				'error',
				e.message || 'error, could not delete designation'
			);
			setWorking(false);
		}
	};

	return (
		<div className="container-fluid">
			<div className="row">
				<Breadcrumbs pageTitle="Designation" parentPage="Accounts" />
				<div className="row">
					<div className="col-lg-12">
						<div className="card">
							<TitleSearchBar
								title="Designations"
								onClick={() => addDesignation()}
								queryLimit={queryLimit}
								search={search}
								searchTerm={searchTerm}
								onChangeSearch={e => setSearchTerm(e.target.value)}
								hasCreateBtn={true}
								createBtnTitle="Add Designation"
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
														<td>{item.description}</td>
														<td className="text-end">
															<div className="hstack gap-3 flex-wrap text-end">
																<EditButton
																	onClick={() => editDesignation(item)}
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
											<NoResult title="Designations" />
										</div>
									)}
								</TableWrapper>
								<div className="d-flex justify-content-end mt-3">
									<AppPagination meta={meta} />
								</div>
							</div>
						</div>

						{showModal && (
							<ManageDesignation
								closeModal={() => closeModal()}
								designation={designation}
								update={async () => {
									await refreshTable().then(_ => setWorking(false));
								}}
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Designations;
