import React, { useCallback } from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GET_EMPLOYEE_API } from '../../services/api';
import {
    antIconSync,
    formatDate, formatDateWord,
    formatEmployeeName,
    formatGetInitialsName,
    notifyWithIcon,
    request,
} from '../../services/utilities';
import Spin from 'antd/es/spin';
import { Link } from 'react-router-dom';
import { useRef } from "react";
import {
    categoryList,
    dependentStatus,
    deploymentTypes,
    employeeStatusList,
    hasImplications,
    postingTypes,
    statusTypes, trainingCategory,
} from '../../services/constants';
import '../../assets/scss/profile.css'
import profileBg from '../../assets/images/profile-bg.jpg';
import samplePicture from '../../assets/images/users/avatar-1.jpg';
import sampleMedia5 from '../../assets/images/small/img-5.jpg';
import sampleMedia6 from '../../assets/images/small/img-6.jpg';
import { Button } from "antd";
import PoiPrint from "./PoiPrint";
import MediaAndDocument from '../../components/MediaAndDocument';

const ViewPoi = () => {
    const employeePrintRef = useRef();
    const [loaded, setLoaded] = useState(false);
    const [employeeData, setEmployeeData] = useState(null);


    const navigate = useNavigate();
    const params = useParams();

    const fetchEmployeeDetails = useCallback(async employeeId => {
        try {
            const rs = await request(GET_EMPLOYEE_API.replace(':id', employeeId));

            setEmployeeData(rs.employee);
        } catch (error) {
            throw error;
        }
    }, []);

    // useEffect(() => {
    //     if (!loaded) {
    //         fetchEmployeeDetails(params.id)
    //             .then(_ => setLoaded(true))
    //             .catch(e => {
    //                 notifyWithIcon('error', e.message);
    //                 navigate('/not-found');
    //             });
    //     }
    // }, [fetchEmployeeDetails, loaded, navigate, params.id]);


    // const handlePrint = () => {
    //     window.print();
    // };

    const handlePrint = () => {
        // Add a print-specific class to the body
        document.body.classList.add('print-mode');

        // Trigger the print dialog
        window.print();

        // Remove the print-specific class after printing
        document.body.classList.remove('print-mode');
    };

    return (
        <>
            <div className="container-fluid">
                <div className="profile-foreground position-relative mx-n4 mt-n4">
                    <div className="profile-wid-bg">
                        <img src={profileBg} alt="" className="profile-wid-img" />
                    </div>
                </div>

                <div className="pt-4 mb-4 mb-lg-3 pb-lg-4 profile-wrapper">
                    <div className="row g-4">
                        <div className="col-auto">
                            <div className="avatar-lg">
                                <img src={samplePicture} alt="user-img" className="img-thumbnail rounded-circle" />
                            </div>
                        </div>
                        {/* end col */}
                        <div className="col">
                            <div className="p-2">
                                <h3 className="text-white mb-1">Anna Adame</h3>
                                <p className="text-white text-opacity-75">Owner & Founder</p>
                                <div className="hstack text-white-50 gap-1">
                                    <div className="me-2">
                                        <i className="ri-map-pin-user-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
                                        California, United States
                                    </div>
                                    <div>
                                        <i className="ri-building-line me-1 text-white text-opacity-75 fs-16 align-middle"></i>
                                        Themesbrand
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* end col */}
                        <div className="col-12 col-lg-auto order-last order-lg-0">
                            <div className="row text text-white-50 text-center">
                                <div className="col-lg-6 col-4">
                                    <div className="p-2">
                                        <h4 className="text-white mb-1">24.3K</h4>
                                        <p className="fs-14 mb-0">Followers</p>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-4">
                                    <div className="p-2">
                                        <h4 className="text-white mb-1">1.3K</h4>
                                        <p className="fs-14 mb-0">Following</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* end col */}
                    </div>
                    {/* end row */}
                </div>

                <div className="row">
                    <div className="col-lg-12">
                        <div>
                            <div className="d-flex profile-wrapper">
                                {/* Nav tabs */}
                                <ul className="nav nav-pills animation-nav profile-nav gap-2 gap-lg-3 flex-grow-1" role="tablist">
                                    <li className="nav-item">
                                        <a className="nav-link fs-14 active" data-bs-toggle="tab" role="tab">
                                            <i className="ri-airplay-fill d-inline-block d-md-none"></i>
                                            <span className="d-none d-md-inline-block">Overview</span>
                                        </a>
                                    </li>
                                </ul>
                                <div className="flex-shrink-0">
                                    <a href="pages-profile-settings.html" className="btn btn-info">
                                        <i className="ri-edit-box-line align-bottom"></i> Print
                                    </a>
                                </div>
                            </div>
                            {/* Tab panes */}
                            <div className="tab-content pt-4 text-muted">
                                <div className="tab-pane active" id="overview-tab" role="tabpanel">
                                    <div className="row">
                                        <div className="col-xxl-3">
                                            <div className="card">
                                                <div className="card-body">
                                                    <div class="d-flex align-items-center mb-4">
                                                        <h5 class="card-title flex-grow-1 mb-0">Personal Information</h5>
                                                        <div class="flex-shrink-0">
                                                            <input class="form-control d-none" type="file" id="formFile" />
                                                            <label for="formFile" class="btn btn-info">
                                                                <i class="ri-upload-2-fill me-1 align-bottom"></i> Edit
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="table-responsive">
                                                            <table className="table table-borderless mb-0">
                                                                <tbody>
                                                                    <tr>
                                                                        <th className="ps-0" scope="row">Full Name :</th>
                                                                        <td className="text-muted">Anna Adame Anade</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th className="ps-0" scope="row">Alias :</th>
                                                                        <td className="text-muted">Bisco</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th className="ps-0" scope="row">Mobile :</th>
                                                                        <td className="text-muted">+(234) 987 6543</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th className="ps-0" scope="row">E-mail :</th>
                                                                        <td className="text-muted">daveadame@velzon.com</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th className="ps-0" scope="row">Gender :</th>
                                                                        <td className="text-muted">Male</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th className="ps-0" scope="row">DOB :</th>
                                                                        <td className="text-muted">24 Nov 2021</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <th className="ps-0" scope="row">Marital Status :</th>
                                                                        <td className="text-muted">Single</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                   
                                                </div>
                                                {/* end card body */}
                                            </div>
                                            {/* end card */}

                                            <div className="card">
                                                <div className="card-body">
                                                    <h5 className="card-title mb-3">Technical Information</h5>
                                                    <div className="row">
                                                        <div className="col-6 col-md-4">
                                                            <div className="d-flex mt-4">
                                                                <div className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                    <div className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                        <i className="ri-git-repository-fill"></i>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-grow-1 overflow-hidden">
                                                                    <p className="mb-1">Passport Number :</p>
                                                                    <h6 className="text-truncate mb-0">AA100002U</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* end col */}
                                                        <div className="col-6 col-md-4">
                                                            <div className="d-flex mt-4">
                                                                <div className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                    <div className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                        <i className="ri-file-hwp-line"></i>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-grow-1 overflow-hidden">
                                                                    <p className="mb-1">Other ID Number :</p>
                                                                    <h6 className="text-truncate">BB78U387</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* end col */}
                                                        <div className="col-6 col-md-4">
                                                            <div className="d-flex mt-4">
                                                                <div className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                    <div className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                        <i className="ri-guide-line"></i>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-grow-1 overflow-hidden">
                                                                    <p className="mb-1">Affiliation :</p>
                                                                    <h6 className="fw-semibold">BZ</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* end col */}
                                                        <div className="col-6 col-md-4">
                                                            <div className="d-flex mt-4">
                                                                <div className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                    <div className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                        <i className="ri-user-2-fill"></i>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-grow-1 overflow-hidden">
                                                                    <p className="mb-1">Role :</p>
                                                                    <h6 className="fw-semibold">Spokesperson</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* end col */}
                                                        <div className="col-6 col-md-4">
                                                            <div className="d-flex mt-4">
                                                                <div className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                    <div className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                        <i className="ri-stack-fill"></i>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-grow-1 overflow-hidden">
                                                                    <p className="mb-1">Category :</p>
                                                                    <h6 className="fw-semibold">Group</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* end col */}
                                                        <div className="col-6 col-md-4">
                                                            <div className="d-flex mt-4">
                                                                <div className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                    <div className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                        <i className="ri-chat-1-fill"></i>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-grow-1 overflow-hidden">
                                                                    <p className="mb-1">Source :</p>
                                                                    <h6 className="fw-semibold">News Paper</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* end col */}
                                                        <div className="col-6 col-md-4">
                                                            <div className="d-flex mt-4">
                                                                <div className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                    <div className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                        <i className="ri-flag-line"></i>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-grow-1 overflow-hidden">
                                                                    <p className="mb-1">Country :</p>
                                                                    <h6 className="fw-semibold">Nigeria</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* end col */}
                                                        <div className="col-6 col-md-4">
                                                            <div className="d-flex mt-4">
                                                                <div className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                    <div className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                        <i className="ri-global-line"></i>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-grow-1 overflow-hidden">
                                                                    <p className="mb-1">State :</p>
                                                                    <h6 className="fw-semibold">Enugu</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* end col */}
                                                        <div className="col-6 col-md-4">
                                                            <div className="d-flex mt-4">
                                                                <div className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                    <div className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                        <i className="ri-global-line"></i>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-grow-1 overflow-hidden">
                                                                    <p className="mb-1">Address :</p>
                                                                    <h6 className="fw-semibold">112 Nike Street</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* end col */}
                                                        <div className="col-6 col-md-4">
                                                            <div className="d-flex mt-4">
                                                                <div className="flex-shrink-0 avatar-xs align-self-center me-3">
                                                                    <div className="avatar-title bg-light rounded-circle fs-16 text-primary">
                                                                        <i className="ri-chat-smile-3-line"></i>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-grow-1 overflow-hidden">
                                                                    <p className="mb-1">Remark :</p>
                                                                    <h6 className="fw-semibold">This is just a test remark</h6>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* end col */}
                                                    </div>
                                                    {/* end row */}
                                                </div>
                                                {/* end card-body */}
                                            </div>
                                            {/* end card */}

                                            <div className="card">
                                                <div className="card-body">
                                                    <div class="d-flex align-items-center mb-4">
                                                        <h5 class="card-title flex-grow-1 mb-0">Crime Committed</h5>
                                                        <div class="flex-shrink-0">
                                                            <input class="form-control d-none" type="file" id="formFile" />
                                                            <label for="formFile" class="btn btn-danger">
                                                                <i class="ri-upload-2-fill me-1 align-bottom"></i> Add
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-xxl-3 col-sm-4">
                                                            <div className="card profile-project-card shadow-none profile-project-warning">
                                                                <div className="card-body p-4">
                                                                    <div className="d-flex">
                                                                        <div className="flex-grow-1 text-muted overflow-hidden">
                                                                            <h5 className="fs-14 text-truncate"><a href="#" className="text-body">Kidnapping Children</a></h5>
                                                                            <p className="text-muted text-truncate mb-0">Crime Date : <span className="fw-semibold text-body">2 year Ago</span></p>
                                                                            <p className="text-muted text-truncate mb-0">Casualties Recorded : <span className="fw-semibold text-body">50</span></p>
                                                                            <p className="text-muted text-truncate mb-0">Arresting Body : <span className="fw-semibold text-body">APS</span></p>
                                                                            <p className="text-muted text-truncate mb-0">Place Of Detention : <span className="fw-semibold text-body">San Jose</span></p>
                                                                            <p className="text-muted text-truncate mb-0">Action Taken : <span className="fw-semibold text-body">2 year Ago</span></p>
                                                                        </div>
                                                                        <div className="flex-shrink-0 ms-2">
                                                                            <div className="badge bg-warning-subtle text-warning fs-10">Terrorism</div>
                                                                        </div>
                                                                    </div>

                                                                    {/* <div className="d-flex mt-4">
                                                                        <div className="flex-grow-1">
                                                                            <div className="d-flex align-items-center gap-2">
                                                                                <div>
                                                                                    <h5 className="fs-12 text-muted mb-0">Members :</h5>
                                                                                </div>
                                                                                <div className="avatar-group">
                                                                                    <div className="avatar-group-item">
                                                                                        <div className="avatar-xs">
                                                                                            <img src="assets/images/users/avatar-1.jpg" alt="" className="rounded-circle img-fluid" />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="avatar-group-item">
                                                                                        <div className="avatar-xs">
                                                                                            <img src="assets/images/users/avatar-3.jpg" alt="" className="rounded-circle img-fluid" />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="avatar-group-item">
                                                                                        <div className="avatar-xs">
                                                                                            <div className="avatar-title rounded-circle bg-light text-primary">
                                                                                                J
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div> */}
                                                                </div>
                                                                {/* end card body */}
                                                            </div>
                                                            {/* end card */}
                                                        </div>
                                                        {/* end col */}
                                                        <div className="col-xxl-3 col-sm-4">
                                                            <div className="card profile-project-card shadow-none profile-project-danger">
                                                                <div className="card-body p-4">
                                                                    <div className="d-flex">
                                                                        <div className="flex-grow-1 text-muted overflow-hidden">
                                                                            <h5 className="fs-14 text-truncate"><a href="#" className="text-body">Kidnapping Children</a></h5>
                                                                            <p className="text-muted text-truncate mb-0">Crime Date : <span className="fw-semibold text-body">2 year Ago</span></p>
                                                                            <p className="text-muted text-truncate mb-0">Casualties Recorded : <span className="fw-semibold text-body">50</span></p>
                                                                            <p className="text-muted text-truncate mb-0">Arresting Body : <span className="fw-semibold text-body">APS</span></p>
                                                                            <p className="text-muted text-truncate mb-0">Place Of Detention : <span className="fw-semibold text-body">San Jose</span></p>
                                                                            <p className="text-muted text-truncate mb-0">Action Taken : <span className="fw-semibold text-body">2 year Ago</span></p>
                                                                        </div>
                                                                        <div className="flex-shrink-0 ms-2">
                                                                            <div className="badge bg-warning-subtle text-warning fs-10">Terrorism</div>
                                                                        </div>
                                                                    </div>

                                                                    {/* <div className="d-flex mt-4">
                                                                        <div className="flex-grow-1">
                                                                            <div className="d-flex align-items-center gap-2">
                                                                                <div>
                                                                                    <h5 className="fs-12 text-muted mb-0">Members :</h5>
                                                                                </div>
                                                                                <div className="avatar-group">
                                                                                    <div className="avatar-group-item">
                                                                                        <div className="avatar-xs">
                                                                                            <img src="assets/images/users/avatar-1.jpg" alt="" className="rounded-circle img-fluid" />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="avatar-group-item">
                                                                                        <div className="avatar-xs">
                                                                                            <img src="assets/images/users/avatar-3.jpg" alt="" className="rounded-circle img-fluid" />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="avatar-group-item">
                                                                                        <div className="avatar-xs">
                                                                                            <div className="avatar-title rounded-circle bg-light text-primary">
                                                                                                J
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div> */}
                                                                </div>
                                                                {/* end card body */}
                                                            </div>
                                                            {/* end card */}
                                                        </div>
                                                        {/* end col */}
                                                        <div className="col-xxl-3 col-sm-4">
                                                            <div className="card profile-project-card shadow-none profile-project-success">
                                                                <div className="card-body p-4">
                                                                    <div className="d-flex">
                                                                        <div className="flex-grow-1 text-muted overflow-hidden">
                                                                            <h5 className="fs-14 text-truncate"><a href="#" className="text-body">Stealing of 2000 Create Of Eggs</a></h5>
                                                                            <p className="text-muted text-truncate mb-0">Crime Date : <span className="fw-semibold text-body">2 year Ago</span></p>
                                                                            <p className="text-muted text-truncate mb-0">Casualties Recorded : <span className="fw-semibold text-body">50</span></p>
                                                                            <p className="text-muted text-truncate mb-0">Arresting Body : <span className="fw-semibold text-body">APS</span></p>
                                                                            <p className="text-muted text-truncate mb-0">Place Of Detention : <span className="fw-semibold text-body">San Jose</span></p>
                                                                            <p className="text-muted text-truncate mb-0">Action Taken : <span className="fw-semibold text-body">2 year Ago</span></p>
                                                                        </div>
                                                                        <div className="flex-shrink-0 ms-2">
                                                                            <div className="badge bg-warning-subtle text-warning fs-10">Banditry</div>
                                                                        </div>
                                                                    </div>

                                                                    {/* <div className="d-flex mt-4">
                                                                        <div className="flex-grow-1">
                                                                            <div className="d-flex align-items-center gap-2">
                                                                                <div>
                                                                                    <h5 className="fs-12 text-muted mb-0">Members :</h5>
                                                                                </div>
                                                                                <div className="avatar-group">
                                                                                    <div className="avatar-group-item">
                                                                                        <div className="avatar-xs">
                                                                                            <img src="assets/images/users/avatar-1.jpg" alt="" className="rounded-circle img-fluid" />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="avatar-group-item">
                                                                                        <div className="avatar-xs">
                                                                                            <img src="assets/images/users/avatar-3.jpg" alt="" className="rounded-circle img-fluid" />
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="avatar-group-item">
                                                                                        <div className="avatar-xs">
                                                                                            <div className="avatar-title rounded-circle bg-light text-primary">
                                                                                                J
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div> */}
                                                                </div>
                                                                {/* end card body */}
                                                            </div>
                                                            {/* end card */}
                                                        </div>
                                                        {/* end col */}
                                                    </div>
                                                    {/* end row */}
                                                </div>
                                                {/* end card-body */}
                                            </div>
                                            {/* end card */}

                                            <MediaAndDocument />

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
};

export default ViewPoi;
