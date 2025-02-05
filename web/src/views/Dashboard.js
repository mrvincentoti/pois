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
	notifyWithIcon,
	request,
} from '../services/utilities';
import { FETCH_DASHBOARD_API } from '../services/api';
import StatBoxItem from '../components/StatBoxItem';
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
		 										</div> 
												*/}
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
								iconClass="bx bx-user-circle text-warning"
								linkText="_"
								linkHref="/"
							/>
							<StatBoxItem
								title="Person of Interests"
								count={poi?.poi_count}
								iconClass="bx bx-user-circle text-danger"
								linkText="View POIs"
								linkHref="/pois/poi/list"
							/>
							<StatBoxItem
								title="Organisations"
								count={organisation?.org_count}
								iconClass="bx bx-shopping-bag text-info"
								linkText="View ORGs"
								linkHref="/org/organisation/list"
							/>

							<StatBoxItem
								title="Briefs/Digests"
								count={brief?.brief_count}
								iconClass="bx bx-wallet text-dark"
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
