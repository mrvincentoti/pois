import React, { useCallback, useEffect, useState } from 'react';

import { APP_SHORT_NAME, limit, paginate } from '../services/constants';
import Breadcrumbs from '../components/Breadcrumbs';
import AppPagination from '../components/AppPagination';
import NoResult from '../components/NoResult';
import ManageConference from '../modals/ManageConference';
import TableWrapper from '../container/TableWrapper';
import { confirmAction, notifyWithIcon, request } from '../services/utilities';
import { useQuery } from '../hooks/query';
import { DeleteButton, EditButton } from '../components/Buttons';
import TitleSearchBar from '../components/TitleSearchBar';
import { DELETE_CONFERENCE_API, FETCH_CONFERENCES_API } from '../services/api';

const Conferences = () => {
	document.title = `Conferences - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);
	const [showModal, setShowModal] = useState(false);
	const [conference, setConference] = useState(null);

	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);

	const query = useQuery();

	const fetchConferences = useCallback(async (per_page, page, q) => {
		try {
			const rs = await request(
				`${FETCH_CONFERENCES_API}?per_page=${per_page}&page=${page}&q=${q}`
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

	const confirmRemove = item => {
		confirmAction(doRemove, item, 'You want to delete this conference');
	};
	const doRemove = async item => {
		try {
			setWorking(true);
			const config = { method: 'DELETE' };
			const uri = DELETE_CONFERENCE_API.replaceAll(':id', item.id);
			const rs = await request(uri, config);
			refreshTable();
			notifyWithIcon('success', rs.message);
			setWorking(false);
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not delete sanctions');
			setWorking(false);
		}
	};

	const refreshTable = async () => {
		setWorking(true);
		const _limit = Number(query.get('entries_per_page') || limit);
		await fetchConferences(_limit, 1, '');
	};

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
		setShowModal(false);
		setConference(null);
		document.body.classList.remove('modal-open');
	};

	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="Conferences" parentPage="Setup" />
			<div className="row">
				<div className="col-lg-12">
					<div className="card">
						<TitleSearchBar
							title="Conferences"
							onClick={() => addConference()}
							queryLimit={queryLimit}
							search={search}
							searchTerm={searchTerm}
							onChangeSearch={e => setSearchTerm(e.target.value)}
							hasCreateBtn={true}
							createBtnTitle="Add Conference"
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
											<th>NAME</th>
											<th>DESCRIPTION</th>
											<th>ACTIONS</th>
										</tr>
									</thead>
									<tbody className="list">
										{list.map((item, i) => {
											return (
												<tr key={item.id}>
													<td>{i + 1}</td>
													<td>{item.name}</td>
													<td>{item.description}</td>
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
										<NoResult title="Conferences" />
									</div>
								)}
							</TableWrapper>
							<div className="align-items-center mt-2 g-3 text-center text-sm-start row">
								<AppPagination meta={meta} />
							</div>
						</div>
					</div>

					{showModal && (
						<ManageConference
							closeModal={() => closeModal()}
							conference={conference}
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

export default Conferences;
