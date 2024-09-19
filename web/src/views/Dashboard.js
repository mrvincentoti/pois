import React from 'react';
import OrganisationCategoryStatistics from '../components/OrganisatioStatistics';
import POICategoryStatistics from '../components/PoiStatistics';
import ReportsByUnits from '../components/ReportsByUnits';
import DateRange from '../components/DateRange';
import DashboardDataFilter from '../components/DashboardDataFilter';


const Dashboard = () => {
	return (
		  <div className="container-fluid">
             <div className="row">
                <div className="col">
                     <div className="h-100">
                         <div className="row mb-3 pb-1">
                            <div className="col-12">
                                <div className="d-flex align-items-lg-center flex-lg-row flex-column">
                                    <div className="flex-grow-1">
                                        <h4 className="fs-16 mb-1">Good Morning, Anna!</h4>
                                        <p className="text-muted mb-0">Here's what's happening with your database today.</p>
                                    </div>
                                    <div className="mt-3 mt-lg-0">
                                        <form action="javascript:void(0);">
                                            <div className="row g-3 mb-0 align-items-center">
                                                <div className="col-sm-auto">
                                                    <DashboardDataFilter />
                                                </div>
                                                <div className="col-sm-auto">
                                                    <DateRange />
                                                </div>
                                                <div className="col-auto">
                                                    <button type="button" className="btn btn-soft-success"><i className="ri-add-circle-line align-middle me-1"></i> Add POI</button>
                                                </div>
                                            </div>

                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="row">
                            <div className="col-xl-3 col-md-6">

                                <div className="card card-animate">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="flex-grow-1 overflow-hidden">
                                                <p className="text-uppercase fw-medium text-muted text-truncate mb-0"> Total Profiles</p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <h5 className="text-success fs-14 mb-0">
                                                    <i className="ri-arrow-right-up-line fs-13 align-middle"></i> +16.24 %
                                                </h5>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-end justify-content-between mt-4">
                                            <div>
                                                <h4 className="fs-22 fw-semibold ff-secondary mb-4"><span className="counter-value" data-target="559.25">698</span> </h4>
                                                <a href="" className="text-decoration-underline">View Profiles</a>
                                            </div>
                                            <div className="avatar-sm flex-shrink-0">
                                                <span className="avatar-title bg-primary-subtle rounded fs-3">
                                                    <i className="bx bx-dollar-circle text-primary"></i>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6">

                                <div className="card card-animate">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="flex-grow-1 overflow-hidden">
                                                <p className="text-uppercase fw-medium text-muted text-truncate mb-0">POI</p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <h5 className="text-danger fs-14 mb-0">
                                                    <i className="ri-arrow-right-down-line fs-13 align-middle"></i> 0 %
                                                </h5>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-end justify-content-between mt-4">
                                            <div>
                                                <h4 className="fs-22 fw-semibold ff-secondary mb-4"><span className="counter-value" data-target="36894">435</span></h4>
                                                <a href="" className="text-decoration-underline">View POIs</a>
                                            </div>
                                            <div className="avatar-sm flex-shrink-0">
                                                <span className="avatar-title bg-info-subtle rounded fs-3">
                                                    <i className="bx bx-shopping-bag text-info"></i>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6">

                                <div className="card card-animate">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="flex-grow-1 overflow-hidden">
                                                <p className="text-uppercase fw-medium text-muted text-truncate mb-0">Organisation</p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <h5 className="text-success fs-14 mb-0">
                                                    <i className="ri-arrow-right-up-line fs-13 align-middle"></i> +2.08 %
                                                </h5>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-end justify-content-between mt-4">
                                            <div>
                                                <h4 className="fs-22 fw-semibold ff-secondary mb-4"><span className="counter-value" data-target="183.35">0</span></h4>
                                                <a href="" className="text-decoration-underline">See details</a>
                                            </div>
                                            <div className="avatar-sm flex-shrink-0">
                                                <span className="avatar-title bg-primary-subtle rounded fs-3">
                                                    <i className="bx bx-user-circle text-primary"></i>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-3 col-md-6">

                                <div className="card card-animate">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            <div className="flex-grow-1 overflow-hidden">
                                                <p className="text-uppercase fw-medium text-muted text-truncate mb-0">Brief/Digest</p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <h5 className="text-muted fs-14 mb-0">
                                                    +0.00 %
                                                </h5>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-end justify-content-between mt-4">
                                            <div>
                                                <h4 className="fs-22 fw-semibold ff-secondary mb-4"><span className="counter-value" data-target="165.89">0</span></h4>
                                                <a href="" className="text-decoration-underline">View All</a>
                                            </div>
                                            <div className="avatar-sm flex-shrink-0">
                                                <span className="avatar-title bg-info-subtle rounded fs-3">
                                                    <i className="bx bx-wallet text-info"></i>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> 

                        <div className="row">
                            <div className="col-xl-8">
                                <ReportsByUnits />
                            </div>

                            <div className="col-xl-4">
                                <div className="row">
                                    <POICategoryStatistics />
                                    <OrganisationCategoryStatistics />
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
