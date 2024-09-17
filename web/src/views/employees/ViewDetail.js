import React, {useCallback, useEffect, useMemo, useState} from "react";
import {formatFullName, formatGetInitialsName, notifyWithIcon, request} from "../../services/utilities";
import {
	CREATE_EMPLOYEE_DEPLOYMENTS_API, FETCH_EMPLOYEE_DEPENDENTS_API,
	FETCH_EMPLOYEES_API,
	FETCH_EMPLOYEES_DEPENDANTS_API,
	FETCH_REGIONS_API,
	FETCH_STATIONS_API, UPDATE_EMPLOYEE_DEPLOYMENTS_API
} from "../../services/api";
import ModalWrapper from "../../container/ModalWrapper";
import TableWrapper from "../../container/TableWrapper";
import {dependentStatus, dependentTypes, limit, paginate} from "../../services/constants";
import {EditButton, ViewButton} from "../../components/Buttons";
import NoResult from "../../components/NoResult";
import AppPagination from "../../components/AppPagination";
import {useQuery} from "../../hooks/query";
import TitleSearchBar from "../../components/TitleSearchBar";
import {useSelector} from "react-redux";
import TitleBar from "../../components/TitleBar";

const ViewDetail = ({ closeModal, update, type, selectedItem }) => {

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);
	const [dateOfAssumption, setDateOfAssumption] = useState();
	const [dateOfReturn, setDateOfReturn] = useState();
	const [expectedDateOfReturn, setExpectedDateOfReturn] = useState();
	const [employee, setEmployee] = useState(null);
	const [region, setRegion] = useState(null);
	const [station, setStation] = useState(null);

	const [status, setStatus] = useState(null);
	const [selectedDependent, setSelectedDependent] = useState(null);
	const permissions = useSelector(state => state.user.permissions);

	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);

	const query = useQuery();


	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);


	const getEmployeesDependants = async item => {
		if (!item || item.length <= 1) {
			return [];
		}

		const apiURL = item
				? FETCH_EMPLOYEES_DEPENDANTS_API.replace(':id', item.employee.id)
				: CREATE_EMPLOYEE_DEPLOYMENTS_API;


		const rs = await request(apiURL);
		setList(rs?.employee_dependents)

		console.log(rs?.employee_dependents)
	};

	const fetchDependents = useCallback(async (per_page, page, q) => {
		try {
			const rs = await request(
				`${FETCH_EMPLOYEE_DEPENDENTS_API}?per_page=${per_page}&page=${page}&q=${q}`
			);

			const { employee_dependents, ...rest } = rs;
			setList(employee_dependents);
			setMeta({ ...rest, per_page });
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not fetch dependent');
		}
	}, []);

	const getRegions = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_REGIONS_API}?q=${q}`);
		return rs?.regions || [];
	};

	const getStations = async q => {
		if (!q || q.length <= 1) {
			return [];
		}
		const rs = await request(`${FETCH_STATIONS_API}?region_id=${region.id}`);
		return rs?.stations || [];
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

			fetchDependents(_limit, _page, _search).then(_ => {
				setFetching(false);
				setPage(_page);
				setSearch(_search);
				setSearchTerm(_search);
				setQueryLimit(_limit);
			});
		}

	}, [fetchDependents, fetching, page, queryLimit, selectedItem]);

	const addDependent = () => {
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const editDependent = item => {
		setSelectedDependent(item);
		document.body.classList.add('modal-open');
		setShowModal(true);
	};


	return (
		<ModalWrapper
			width={'modal-lg'}
			title={`Dependants Details`}
			closeModal={closeModal}
		>
			<div className="modal-body">
				<div className="row g-3">
					<div className="col-lg-12">


						<div className="content">
							<div className="card">
								<TitleBar
									title={`Dependants ${formatFullName(selectedItem?.employee)}`}
									onClick={() => addDependent()}
									queryLimit={queryLimit}
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
											<th className="text-uppercase"> NAME</th>
											<th className="text-uppercase"> TYPE</th>
											<th className="text-uppercase">RELATIONSHIP</th>
											<th className="text-uppercase">DOB</th>
											<th className="text-uppercase">STATUS</th>
											<th className="text-uppercase">AGE</th>
										</tr>
									</thead>
									<tbody className="list">
										{list.map((item, i) => {
											const status = dependentStatus.find(
												d => d.id === item.status
											);
											const type = dependentTypes.find(
												d => d.id === item.dependent_type
											);

											return (
												<tr key={item.id}>
													<td>{i + min}</td>

													<td>{item.name}</td>
													<td>
														{item.dependent_type === 1 && (
															<span>{type?.name || ''}</span>
														)}
														{item.dependent_type === 2 && (
															<span>{type?.name || ''}</span>
														)}
													</td>
													<td>{item.relationship}</td>
													<td>{item.date_of_birth}</td>
													<td>
														{item.status === 0 && (
															<span className="badge bg-success">
																{status?.name || ''}
															</span>
														)}
														{item.status === 1 && (
															<span className="badge bg-secondary">
																{status?.name || ''}
															</span>
														)}
														{item.status === 2 && (
															<span className="badge bg-danger">
																{status?.name || ''}
															</span>
														)}
													</td>
													<td>
														{' '}
														<span
															className={`badge ${
																item.age_status === 'Above 18'
																	? 'bg-danger'
																	: item.age_status === 'Less than 6'
																	  ? 'bg-secondary'
																	  : 'bg-primary'
															}`}
														>
															{item.age_status} years
														</span>
													</td>

												</tr>
											);
										})}
									</tbody>
								</table>
								{list.length === 0 && (
									<div className="noresult py-5">
										<NoResult title="Dependents" />
									</div>
								)}
							</TableWrapper>

						</div>
							</div>
					</div>
						</div>


					</div>
				</div>

		</ModalWrapper>
	);
};

export default ViewDetail;