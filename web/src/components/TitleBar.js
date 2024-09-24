import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { changeLimit, doClearSearch, doSearch } from '../services/utilities';
import { useQuery } from '../hooks/query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { limits } from '../services/constants';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import { checkPermission } from '../services/utilities';
import { useSelector } from 'react-redux';

const TitleBar = ({
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
							{hasCreateLink && (
								<Link to={linkTo} className="btn btn-secondary">
									<i className="ri-add-line align-bottom me-1" />{' '}
									{createBtnTitle}
								</Link>
							)}
							{hasBackLink && (
								<Link to={linkTo} className="btn btn-secondary">
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
		</>
	);
};

export default TitleBar;
