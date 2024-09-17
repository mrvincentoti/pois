import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
	APP_SHORT_NAME,
	// dependentStatus,
	// dependentTypes,
	limit, nextOfKinCategory,
	paginate, statusTypes,
} from './../services/constants';
import Breadcrumbs from '../components/Breadcrumbs';
import AppPagination from '../components/AppPagination';
import NoResult from '../components/NoResult';
import ManageEmployeeNextOfKin from './../modals/ManageEmployeeNextOfKin';
import TableWrapper from '../container/TableWrapper';
import {
	confirmAction,
	formatEmployeeName,
	formatFullName,
	formatGetInitialsName,
	notifyWithIcon,
	request,
} from '../services/utilities';
import { useQuery } from '../hooks/query';
import {ViewButtonNok, EditButton, ViewListLink} from '../components/Buttons';
import TitleSearchBar from '../components/TitleSearchBar';
import {
	// DELETE_EMPLOYEE_DEPENDENTS_API,
	FETCH_EMPLOYEE_NEXT_OF_KIN_API,
} from '../services/api';
import ViewNextOfKin from '../modals/ViewNextOfKin';
import BulkUpload from '../components/BulkUpload';

const NextOfKin = () => {
	document.title = `Next Of Kin - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);
	const [showModal, setShowModal] = useState(false);
	const [selectedNok, setSelectedNok] = useState(null);
	const [showViewModal, setShowViewModal] = useState(null);
	const [showUploadModal, setShowUploadModal] = useState(false);

	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);

	const query = useQuery();
	const permissions = useSelector(state => state.user.permissions);

	const fetchNok = useCallback(async (per_page, page, q) => {
		try {
			const rs = await request(
				`${FETCH_EMPLOYEE_NEXT_OF_KIN_API}?per_page=${per_page}&page=${page}&q=${q}`
			);

			const { next_of_kin, ...rest } = rs;


			setList(next_of_kin);
			setMeta({ ...rest, per_page });
		} catch (e) {
			notifyWithIcon(
				'error',
				e.message || 'error, could not fetch Next of kin'
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

			fetchNok(_limit, _page, _search).then(_ => {
				setFetching(false);
				setPage(_page);
				setSearch(_search);
				setSearchTerm(_search);
				setQueryLimit(_limit);
			});
		}
	}, [fetchNok, fetching, page, query, queryLimit, search]);

	const addNok = () => {
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const editNok = item => {
		setSelectedNok(item);
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const closeModal = () => {
		setSelectedNok(null);
		setShowModal(false);
		document.body.classList.remove('modal-open');
	};

	const refreshTable = async () => {
		setFetching(true);
		const _limit = Number(query.get('entries_per_page') || limit);
		await fetchNok(_limit, 1, '');
	};

	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	const showNok = item => {
		setSelectedNok(item);
		document.body.classList.add('modal-open');
		setShowViewModal(true);
	};

	const bulkUpload = () => {
		document.body.classList.add('modal-open');
		setShowUploadModal(true);
	};

	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="Next Of Kin" parentPage="Employees" />
			<div className="row">
				<div className="col-lg-12">
					<div className="card">
						<TitleSearchBar
							title="Next Of Kin"
							onClick={() => addNok()}
							onBulkUploadClick={() => bulkUpload()}
							queryLimit={queryLimit}
							search={search}
							searchTerm={searchTerm}
							onChangeSearch={e => setSearchTerm(e.target.value)}
							hasCreateBtn={true}
							createBtnTitle="Add Next Of Kin"
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
											<th className="text-uppercase">CATEGORY</th>
											<th className="text-uppercase"> FIRST NAME</th>
											<th className="text-uppercase"> LAST NAME</th>
											<th className="text-uppercase">PHONE</th>
											<th className="text-uppercase">EMAIL</th>
											{/* <th className="text-uppercase">Address</th> */}
											<th className="text-uppercase">RELATIONSHIP</th>
											<th className="text-uppercase">ACTIONS</th>
										</tr>
									</thead>
									<tbody className="list">
										{list.map((item, i) => {
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
													<td>


														{item.category_id === 1 && (
															<span className="badge bg-success">
																{nextOfKinCategory.find(category => category.id === item.category_id).name}
															</span>
														)}

														{item.category_id === 2 && (
															<span className="badge bg-danger">
																{nextOfKinCategory.find(category => category.id === item.category_id).name}
															</span>
														)}
															</td>
													<td>{item.firstname}</td>
													<td>{item.lastname}</td>
													<td>{item.phone}</td>
													<td>{item.email}</td>
													{/* <td>{item.address}</td> */}
													<td>{item.relationship}</td>
													<td className="text-end">
														<div className="hstack gap-3 flex-wrap text-end">

															<ViewListLink to={`/next-of-kin/${item.employee.id}`} />

														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
								{list.length === 0 && (
									<div className="noresult py-5">
										<NoResult title="Next of kin" />
									</div>
								)}
							</TableWrapper>
							<div className="d-flex justify-content-end mt-3">
								<AppPagination meta={meta} />
							</div>
						</div>
					</div>

					{showViewModal && (
						<ViewNextOfKin
							selectedNok={selectedNok}
							closeModal={() => closeModal()}
						/>
					)}
					{showUploadModal && (
						<BulkUpload
							title={'next of kin'}
							closeModal={() => closeModal()}
							update={async () => {
								await refreshTable().then(_ => setWorking(false));
							}}
						/>
					)}
					{showModal && (
						<ManageEmployeeNextOfKin
							selectedNok={selectedNok}
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

export default NextOfKin;
