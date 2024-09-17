import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { changeLimit, doClearSearch, doSearch } from '../services/utilities';
import { useQuery } from '../hooks/query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { limits } from '../services/constants';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import { checkPermission } from '../services/utilities';
import { useSelector } from 'react-redux';

const TitleSearchBar = ({
	title,
	onBulkUploadClick,
	onClick,
	queryLimit,
	search,
	searchTerm,
	onChangeSearch,
	hasCreateBtn,
	createBtnTitle,
	hasCreateLink,
	hasBackLink,
	hasUploadBtn,
	uploadBtnTitle,
	linkTo,
	hasFilter,
	openFilter,
	filters,
	onRemoveFilterTag,
	onClearFilterTag,
	permissions,
	Profilelink,
	hasEmployeeCreate,
	hasImportBtn,
	importBtnTitle,
	doImportAction,
	importRef,
	onImportFile,
}) => {
	const location = useLocation();
	const query = useQuery();
	const navigate = useNavigate();

	useEffect(() => {}, []);

	const preventDefault = (e, key) => {
		e.preventDefault();
		onRemoveFilterTag(key);
	};

	return (
		<>
			<div className="card-header border-bottom-dashed">
				<div className="row g-4 align-items-center">
					<div className="col-sm">
						<div>
							<h1 className="card-title mb-0">{title}</h1>
						</div>
					</div>
					<div className="col-sm-auto">
						<div className="d-flex flex-wrap align-items-start gap-2">
							<input
								accept=".csv"
								type="file"
								id="file"
								ref={importRef}
								onChange={onImportFile}
								style={{ display: 'none' }}
							/>
							{hasUploadBtn &&
								checkPermission(permissions, 'can-bulk-upload-data') && (
									<button
										type="button"
										className="btn btn-danger add-btn"
										onClick={onBulkUploadClick}
									>
										<i className="ri-add-line align-bottom me-1" />{' '}
										{uploadBtnTitle}
									</button>
								)}

							{hasCreateBtn && (
								<button
									type="button"
									className="btn btn-primary add-btn"
									onClick={onClick}
								>
									<i className="ri-add-line align-bottom me-1" />{' '}
									{createBtnTitle}
								</button>
							)}

							{hasImportBtn && (
								<button
									type="button"
									className="btn btn-info add-btn"
									onClick={doImportAction}
								>
									<i className="ri-upload-2-line align-bottom me-1" />{' '}
									{importBtnTitle}
								</button>
							)}

							{hasCreateLink && (
								<Link to={Profilelink} className="btn btn-secondary">
									<i className="ri-add-line align-bottom me-1" /> profile
								</Link>
							)}
							{hasEmployeeCreate && (
								<Link to={linkTo} className="btn btn-secondary">
									<i className="ri-add-line align-bottom me-1" />{' '}
									{createBtnTitle}
								</Link>
							)}
							{hasBackLink && (
								<Link to={linkTo} className="btn btn-primary">
									<i className="ri-arrow-left-line align-bottom me-1" />{' '}
									{createBtnTitle}
								</Link>
							)}
							{hasFilter && (
								<button
									type="button"
									className="btn btn-info"
									onClick={openFilter}
								>
									<i className="ri-filter-3-line align-bottom me-1" /> Filters
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
			<div className="card-body border-bottom-dashed border-bottom">
				<div className="row mb-2 col-lg-12 d-flex align-items-center">
					{filters && Object.keys(filters).length > 0 ? (
						<div>
							<Tag
								color="red"
								closeIcon={<CloseCircleOutlined />}
								onClose={() => onClearFilterTag()}
							>
								Clear filters
							</Tag>

							{Object.entries(filters).map(([key, value]) => (
								<Tag
									className="mb-1"
									key={key}
									closeIcon={<CloseCircleOutlined />}
									onClose={e => preventDefault(e, key)}
								>
									<span className="text-capitalize">
										{key.replace('_id', '')}
									</span>
									{`: ${value}`}
								</Tag>
							))}
						</div>
					) : (
						''
					)}
				</div>
				<div className="g-2 row">
					<div className="col-lg-4 d-flex align-items-center">
						<label className="selector mb-0">
							<select
								className="form-control me-2"
								value={queryLimit}
								onChange={e =>
									changeLimit(e, query, location, navigate, filters)
								}
							>
								{limits.map((item, key) => (
									<option key={key} value={item}>
										{item}
									</option>
								))}
							</select>
						</label>
						<span className="ms-2">entries per page</span>
					</div>

					<div className="ms-auto col-lg-auto">
						<div className="d-flex">
							<div className="search-box me-2">
								<input
									type="text"
									className="form-control search form-control"
									onChange={onChangeSearch}
									value={searchTerm}
									placeholder={`Search for ${title?.toLowerCase()}...`}
								/>
								<i className="ri-search-line search-icon" />
							</div>
							<div className="hstack gap-2">
								<button
									type="button"
									className="btn btn-secondary btn-icon"
									onClick={() =>
										doSearch(searchTerm, query, location, navigate, filters)
									}
								>
									<i className="ri-search-line me-1 align-bottom" />
								</button>
								{search !== '' && (
									<button
										className="btn btn-dark btn-icon px-4"
										onClick={() => doClearSearch(query, location, navigate)}
									>
										clear
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default TitleSearchBar;
