import React from 'react';
import SimpleBar from 'simplebar-react';
import { formatDate } from '../services/utilities';
import { Link } from 'react-router-dom';

const StatRetiringSoon = ({ items }) => {
	return (
		<div className="card card-height-100">
			<div className="card-header align-items-center d-flex">
				<h4 className="card-title mb-0 flex-grow-1">
					Returning from posting in 4 months
				</h4>
				<div className="flex-shrink-0">
					<Link
						to="employees/returning-from-post"
						className="btn btn-info btn-sm"
					>
						<i className="ri-file-list-3-line align-middle me-2" />
						View all
					</Link>
				</div>
			</div>
			<div className="card-body p-0">
				{items.length > 0 && (
					<SimpleBar style={{ maxHeight: '460px' }}>
						<ul className="list-group list-group-flush border-dashed px-3">
							{items.map((item, i) => {
								return (
									<li key={i} className="list-group-item ps-0">
										<a href={`/employees/${item.id}/view`}>
											<div className="d-flex align-items-start">
												<div className="form-check ps-0 flex-sharink-0">
													<label className="form-check-label mb-0 ps-2">
														{i + 1}
													</label>
												</div>
												<div className="flex-grow-1">
													<label className="form-check-label mb-0 ps-2 p-1">
														{`${item.employee.first_name} ${item.employee.last_name} - (${item.station?.name})`}
													</label>

													{/* <span className="badge bg-danger">
                                                        {item.expected_date_of_return && item.expected_date_of_return || ''}
                                                    </span> */}
												</div>
												<div className="flex-shrink-0 ms-2">
													<p className="text-muted fs-12 mb-0">
														{formatDate(
															item.expected_date_of_return,
															'D MMM, YYYY'
														)}
													</p>
												</div>
											</div>
										</a>
									</li>
								);
							})}
						</ul>
					</SimpleBar>
				)}
				{items.length === 0 && (
					<div className="d-flex flex-column py-5 my-5">
						<div className="text-center">
							<lord-icon
								src="https://cdn.lordicon.com/msoeawqm.json"
								trigger="loop"
								colors="primary:#121331,secondary:#08a88a"
								style={{
									width: '75px',
									height: '75px',
								}}
							></lord-icon>
							<h5 className="mt-2">Sorry! No Data Found</h5>
							<p className="text-muted mb-0">No employees are retiring soon.</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default StatRetiringSoon;
