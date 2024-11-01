import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_SHORT_NAME, limit, paginate } from '../../services/constants';
import Breadcrumbs from '../../components/Breadcrumbs';
import AppPagination from '../../components/AppPagination';
import NoResult from '../../components/NoResult';
import TableWrapper from '../../container/TableWrapper';
import {
	confirmAction,
	notifyWithIcon,
	request,
	formatDate,
} from '../../services/utilities';
import { useQuery } from '../../hooks/query';
import TitleSearchBar from '../../components/TitleSearchBar';
import { DeleteButton, EditButton } from '../../components/Buttons';
import {
	GET_ORGS_CAPACITIES_API,
	DELETE_ORGS_CAPACITIES_API,
} from '../../services/api';
import NewEditOpsCapacity from './NewEditOpsCapacity';

const OperationalCapacity = ({ refreshPoiData }) => {
	document.title = `Organisational Capacity - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);
	const [showModal, setShowModal] = useState(false);
	const [currentOrg, setCurrentOrg] = useState(null);
	const [modalType, setModalType] = useState('add');

	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);

	const params = useParams();
	const query = useQuery();

	const fetchOrgsCapacity = useCallback(
		async (per_page, page, q) => {
			try {
				const url = `${GET_ORGS_CAPACITIES_API}?per_page=${per_page}&page=${page}&q=${q}`;
				const rs = await request(url.replace(':id', params.id));
				const { capacities, message, ...rest } = rs;
				setList(capacities);
				setMeta({ ...rest, per_page });
			} catch (error) {
				// Handle error if needed
			}
		},
		[params.id]
	);

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

			fetchOrgsCapacity(_limit, _page, _search).then(() => {
				setFetching(false);
				setPage(_page);
				setSearch(_search);
				setSearchTerm(_search);
				setQueryLimit(_limit);
			});
		}
	}, [fetchOrgsCapacity, fetching, page, query, queryLimit, search]);

	const addOrg = () => {
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const editOrgsCapacity = item => {
		document.body.classList.add('modal-open');
		setCurrentOrg(item);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setCurrentOrg(null);
		document.body.classList.remove('modal-open');
	};

	const confirmRemove = item => {
		confirmAction(doRemove, item, 'You want to delete this org capacity');
	};

	const doRemove = async item => {
		try {
			setWorking(true);
			const config = { method: 'DELETE' };
			const uri = DELETE_ORGS_CAPACITIES_API.replaceAll(':id', item.id);
			const rs = await request(uri, config);

			// Remove the item from the list immediately
			setList(prevList => prevList.filter(org => org.id !== item.id));

			notifyWithIcon('success', rs.message);
			refreshPoiData(); // Refresh POI data after deleting

			setWorking(false);
		} catch (e) {
			notifyWithIcon('error', e.message || 'Error: could not delete org');
			setWorking(false);
		}
	};

	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	return (
		<div className="container-fluid">
			<div className="row">
				<div className="col-lg-12">
					<div className="card">
						<TitleSearchBar
							title="Operational Capacity"
							onClick={addOrg}
							queryLimit={queryLimit}
							search={search}
							searchTerm={searchTerm}
							onChangeSearch={e => setSearchTerm(e.target.value)}
							hasCreateBtn={true}
							createBtnTitle="Add"
						/>
						<div className="card-body">
							<TableWrapper
								className="table-responsive table-card"
								fetching={fetching}
								working={working}
							>
								<table className="table table-borderless align-middle mb-0">
									<thead className="table-light">
										<tr>
											<th scope="col">S/N</th>
											<th scope="col">Type</th>
											<th scope="col">Item</th>
											<th scope="col">Quantity</th>
											<th scope="col">Description</th>
											<th scope="col">Action</th>
										</tr>
									</thead>
									<tbody className="list">
										{list?.map((item, i) => (
											<tr key={i}>
												<td>{i + 1}</td>
												<td>
													<div className="d-flex align-items-left">
														<div className="flex-grow-1">
															<span
																className={`badge border text-${item.type_id === 1 ? 'success' : item.type_id === 2 ? 'danger' : 'secondary'} border-${item.type_id === 1 ? 'success' : item.type_id === 2 ? 'danger' : 'secondary'}`}
															>
																{item.type_id === 1
																	? 'Logistics'
																	: item.type_id === 2
																		? 'Firepower'
																		: 'Unknown'}
															</span>
														</div>
													</div>
												</td>
												<td>
													<div className="d-flex align-items-left">
														<div className="flex-grow-1">
															<h6 className="fs-15 mb-0">{item.item}</h6>
														</div>
													</div>
												</td>
												{/* <td>{item.arm.name}</td> */}
												<td>{item.qty}</td>
												<td>{item.description}</td>
												{/* <td>{formatDate(item.recovery_date) || '--'}</td> */}
												<td>
													<div className="hstack gap-3 flex-wrap text-end">
														<EditButton
															onClick={() => editOrgsCapacity(item)}
														/>
														<DeleteButton onClick={() => confirmRemove(item)} />
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
								{list.length === 0 && (
									<div className="noresult py-5">
										<NoResult title="No Oranisational Capacity" />
									</div>
								)}
							</TableWrapper>
							<div className="d-flex justify-content-end mt-3">
								<AppPagination meta={meta} />
							</div>
						</div>
					</div>

					{showModal && (
						<NewEditOpsCapacity
							closeModal={closeModal}
							data={currentOrg}
							update={async () => {
								await fetchOrgsCapacity(queryLimit, page, searchTerm);
								refreshPoiData(); // Refresh POI data after updating arms
							}}
							modalType={modalType}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default OperationalCapacity;
