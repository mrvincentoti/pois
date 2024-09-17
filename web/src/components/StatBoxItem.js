import React from 'react';
import { Link } from 'react-router-dom';

const StatBoxItem = ({ title, record, to, icon, color }) => {
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
							<h5 className="text-success fs-14 mb-0">
								<i className="ri-arrow-right-up-line- fs-13 align-middle"></i>
							</h5>
						</div>
					</div>
					<div className="d-flex align-items-end justify-content-between mt-4">
						<div>
							<h4 className="fs-22 fw-semibold ff-secondary mb-4">
								<span className="counter-value">{record}</span>
							</h4>
							<Link to={to} className="text-decoration-underline">
								View {title.toLowerCase()}
							</Link>
						</div>
						<div className="avatar-sm flex-shrink-0">
							<span className={`avatar-title bg-${color}-subtle rounded fs-3`}>
								<i className={`bx ${icon} text-${color}`} />
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StatBoxItem;
