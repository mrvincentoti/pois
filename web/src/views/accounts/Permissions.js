import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';

import { APP_SHORT_NAME, limit, paginate } from '../../services/constants';
import Breadcrumbs from '../../components/Breadcrumbs';
import AppPagination from '../../components/AppPagination';
import NoResult from '../../components/NoResult';
import TableWrapper from '../../container/TableWrapper';
import { notifyWithIcon, request } from '../../services/utilities';
import { useQuery } from '../../hooks/query';
import TitleSearchBar from '../../components/TitleSearchBar';
import {
	CREATE_PERMISSION_API,
	FETCH_MODULES_API,
	FETCH_PERMISSIONS_API,
} from '../../services/api';
import {
	ErrorBlock,
	FormSubmitError,
	error,
	resetForm,
} from '../../components/FormBlock';
import FormWrapper from '../../container/FormWrapper';
import Select from 'react-select';

const Permissions = () => {
	document.title = `Permissions - ${APP_SHORT_NAME}`;

	const [loaded, setLoaded] = useState(false);
	const [modules, setModules] = useState([]);

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);

	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);

	const query = useQuery();

	const fetchModules = useCallback(async () => {
		try {
			const rs = await request(`${FETCH_MODULES_API}?per_page=10&page=1`);
			setModules(rs.modules);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchPermissions = useCallback(async (per_page, page, q) => {
		try {
			const rs = await request(
				`${FETCH_PERMISSIONS_API}?per_page=${per_page}&page=${page}&q=${q}`
			);
			const { permissions, ...rest } = rs;
			setList(permissions);
			setMeta({ ...rest, per_page });
		} catch (e) {
			notifyWithIcon(
				'error',
				e.message || 'error, could not fetch permissions'
			);
		}
	}, []);

	useEffect(() => {
		if (!loaded) {
			fetchModules().then(_ => setLoaded(true));
		}

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

			fetchPermissions(_limit, _page, _search).then(_ => {
				setFetching(false);
				setPage(_page);
				setSearch(_search);
				setSearchTerm(_search);
				setQueryLimit(_limit);
			});
		}
	}, [
		fetchModules,
		fetchPermissions,
		fetching,
		loaded,
		page,
		query,
		queryLimit,
		search,
	]);

	const refreshTable = async () => {
		setWorking(true);
		const _limit = Number(query.get('entries_per_page') || limit);
		await fetchPermissions(_limit, 1, '');
	};

	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	const onSubmit = async (values, form) => {
		try {
			const config = {
				method: 'POST',
				body: { ...values, module_id: values.module_id.id },
			};
			await request(CREATE_PERMISSION_API, config);
			notifyWithIcon('success', 'permission created!');
			await refreshTable();
			setWorking(false);
			resetForm(form, values);
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not create permission' };
		}
	};

	return (
		<div className="container-fluid">
			<Breadcrumbs pageTitle="Permissions" parentPage="Accounts" />
			<div className="row">
				<div className="col-lg-8">
					<div className="card">
						<TitleSearchBar
							title="Permissions"
							queryLimit={queryLimit}
							search={search}
							searchTerm={searchTerm}
							onChangeSearch={e => setSearchTerm(e.target.value)}
						/>
						<div className="card-body">
							<div className="table-responsive table-card">
								<table className="table align-middle table-nowrap">
									<thead className="table-light">
										<tr>
											<th>S/N</th>
											<th>Name</th>
											<th>Description</th>
											{/* <th>Module</th> */}
											<th>Group</th>
											<th>Method:Route</th>
											<th></th>
										</tr>
									</thead>
									<tbody className="list">
										{list.map((item, i) => {
											return (
												<tr key={item.id}>
													<td>{i + min}</td>
													<td>
														<span
															style={{
																color:
																	item.method === 'GET'
																		? 'green'
																		: item.method === 'PUT'
																			? 'blue'
																			: item.method === 'DELETE'
																				? 'red'
																				: item.method === 'POST'
																					? 'orange'
																					: 'black',
															}}>
															<td>
																{item.name.charAt(0).toUpperCase() +
																	item.name.slice(1)}
															</td>
														</span>
													</td>
													<td>{item.description}</td>
													{/* <td>{item.module?.name}</td> */}
													<td>
														{item.group.charAt(0).toUpperCase() +
															item.group.slice(1)}
													</td>
													<td>
														<span
															style={{
																color:
																	item.method === 'GET'
																		? 'green'
																		: item.method === 'PUT'
																			? 'blue'
																			: item.method === 'DELETE'
																				? 'red'
																				: item.method === 'POST'
																					? 'orange'
																					: 'black',
															}}>
															{item.method}
														</span>
														: <i>{item.route_path}</i>
													</td>
													<td></td>
												</tr>
											);
										})}
									</tbody>
								</table>
								{list.length === 0 && (
									<div className="noresult py-5">
										<NoResult title="Permissions" />
									</div>
								)}
							</div>
							<div className="d-flex justify-content-end mt-3">
								<AppPagination meta={meta} />
							</div>
						</div>
					</div>
				</div>
				<div className="col-lg-4">
					<div className="card">
						<div className="card-header">
							<h5 class="card-title">Add Permission</h5>
						</div>
						<div className="card-body pt-0">
							<Form
								initialValues={{}}
								onSubmit={onSubmit}
								validate={values => {
									const errors = {};
									if (!values.name) {
										errors.name = 'enter permission';
									}
									if (!values.description) {
										errors.description = 'enter description';
									}
									if (!values.group) {
										errors.group = 'enter group';
									}
									if (!values.module_id) {
										errors.module_id = 'select module';
									}
									if (!values.method) {
										errors.method = 'enter method';
									}
									if (!values.route_path) {
										errors.route_path = 'enter route';
									}
									return errors;
								}}
								render={({ handleSubmit, submitError, submitting }) => (
									<FormWrapper onSubmit={handleSubmit} submitting={submitting}>
										<FormSubmitError error={submitError} />
										<div className="row">
											<div className="col-lg-12 mt-3">
												<label htmlFor="module_id" className="form-label">
													Module
												</label>
												<Field id="module_id" name="module_id">
													{({ input, meta }) => (
														<Select
															{...input}
															className={error(meta)}
															placeholder="Select module"
															options={modules}
															getOptionValue={option => option.id}
															getOptionLabel={option => option.name}
														/>
													)}
												</Field>
												<ErrorBlock name="module_id" />
											</div>
											<div className="col-lg-12 mt-3">
												<label htmlFor="name" className="form-label">
													Permission
												</label>
												<Field id="name" name="name">
													{({ input, meta }) => (
														<input
															{...input}
															type="text"
															className={`form-control ${error(meta)}`}
															id="name"
															placeholder="Enter permission"
														/>
													)}
												</Field>
												<ErrorBlock name="name" />
											</div>
											<div className="col-lg-12 mt-3">
												<label htmlFor="description" className="form-label">
													Description
												</label>
												<Field id="description" name="description">
													{({ input, meta }) => (
														<input
															{...input}
															type="text"
															className={`form-control ${error(meta)}`}
															id="description"
															placeholder="Enter description"
														/>
													)}
												</Field>
												<ErrorBlock name="description" />
											</div>
											<div className="col-lg-12 mt-3">
												<label htmlFor="group" className="form-label">
													Group
												</label>
												<Field id="group" name="group">
													{({ input, meta }) => (
														<input
															{...input}
															type="text"
															className={`form-control ${error(meta)}`}
															id="group"
															placeholder="Enter group"
														/>
													)}
												</Field>
												<ErrorBlock name="group" />
											</div>
											<div className="col-lg-12 mt-3">
												<label htmlFor="route_path" className="form-label">
													Route Path
												</label>
												<Field id="route_path" name="route_path">
													{({ input, meta }) => (
														<input
															{...input}
															type="text"
															className={`form-control ${error(meta)}`}
															id="route_path"
															placeholder="Enter route path"
														/>
													)}
												</Field>
												<ErrorBlock name="route_path" />
											</div>
											<div className="col-lg-12 mt-3">
												<label htmlFor="method" className="form-label">
													Method
												</label>
												<Field id="method" name="method">
													{({ input, meta }) => (
														<input
															{...input}
															type="text"
															className={`form-control ${error(meta)}`}
															id="method"
															placeholder="Enter method"
														/>
													)}
												</Field>
												<ErrorBlock name="method" />
											</div>
										</div>
										<div className="d-flex gap-3 mt-3 justify-content-end">
											<button
												type="submit"
												className="btn btn-success"
												disabled={submitting}>
												Add Permission
											</button>
										</div>
									</FormWrapper>
								)}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Permissions;
