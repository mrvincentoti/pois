import React from 'react';
import { Link } from 'react-router-dom';
import {formatDate, formatEmployeeName, formatGetInitialsName} from '../services/utilities';

const StatDuePromotion = ({ items }) => {
	return (
		<div className="card">
			<div className="card-header align-items-center d-flex">
				<h4 className="card-title mb-0 flex-grow-1">Due for promotion</h4>
				<div className="flex-shrink-0">
				<Link to="/employees/promotions/due" className="btn btn-info btn-sm">
						<i className="ri-file-list-3-line align-middle me-2" />
						View all
					</Link>
				</div>
			</div>

			<div className="card-body">
				<div className="table-responsive table-card">
					<table className="table table-borderless table-centered align-middle table-nowrap mb-0">
						<thead className="text-muted table-light">
							<tr>
								<th>Employee</th>
								<th>Directorate</th>
								<th>Department</th>
								<th>Due Date</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{items.map((item, i) => {
								return (
									<tr key={i}>
										{/* <td>
											<a className="fw-medium link-primary">{item.pfs_numb}</a>
										</td> */}
										<td>
											<div className="d-flex align-items-center">
												 <div className="flex-shrink-0 me-2">
																				<div className="flex-shrink-0 avatar-sm">
																									{item.employee.photo?
																										<img src={item.employee.photo} alt="" className="avatar-sm p-2 rounded-circle"/>:
																									<span className="mini-stat-icon avatar-title rounded-circle text-secondary bg-secondary-subtle fs-4">
																										{formatGetInitialsName(item.employee)}
																									</span>
																									}
																								</div>
																			</div>
												<div className="flex-grow-1">
													<a href={`/employees/${item.id}/view`}
																										className="text-reset text-underline"> {formatEmployeeName(item.employee)}</a>

												</div>
											</div>
										</td>
										<td>{item.directorate?.name || '--'}</td>
										<td>{item.department?.name || '--'}</td>
										<td>
											{formatDate(item.promotion_due_date, 'D MMM, YYYY')}
										</td>
										<td>
											<a href={`/employees/${item.id}/view`}>
												<span className="badge bg-success-subtle text-success">
													Details
												</span>
											</a>
										</td>
									</tr>
								);
							})}
							{items.length === 0 && (
								<tr>
									<td colSpan="5">
										<div className="alert alert-info text-center">
											No employee due for promotion at this time!
										</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default StatDuePromotion;
