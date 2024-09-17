import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
	APP_SHORT_NAME,
	limit,
	paginate,
	trainingCategory,
} from '../../services/constants';
import Breadcrumbs from '../../components/Breadcrumbs';
import AppPagination from '../../components/AppPagination';
import NoResult from '../../components/NoResult';
import ManageEmployeeTraining from '../../modals/ManageEmployeeTraining';
import TableWrapper from '../../container/TableWrapper';
import {
	confirmAction,
	formatEmployeeName, formatFullName, formatGetInitialsName,
	notifyWithIcon,
	request,
} from '../../services/utilities';
import { useQuery } from '../../hooks/query';
import { useDispatch, useSelector } from 'react-redux';
import {DeleteButton, EditButton, ViewListLink} from '../../components/Buttons';
import TitleSearchBar from '../../components/TitleSearchBar';
import {
	DELETE_EMPLOYEE_TRAINING_API,
	FETCH_EMPLOYEE_TRAININGS_API,
} from '../../services/api';
import BulkUpload from "../../components/BulkUpload";

const Trainings = () => {
	document.title = `Trainings - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);
	const [showModal, setShowModal] = useState(false);
	const [training, setTraining] = useState(null);
	const [showUploadModal, setShowUploadModal] = useState(false);


	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);

	const query = useQuery();
	const permissions = useSelector(state => state.user.permissions);

	const fetchTrainings = useCallback(async (per_page, page, q) => {
		try {
			const rs = await request(
				`${FETCH_EMPLOYEE_TRAININGS_API}?per_page=${per_page}&page=${page}&q=${q}`
			);
			const { employee_trainings, ...rest } = rs;
			setList(employee_trainings);

			setMeta({ ...rest, per_page });
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not fetch trainings');
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

			fetchTrainings(_limit, _page, _search).then(_ => {
				setFetching(false);
				setPage(_page);
				setSearch(_search);
				setSearchTerm(_search);
				setQueryLimit(_limit);
			});
		}
	}, [fetchTrainings, fetching, page, query, queryLimit, search]);

	const addTraining = () => {
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const editTraining = item => {
		document.body.classList.add('modal-open');
		setTraining(item);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setTraining(null);
		document.body.classList.remove('modal-open');
	};

	const confirmRemove = item => {
		confirmAction(doRemove, item, 'You want to delete this training');
	};

	const doRemove = async item => {
		try {
			setWorking(true);
			const config = { method: 'DELETE' };
			const uri = DELETE_EMPLOYEE_TRAINING_API.replace(
				':employee_training_id',
				item.id
			);
			const rs = await request(uri, config);
			refreshTable();
			notifyWithIcon('success', rs.message);
			setWorking(false);
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not delete trainings');
			setWorking(false);
		}
	};

	const bulkUpload = () => {
		document.body.classList.add('modal-open');
		setShowUploadModal(true);
	};

	const refreshTable = async () => {
		setWorking(true);
		const _limit = Number(query.get('entries_per_page') || limit);
		await fetchTrainings(_limit, 1, '');
	};

	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="Employee Trainings" parentPage="Employees" />
			<div className="row">
				<div className="col-lg-12">
					<div className="card">
						<TitleSearchBar
							title="Employee Trainings"
							onClick={() => addTraining()}
							onBulkUploadClick={() => bulkUpload()}
							queryLimit={queryLimit}
							search={search}
							searchTerm={searchTerm}
							onChangeSearch={e => setSearchTerm(e.target.value)}
							hasCreateBtn={true}
							createBtnTitle="Add Training"
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
											<th>S/N</th>
											<th>EMPLOYEE</th>
											<th>TRAINING</th>
											<th>CATEGORY </th>
											 <th>DATE ATTENDED</th>
											{/*<th>Date Approved</th> */}
											<th>ACTIONS</th>
										</tr>
									</thead>
									<tbody className="list">
										{list.map((item, i) => {
											const category_id = trainingCategory.find(
												d => d.id === item.category_id
											);

											return (
												<tr key={item.id}>
													<td>{i + min}</td>
													<td>
														<div className="d-flex align-items-center">
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
													<td>{item.training?.name || '--'}</td>
													<td>
														{item.category_id === 1 && (
															<span className="badge bg-success">
																{category_id?.name || ''}
															</span>
														)}
														{item.category_id === 2 && (
															<span className="badge bg-danger">
																{category_id?.name || ''}
															</span>
														)}
													</td>
													<td>{item.date_attended?item.date_attended: "N/A"}</td>
													{/*<td></td> */}
													<td className="text-end">
														<div className="hstack gap-3 flex-wrap text-end">
															
															<ViewListLink to={`/trainings/${item.employee.id}`} />
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
								{list.length === 0 && (
									<div className="noresult py-5">
										<NoResult title="Trainings" />
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
							title={"trainings"}
							closeModal={() => closeModal()}
						 	update={async () => {
								await refreshTable().then(_ => setWorking(false));
							}}
						/>
					)}

					{showModal && (
						<ManageEmployeeTraining
							closeModal={() => closeModal()}
							employeeTraining={training}
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

export default Trainings;
