import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';

import { APP_SHORT_NAME, limit, paginate } from '../../services/constants';
import Breadcrumbs from '../../components/Breadcrumbs';
import AppPagination from '../../components/AppPagination';
import NoResult from '../../components/NoResult';
import ManageRank from '../../modals/ManageRank';
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
	DELETE_RANK_API,
	FETCH_RANKS_API,
	IMPORT_RANKS_API,
} from '../../services/api';

const Ranks = () => {
	document.title = `Ranks - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);
	const [showModal, setShowModal] = useState(false);
	const [rank, setRank] = useState(null);

	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);

	const query = useQuery();
	const importRef = useRef(null);

	const fetchRanks = useCallback(async (per_page, page, q) => {
		try {
			const rs = await request(
				`${FETCH_RANKS_API}?per_page=${per_page}&page=${page}&q=${q}`
			);
			const { ranks, ...rest } = rs;
			setList(ranks);
			setMeta({ ...rest, per_page });
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not fetch ranks');
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

			fetchRanks(_limit, _page, _search).then(_ => {
				setFetching(false);
				setPage(_page);
				setSearch(_search);
				setSearchTerm(_search);
				setQueryLimit(_limit);
			});
		}
	}, [fetchRanks, fetching, page, query, queryLimit, search]);

	const addRank = () => {
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const editRank = item => {
		document.body.classList.add('modal-open');
		setRank(item);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setRank(null);
		document.body.classList.remove('modal-open');
	};

	const confirmRemove = item => {
		confirmAction(doRemove, item, 'You want to delete this rank');
	};

	const refreshTable = async () => {
		setWorking(true);
		const _limit = Number(query.get('entries_per_page') || limit);
		await fetchRanks(_limit, 1, '');
	};

	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	const doRemove = async item => {
		try {
			setWorking(true);
			const config = { method: 'DELETE' };
			const uri = DELETE_RANK_API.replaceAll(':id', item.id);
			const rs = await request(uri, config);
			refreshTable();
			notifyWithIcon('success', rs.message);
			setWorking(false);
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not delete rank');
			setWorking(false);
		}
	};

	const confirmImportFile = e => {
		confirmAction(onImportFile, e, 'Do you want to import ranks?', 'import');
	};

	const onImportFile = async e => {
		try {
			setWorking(true);
			const formData = new FormData();
			formData.append('file', e.target.files[0]);
			const config = { method: 'POST', body: formData, uploader: true };
			const rs = await request(IMPORT_RANKS_API, config);
			refreshTable();
			notifyWithIcon('success', rs.message);
			setWorking(false);
			importRef.current.value = null;
		} catch (e) {
			importRef.current.value = null;
			notifyWithIcon('error', e.message || 'error, could not import ranks');
			setWorking(false);
		}
	};

	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="Ranks" parentPage="Accounts" />
			<div className="row">
				<div className="col-lg-12">
					<div className="card">
						<TitleSearchBar
							title="Ranks"
							onClick={() => addRank()}
							queryLimit={queryLimit}
							search={search}
							searchTerm={searchTerm}
							onChangeSearch={e => setSearchTerm(e.target.value)}
							hasCreateBtn={true}
							createBtnTitle="Add Rank"
							hasImportBtn={true}
							importBtnTitle="import CSV"
							importRef={importRef}
							doImportAction={() => importRef.current.click()}
							onImportFile={confirmImportFile}
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
											<th>Level</th>
											<th>Cadre</th>
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
													<td>{item.level}</td>
													<td>{item.cadre.name}</td>
													<td>{item.description}</td>
													<td className="text-end">
														<div className="hstack gap-3 flex-wrap text-end">
															<EditButton onClick={() => editRank(item)} />
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
										<NoResult title="Ranks" />
									</div>
								)}
							</TableWrapper>
							<div className="d-flex justify-content-end mt-3">
								<AppPagination meta={meta} />
							</div>
						</div>
					</div>
					{showModal && (
						<ManageRank
							closeModal={() => closeModal()}
							rank={rank}
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

export default Ranks;
