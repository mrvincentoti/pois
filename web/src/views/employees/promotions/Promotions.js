import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { APP_SHORT_NAME, limit, paginate } from '../../../services/constants';
import Breadcrumbs from '../../../components/Breadcrumbs';
import AppPagination from '../../../components/AppPagination';
import NoResult from '../../../components/NoResult';
import TableWrapper from '../../../container/TableWrapper';
import { useQuery } from '../../../hooks/query';
import { FETCH_EMPLOYEE_PROMOTIONS_API } from '../../../services/api';
import {
	formatDate,
	formatFullName,
	formatGetInitialsName,
	notifyWithIcon,
	request,
} from '../../../services/utilities';
import TitleSearchBar from '../../../components/TitleSearchBar';
import BulkUpload from '../../../components/BulkUpload';
import {ViewListLink} from "../../../components/Buttons";

const Promotions = () => {
	document.title = `Promotions - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);
	const [showUploadModal, setShowUploadModal] = useState(false);

	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);

	const query = useQuery();
	const permissions = useSelector(state => state.user.permissions);

	const fetchPromotions = useCallback(async (per_page, page, q) => {
		try {
			const rs = await request(
				`${FETCH_EMPLOYEE_PROMOTIONS_API}?per_page=${per_page}&page=${page}&q=${q}`
			);
			const { promotions, ...rest } = rs;
			setList(promotions);

			setMeta({ ...rest, per_page });
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not fetch promotions');
		}
	}, []);
	const refreshTable = async () => {
		setWorking(true);
		const _limit = Number(query.get('entries_per_page') || limit);
		await fetchPromotions(_limit, 1, '');
	};

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

			fetchPromotions(_limit, _page, _search).then(_ => {
				setFetching(false);
				setPage(_page);
				setSearch(_search);
				setSearchTerm(_search);
				setQueryLimit(_limit);
			});
		}
	}, [fetchPromotions, fetching, page, query, queryLimit, search]);

	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	const bulkUpload = () => {
		document.body.classList.add('modal-open');
		setShowUploadModal(true);
	};

	const closeModal = () => {
		setShowUploadModal(false);
		document.body.classList.remove('modal-open');
	};
	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="Promotions" parentPage="Employees" />
			<div className="row">
				<div className="col-lg-12">
					<div className="card">
						<TitleSearchBar
							title="Employee Promotions"
							queryLimit={queryLimit}
							search={search}
							searchTerm={searchTerm}
							onChangeSearch={e => setSearchTerm(e.target.value)}
							hasUploadBtn={true}
							uploadBtnTitle="Bulk Upload"
							permissions={permissions}
							onBulkUploadClick={() => bulkUpload()}
						/>
						<div className="card-body">
							<TableWrapper
								className="table-responsive table-card"
								fetching={fetching}
							>
								<table className="table align-middle table-nowrap">
									<thead className="table-light">
										<tr>
											<th>S/N</th>
											<th>EMPLOYEE</th>
											<th>PREVIOUS RANK</th>
											<th>CURRENT RANK</th>
											<th>LAST EFFECTIVE DATE OF PROMOTION </th>
											<th>PROMOTION DUE DATE</th>
											<th>ACTION</th>
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
													<td>{item.previous_rank.name}</td>
													<td>{item.current_rank.name}</td>
													<td>
														{formatDate(
															item.last_promotion_date,
															'D MMM, YYYY'
														)}
													</td>
													<td>
														{formatDate(
															item.next_promotion_date,
															'D MMM, YYYY'
														)}
													</td>
													<td>
														<ViewListLink to={`/promotions/${item.employee.id}`} />
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
								{list.length === 0 && (
									<div className="noresult py-5">
										<NoResult title="Employee Promotion" />
									</div>
								)}
							</TableWrapper>
							<div className="d-flex justify-content-end mt-3">
								<AppPagination meta={meta} />
							</div>
						</div>
					</div>
				</div>
			</div>
			{showUploadModal && (
				<BulkUpload
					title={'promotions'}
					closeModal={() => closeModal()}
					update={async () => {
						await refreshTable().then(_ => setWorking(false));
					}}
				/>
			)}
		</div>
	);
};

export default Promotions;
