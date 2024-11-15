import React, { useCallback, useEffect, useState } from 'react';
import OrganisationCategoryStatistics from '../components/OrganisatioStatistics';
import POICategoryStatistics from '../components/PoiStatistics';
import ReportsByUnits from '../components/ReportsByUnits';
import DateRange from '../components/DateRange';
import DashboardDataFilter from '../components/DashboardDataFilter';
import Spin from 'antd/es/spin';

import { APP_SHORT_NAME } from '../services/constants';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/auth';
import {
	antIconSync,
	formatDate,
	formatFullName,
	formatGetInitialsName,
	notifyWithIcon,
	request,
} from '../services/utilities';
import { FETCH_DASHBOARD_API } from '../services/api';
import StatBoxItem from '../components/StatBoxItem';
import NoResult from '../components/NoResult';
import PieChart from '../components/PieChart';
import '../assets/scss/posting.css';

const Dashboard = () => {
	document.title = `Dashboard - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [data, setData] = useState(null);

	const { user } = useAuth();

	const fetchStatistics = useCallback(async () => {
		try {
			const rs = await request(FETCH_DASHBOARD_API);

			setData(rs.data[0]);
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not fetch dashboard');
		}
	}, []);

	useEffect(() => {
		if (fetching) {
			fetchStatistics().then(_ => setFetching(false));
		}
	}, [fetchStatistics, fetching]);

	if (!data) {
		return <p>Error: No data available.</p>;
	}

	// Destructure the data for easier access
	const {
		brief,
		org_category_statistics,
		organisation,
		poi,
		poi_category_statistics,
		profile,
		poi_activities_by_type,
	} = data;

	return (
		<div className="container-fluid">
			<div className="row">
				<div className="col">
					<div className="h-100">
						<div className="row mb-3 pb-1">
							<div className="col-12">
								<div className="d-flex align-items-lg-center flex-lg-row flex-column">
									<div className="flex-grow-1">
										<h4 className="fs-16 mb-1">Welcome, {user?.username}!!</h4>
										<p className="text-muted mb-0">
											Here's what's happening with your database today.
										</p>
									</div>

									<div className="mt-3 mt-lg-0">
										<form>
											<div className="row g-3 mb-0 align-items-center">
												{/* <div className="col-sm-auto">
		 											<DashboardDataFilter />
		 										</div>
		 										<div className="col-sm-auto">
		 											<DateRange />
		 										</div> */}
												<div className="col-auto">
													<Link to="/pois/new">
														<button
															type="button"
															className="btn btn-soft-success"
														>
															<i className="ri-add-circle-line align-middle me-1"></i>{' '}
															Add POI
														</button>
													</Link>
												</div>
											</div>
										</form>
									</div>
								</div>
							</div>
						</div>

						<div className="row">
							<StatBoxItem
								title="Total Profiles"
								count={profile?.profile_count}
								percentage={profile?.brief_percentage_diff}
								iconClass="bx bx-user-circle text-primary"
								linkText="View Profiles"
								linkHref="/"
							/>
							<StatBoxItem
								title="POI"
								count={poi?.poi_count}
								percentage={poi?.poi_percentage_diff}
								iconClass="bx bx-user-circle text-info"
								linkText="View POIs"
								linkHref="/pois/poi/1/list"
							/>
							<StatBoxItem
								title="Organisation"
								count={organisation?.org_count}
								percentage={organisation?.org_percentage_diff}
								iconClass="bx bx-shopping-bag text-primary"
								linkText="View ORGs"
								linkHref="/org/organisation/${item.id}" // Add the route here
							/>

							<StatBoxItem
								title="Brief/Digest"
								count={brief?.brief_count}
								percentage={brief?.brief_percentage_diff}
								iconClass="bx bx-wallet text-info"
								linkText="View Briefs"
								linkHref="/brief"
							/>
						</div>

						<div className="row">
							<div className="col-xl-8">
								<ReportsByUnits {...{ poi_activities_by_type }} />
							</div>
							<div className="col-xl-4">
								<div className="row">
									<POICategoryStatistics {...{ poi_category_statistics }} />
									<OrganisationCategoryStatistics
										{...{ org_category_statistics }}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
