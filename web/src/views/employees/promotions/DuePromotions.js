import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { APP_SHORT_NAME, limit, paginate } from '../../../services/constants';
import Breadcrumbs from '../../../components/Breadcrumbs';
import AppPagination from '../../../components/AppPagination';
import NoResult from '../../../components/NoResult';
import TableWrapper from '../../../container/TableWrapper';
import { useQuery } from '../../../hooks/query';
import { FETCH_EMPLOYEE_DUE_FOR_PROMOTIONS_API } from '../../../services/api';
import {
	notifyWithIcon,
	request,
	formatEmployeeName,
	formatGetInitialsName,
	formatFullName,
} from '../../../services/utilities';
import TitleSearchBar from '../../../components/TitleSearchBar';
import { ViewLink } from '../../../components/Buttons';

const Due_For_Promotions = () => {
	document.title = `Due For Promotions - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);

	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);

	const query = useQuery();

	const fetchAwards = useCallback(async (per_page, page, q) => {
		try {
			const rs = await request(
				`${FETCH_EMPLOYEE_DUE_FOR_PROMOTIONS_API}?per_page=${per_page}&page=${page}&q=${q}`
			);

			const { employees, ...rest } = rs;
			setList(employees);
			setMeta({ ...rest, per_page });
		} catch (e) {
			notifyWithIcon(
				'error',
				e.message || 'error, could not fetch employees due for promotions'
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

			fetchAwards(_limit, _page, _search).then(_ => {
				setFetching(false);
				setPage(_page);
				setSearch(_search);
				setSearchTerm(_search);
				setQueryLimit(_limit);
			});
		}
	}, [fetchAwards, fetching, page, query, queryLimit, search]);

	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="Due For Promotions" parentPage="Employees" />
			<div className="row">
				<div className="col-lg-12">
					<div className="card">
						<TitleSearchBar
							title="Employees Due For Promotions"
							queryLimit={queryLimit}
							search={search}
							searchTerm={searchTerm}
							onChangeSearch={e => setSearchTerm(e.target.value)}
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
											<th>DIRECTORATE</th>
											<th>DEPARTMENT</th>
											<th>UNIT</th>
											<th>DUE DATE</th>
											<th>ACTIONS</th>
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
																	href={`/employees/${item.id}/view`}
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
													<td>{item.directorate.name}</td>
													<td>{item.department.name}</td>
													<td>{item.unit.name}</td>
													<td>{item.promotion_due_date}</td>
													<td className="text-end">
														<div className="hstack gap-3 flex-wrap text-end">
															<ViewLink to={`/employees/${item.id}/view`} />
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
								{list.length === 0 && (
									<div className="noresult py-5">
										<NoResult title="Employees Due For Promotion" />
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
		</div>
	);
};

export default Due_For_Promotions;
