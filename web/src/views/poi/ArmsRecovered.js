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
	FETCH_ARMS_RECOVERED_API,
	DELETE_ARMS_RECOVERED_API,
} from '../../services/api';
import NewEditArms from './NewEditArms';

const ArmsRecovered = ({ refreshPoiData }) => {
	document.title = `Arms Recovered - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);
	const [showModal, setShowModal] = useState(false);
	const [currentArm, setCurrentArm] = useState(null);
	const [modalType, setModalType] = useState('add');

	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);

	const params = useParams();
	const query = useQuery();

	const fetchArmsRecovered = useCallback(
		async (per_page, page, q) => {
			try {
				const url = `${FETCH_ARMS_RECOVERED_API}?per_page=${per_page}&page=${page}&q=${q}`;
				const rs = await request(url.replace(':id', params.id));
				const { recovered_arms, message, ...rest } = rs;
				setList(recovered_arms);
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

			fetchArmsRecovered(_limit, _page, _search).then(() => {
				setFetching(false);
				setPage(_page);
				setSearch(_search);
				setSearchTerm(_search);
				setQueryLimit(_limit);
			});
		}
	}, [fetchArmsRecovered, fetching, page, query, queryLimit, search]);

	const addArm = () => {
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const editArmsRecovered = item => {
		document.body.classList.add('modal-open');
		setCurrentArm(item);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setCurrentArm(null);
		document.body.classList.remove('modal-open');
	};

	const confirmRemove = item => {
		confirmAction(doRemove, item, 'You want to delete this media');
	};

	const doRemove = async item => {
		try {
			setWorking(true);
			const config = { method: 'DELETE' };
			const uri = DELETE_ARMS_RECOVERED_API.replaceAll(':id', item.id);
			const rs = await request(uri, config);

			// Remove the item from the list immediately
			setList(prevList => prevList.filter(arm => arm.id !== item.id));

			notifyWithIcon('success', rs.message);
			refreshPoiData(); // Refresh POI data after deleting

			setWorking(false);
		} catch (e) {
			notifyWithIcon('error', e.message || 'Error: could not delete media');
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
							title="Arms Recovered"
							// onClick={addArm}
							queryLimit={queryLimit}
							search={search}
							searchTerm={searchTerm}
							onChangeSearch={e => setSearchTerm(e.target.value)}
							// hasCreateBtn={true}
							// createBtnTitle="Add"
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
											<th scope="col">Crime Committed</th>
											<th scope="col">Arm</th>
											<th scope="col">Number Recovered</th>
											<th scope="col">Location</th>
											<th scope="col">Recovery Date</th>
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
															<span className="badge border border-danger text-danger">{item.crime_committed}</span>
														</div>
													</div>
												</td>
												<td>
													<div className="d-flex align-items-left">
														<div className="flex-grow-1">
															<h6 className="fs-15 mb-0">{item.arm.name}</h6>
														</div>
													</div>
												</td>
												{/* <td>{item.arm.name}</td> */}
												<td>{item.number_recovered}</td>
												<td>{item.location || '--'}</td>
												<td>{formatDate(item.recovery_date) || '--'}</td>
												<td>
													<div className="hstack gap-3 flex-wrap text-end">
														<EditButton
															onClick={() => editArmsRecovered(item)}
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
										<NoResult title="No Arms Recovered" />
									</div>
								)}
							</TableWrapper>
							<div className="d-flex justify-content-end mt-3">
								<AppPagination meta={meta} />
							</div>
						</div>
					</div>

					{showModal && (
						<NewEditArms
							closeModal={closeModal}
							data={currentArm}
							update={async () => {
								await fetchArmsRecovered(queryLimit, page, searchTerm);
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

export default ArmsRecovered;
