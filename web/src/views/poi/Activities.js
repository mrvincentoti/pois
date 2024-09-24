import React from 'react';
import DocumentMediaDropDown from '../../components/DocumentMediaDropDown';


const routes = {
    view: '/view/123',
    download: '/download/123',
    delete: '/delete/123'
};


const Activities = () => {
    return (
        <div className="card" style={{ background: '#f3f3f9'}}>
            <div className="card-body">
                <div class="row">
                    <div class="col-lg-12">
                        <div>
                            <h5>Center Timeline</h5>
                            <div class="timeline">
                               
                                <div class="timeline-item left">
                                    <i class="icon ri-stack-line"></i>
                                    <div class="date">15 Dec 2021</div>
                                    <div class="content">
                                        <div class="d-flex">
                                            <div class="flex-shrink-0">
                                                <img src="assets/images/users/avatar-5.jpg" alt="" class="avatar-sm rounded" />
                                            </div>
                                            <div className="flex-shrink-0 avatar-xs acitivity-avatar">
                                                <div className="avatar-title bg-success-subtle text-success rounded-circle">
                                                    N
                                                </div>
                                            </div>
                                            <div class="flex-grow-1 ms-3">
                                                <h5 class="fs-15">@Erica245 <small class="text-muted fs-13 fw-normal">- 10 min Ago</small></h5>
                                                <p class="text-muted mb-2">Wish someone a sincere ‘good luck in your new job’ with these sweet messages...</p>
                                                <div class="hstack gap-2">
                                                    <a class="btn btn-sm btn-light"><span class="me-1">&#128293;</span> 19</a>
                                                    <a class="btn btn-sm btn-light"><span class="me-1">&#129321;</span> 22</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                               
                                <div class="timeline-item right">
                                    <i class="icon ri-vip-diamond-line"></i>
                                    <div class="date">22 Oct 2021</div>
                                    <div class="content">
                                        <h5>Adding a new event with attachments</h5>
                                        <p class="text-muted">Too much or too little spacing can make things unpleasant for the reader.</p>
                                        <div class="row g-2">
                                            <div class="col-sm-6">
                                                <div class="d-flex border border-dashed p-2 rounded">
                                                    <div class="avatar-xs">
                                                        <div class="avatar-title bg-danger-subtle text-danger fs-15 rounded">
                                                            <i class="ri-image-2-line"></i>
                                                        </div>
                                                    </div>
                                                    <div class="flex-grow-1 overflow-hidden ms-2">
                                                        <h6 class="text-truncate mb-0"><a href="#">Business Template - UI/UX design</a></h6>
                                                        <small>685 KB</small>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-sm-6">
                                                <div class="d-flex border border-dashed p-2 rounded">
                                                    <div class="avatar-xs">
                                                        <div class="avatar-title bg-info-subtle text-info fs-15 rounded">
                                                            <i class="ri-file-zip-line"></i>
                                                        </div>
                                                    </div>
                                                    <div class="flex-grow-1 ms-2 overflow-hidden">
                                                        <h6 class="mb-0 text-truncate"><a href="#">Bank Management System - PSD</a></h6>
                                                        <small>8.78 MB</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                               
                                <div class="timeline-item left">
                                    <i class="icon ri-gift-line"></i>
                                    <div class="date">10 Jul 2021</div>
                                    <div class="content">
                                        <h5>Create new project building product</h5>
                                        <p class="text-muted">Every team project can have a velzon. Use the velzon to share information with your team...</p>
                                        <div class="avatar-group mb-2">
                                            <a href="#" class="avatar-group-item" data-bs-toggle="tooltip" title="Christi">
                                                <img src="assets/images/users/avatar-4.jpg" alt="" class="rounded-circle avatar-xs" />
                                            </a>
                                            <a href="#" class="avatar-group-item" data-bs-toggle="tooltip" title="Frank Hook">
                                                <img src="assets/images/users/avatar-3.jpg" alt="" class="rounded-circle avatar-xs" />
                                            </a>
                                            <a href="#" class="avatar-group-item" data-bs-toggle="tooltip" title="Ruby">
                                                <div class="avatar-xs">
                                                    <div class="avatar-title rounded-circle bg-light text-primary">R</div>
                                                </div>
                                            </a>
                                            <a href="#" class="avatar-group-item" data-bs-toggle="tooltip" title="more">
                                                <div class="avatar-xs">
                                                    <div class="avatar-title rounded-circle">2+</div>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div class="timeline-item right">
                                    <i class="icon ri-shield-star-line"></i>
                                    <div class="date">18 May 2021</div>
                                    <div class="content">
                                        <h5>Donald Palmer <small class="text-muted fs-13 fw-normal">- Has changed 2 attributes</small></h5>
                                        <p class="text-muted fst-italic mb-2">"This is an awesome admin dashboard template..."</p>
                                        <div class="hstack gap-2">
                                            <a class="btn btn-sm bg-light"><span class="me-1">&#128151;</span> 35</a>
                                            <a class="btn btn-sm btn-light"><span class="me-1">&#128077;</span> 10</a>
                                            <a class="btn btn-sm btn-light"><span class="me-1">&#128591;</span> 10</a>
                                        </div>
                                    </div>
                                </div>

                                <div class="timeline-item left">
                                    <i class="icon ri-user-smile-line"></i>
                                    <div class="date">10 Feb 2021</div>
                                    <div class="content">
                                        <h5>Velzon admin dashboard templates layout upload</h5>
                                        <p class="text-muted">Powerful, clean & modern responsive bootstrap 5 admin template.</p>
                                        <div class="row border border-dashed rounded gx-2 p-2">
                                            <div class="col-3">
                                                <img src="assets/images/small/img-2.jpg" alt="" class="img-fluid rounded" />
                                            </div>
                                            <div class="col-3">
                                                <img src="assets/images/small/img-3.jpg" alt="" class="img-fluid rounded" />
                                            </div>
                                            <div class="col-3">
                                                <img src="assets/images/small/img-4.jpg" alt="" class="img-fluid rounded" />
                                            </div>
                                            <div class="col-3">
                                                <img src="assets/images/small/img-6.jpg" alt="" class="img-fluid rounded" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="timeline-item right">
                                    <i class="icon ri-fire-line"></i>
                                    <div class="date">01 Jan 2021</div>
                                    <div class="content">
                                        <h5>New ticket received <span class="badge bg-success-subtle text-success fs-10 align-middle ms-1">Completed</span></h5>
                                        <p class="text-muted mb-2">It is important for us that we receive email notifications when a ticket is created...</p>
                                        <a href="javascript:void(0);" class="link-primary text-decoration-underline">Read More <i class="ri-arrow-right-line"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Activities;
