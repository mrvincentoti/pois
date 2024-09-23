import React from 'react';
import DocumentMediaDropDown from '../../components/DocumentMediaDropDown';


const routes = {
    view: '/view/123',
    download: '/download/123',
    delete: '/delete/123'
};


const Activities = () => {
    return (
        <div className="card">
            <div className="card-body">
                <div className="row">
                    <div class="d-flex align-items-center mb-4">
                        <h5 class="card-title flex-grow-1 mb-0">Activities</h5>
                        <div class="flex-shrink-0">
                            <input class="form-control d-none" type="file" id="formFile" />
                            <label for="formFile" class="btn btn-success">
                                <i class="ri-add-fill me-1 align-bottom"></i> Add
                            </label>
                        </div>
                    </div>

                    <div className="activity-timeline">
                        {/* Activity 1 */}
                        <div className="activity-item d-flex">
                            <div className="flex-shrink-0 avatar-xs activity-avatar">
                                <div className="avatar-title bg-success-subtle text-success rounded-circle">O</div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <h6 className="mb-1">
                                    Oliver Phillips <span className="badge bg-primary-subtle text-primary align-middle">New</span>
                                </h6>
                                <p className="text-muted mb-2">We talked about a project on LinkedIn.</p>
                                <small className="mb-0 text-muted">Today</small>
                            </div>
                        </div>

                        {/* Activity 2 */}
                        <div className="activity-item py-3 d-flex">
                            <div className="flex-shrink-0 avatar-xs activity-avatar">
                                <div className="avatar-title bg-success-subtle text-success rounded-circle">N</div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <h6 className="mb-1">
                                    Nancy Martino <span className="badge bg-secondary-subtle text-secondary align-middle">In Progress</span>
                                </h6>
                                <p className="text-muted mb-2">
                                    <i className="ri-file-text-line align-middle ms-2"></i> Create new project: Building product
                                </p>
                                <div className="avatar-group mb-2">
                                    <div className="flex-shrink-0 avatar-xs activity-avatar">
                                        <div className="avatar-title bg-success-subtle text-success rounded-circle">A</div>
                                    </div>
                                    <div className="flex-shrink-0 avatar-xs activity-avatar">
                                        <div className="avatar-title bg-success-subtle text-success rounded-circle">X</div>
                                    </div>
                                    <div className="flex-shrink-0 avatar-xs activity-avatar">
                                        <div className="avatar-title bg-success-subtle text-success rounded-circle">L</div>
                                    </div>
                                    <a href="#" className="avatar-group-item" title="more">
                                        <div className="avatar-xs">
                                            <div className="avatar-title rounded-circle">2+</div>
                                        </div>
                                    </a>
                                </div>
                                <small className="mb-0 text-muted">Yesterday</small>
                            </div>
                        </div>

                        {/* Activity 3 */}
                        <div className="activity-item py-3 d-flex">
                            <div className="flex-shrink-0 avatar-xs activity-avatar">
                                <div className="avatar-title bg-success-subtle text-success rounded-circle">N</div>
                            </div>
                            <div className="flex-grow-1 ms-3">
                                <h6 className="mb-1">
                                    Natasha Carey <span className="badge bg-success-subtle text-success align-middle">Completed</span>
                                </h6>
                                <p className="text-muted mb-2">Adding a new event with attachments</p>
                                <div className="row">
                                    <div className="col-xxl-4">
                                        <div className="row border border-dashed gx-2 p-2 mb-2">
                                            <div className="flex-shrink-0 avatar-xs activity-avatar">
                                                <div className="avatar-title bg-success-subtle text-success rounded-circle">A</div>
                                            </div>
                                            <div className="flex-shrink-0 avatar-xs activity-avatar">
                                                <div className="avatar-title bg-success-subtle text-success rounded-circle">X</div>
                                            </div>
                                            <div className="flex-shrink-0 avatar-xs activity-avatar">
                                                <div className="avatar-title bg-success-subtle text-success rounded-circle">L</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <small className="mb-0 text-muted">25 Nov</small>
                            </div>
                        </div>

                        {/* Additional activities would go here, following the same structure */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Activities;
