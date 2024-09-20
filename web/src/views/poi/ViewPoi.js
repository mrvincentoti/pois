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
import { Button } from "antd";
import PoiPrint from "./PoiPrint";

const ViewPoi = () => {
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


    const handlePrint = () => {
        window.print();
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
                                                    <h5 className="card-title mb-3">Person Information</h5>
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
                                                                    <h6  className="fw-semibold">BZ</h6>
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
                                                                    <h6  className="fw-semibold">Spokesperson</h6>
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
                                                                    <h6  className="fw-semibold">Group</h6>
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
