import React from 'react';
import { Link } from 'react-router-dom';

const StatBoxItem = ({ title, count, percentage, iconClass, linkText }) => (
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
						<h5
							className={`fs-14 mb-0 ${percentage >= 0 ? 'text-success' : 'text-danger'}`}
						>
							<i
								className={`ri-arrow-${percentage >= 0 ? 'right-up' : 'right-down'}-line fs-13 align-middle`}
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
						<a href="#" className="text-decoration-underline">
							{linkText}
						</a>
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

export default StatBoxItem;
