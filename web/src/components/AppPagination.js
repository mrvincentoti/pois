import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '../hooks/query';
import { getHashString, getQueryString } from '../services/utilities';

const AppPagination = ({ meta, filters }) => {
	const location = useLocation();
	const query = useQuery();

	const queryString = getQueryString(query);
	const qs = queryString !== '' ? `&${queryString}` : '';

	const filterHashString = getHashString(filters);
	const filterHash = filterHashString !== '' ? `#${filterHashString}` : '';

	const sizes = useMemo(() => {
		const valPrev = meta.current_page > 1 ? meta.current_page - 1 : 1; // previous page
		const valNext =
			meta.current_page < meta.pages ? meta.current_page + 1 : meta.pages; // next page
		const extraPrev = valPrev === 3 ? 2 : null;
		const extraNext = valNext === meta.pages - 2 ? meta.pages - 1 : null;
		const dotsBefore = valPrev > 3 ? 2 : null;
		const dotsAfter = valNext < meta.pages - 2 ? meta.pages - 1 : null;
		const output = [];
		for (let i = 1; i <= meta.pages; i += 1) {
			if (
				[
					1,
					meta.pages,
					meta.current_page,
					valPrev,
					valNext,
					extraPrev,
					extraNext,
					dotsBefore,
					dotsAfter,
				].includes(i)
			) {
				output.push({
					label: i,
					active: meta.current_page === i,
					disable: [dotsBefore, dotsAfter].includes(i),
				});
			}
		}
		return output;
	}, [meta.current_page, meta.pages]);

	const min = useMemo(() => {
		console.log('ygf');
		console.log(meta);
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	const max = useMemo(() => {
		if (meta.current_page === meta.pages) {
			return meta.total;
		}
		return meta.total < meta.per_page
			? meta.total
			: meta.per_page * meta.current_page;
	}, [meta.current_page, meta.pages, meta.total, meta.per_page]);

	return (
		meta.total > 0 && (
			<>
				<div className="col-sm">
					<div className="text-muted">
						Showing <span className="fw-semibold ms-1">{min}</span> to{' '}
						<span className="fw-semibold ms-1">{max}</span> of{' '}
						<span className="fw-semibold">{meta.total}</span> Results
					</div>
				</div>
				<div className="col-sm-auto">
					<ul className="pagination pagination-separated pagination-md justify-content-center justify-content-sm-start mb-0">
						<li
							className={`page-item ${
								meta.current_page === 1 ? 'disabled' : ''
							}`}
						>
							<Link
								className="page-link"
								to={`${location.pathname}?page=${
									meta.current_page === 1 ? 1 : meta.current_page - 1
								}${qs}${filterHash}`}
							>
								Previous
							</Link>
						</li>
						{sizes.map((item, key) => (
							<li className="page-item" key={key}>
								<Link
									className={`page-link ${
										Number(item.label) === meta.current_page ? 'active' : ''
									}`}
									to={`${location.pathname}?page=${item.label}${qs}${filterHash}`}
								>
									{item.label}
								</Link>
							</li>
						))}
						<li
							className={`page-item ${
								meta.current_page === meta.pages ? 'disabled' : ''
							}`}
						>
							<Link
								className="page-link"
								to={`${location.pathname}?page=${
									meta.current_page === meta.pages
										? meta.pages
										: meta.current_page + 1
								}${qs}${filterHash}`}
							>
								Next
							</Link>
						</li>
					</ul>
				</div>
			</>
		)
	);
};

export default AppPagination;
