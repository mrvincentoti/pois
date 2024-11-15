import React from 'react';
import { Link } from 'react-router-dom';

const StatBoxItem = ({
	title,
	count,
	percentage,
	iconClass,
	linkText,
	linkHref,
}) => {
	// Determine the color class based on the percentage value
	const percentageColorClass =
		percentage > 0
			? 'text-success'
			: percentage < 0
				? 'text-danger'
				: 'text-secondary';

	// Determine the arrow direction
	const arrowDirection =
		percentage > 0 ? 'right-up' : percentage < 0 ? 'right-down' : 'right';

	return (
		<div className="col-xl-3 col-md-6">
			<div className="card card-animate">
				<div className="card-body">
					<div className="d-flex align-items-center">
						<div className="flex-grow-1 overflow-hidden">
							<p className="text-uppercase fw-medium text-muted text-truncate mb-0">
								{title}
							</p>
						</div>
						<div className="flex-shrink-0">
							<h5 className={`fs-14 mb-0 ${percentageColorClass}`}>
								<i
									className={`ri-arrow-${arrowDirection}-line fs-13 align-middle`}
								></i>{' '}
								{percentage} %
							</h5>
						</div>
					</div>
					<div className="d-flex align-items-end justify-content-between mt-4">
						<div>
							<h4 className="fs-22 fw-semibold ff-secondary mb-4">
								<span className="counter-value">{count}</span>
							</h4>
							{linkHref && (
								<Link to={linkHref} className="text-decoration-underline">
									{linkText}
								</Link>
							)}
						</div>
						<div className="avatar-sm flex-shrink-0">
							<span className="avatar-title bg-primary-subtle rounded fs-3">
								<i className={iconClass}></i>
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StatBoxItem;
