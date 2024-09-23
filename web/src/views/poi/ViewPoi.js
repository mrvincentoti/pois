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

import Overview from './Overview'; // Your components
import CrimeCommitted from './CrimeCommitted';
import MediaAndDocument from './MediaAndDocument';
import Activities from './Activities';

const ViewPoi = () => {
    const employeePrintRef = useRef();
    const [loaded, setLoaded] = useState(false);
    const [employeeData, setEmployeeData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');


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
        document.body.classList.add('print-mode');
        window.print();
        document.body.classList.remove('print-mode');
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
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
                                        <a
                                            className={`nav-link fs-14 ${activeTab === 'overview' ? 'active' : ''}`}
                                            onClick={() => handleTabClick('overview')}
                                            role="tab"
                                        >
                                            <i className="ri-airplay-fill d-inline-block d-md-none"></i>
                                            <span className="d-none d-md-inline-block">Overview</span>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a
                                            className={`nav-link fs-14 ${activeTab === 'crime' ? 'active' : ''}`}
                                            onClick={() => handleTabClick('crime')}
                                            role="tab"
                                        >
                                            <i className="ri-airplay-fill d-inline-block d-md-none"></i>
                                            <span className="d-none d-md-inline-block">Crime Committed</span>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a
                                            className={`nav-link fs-14 ${activeTab === 'media' ? 'active' : ''}`}
                                            onClick={() => handleTabClick('media')}
                                            role="tab"
                                        >
                                            <i className="ri-airplay-fill d-inline-block d-md-none"></i>
                                            <span className="d-none d-md-inline-block">Media/Document</span>
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a
                                            className={`nav-link fs-14 ${activeTab === 'activities' ? 'active' : ''}`}
                                            onClick={() => handleTabClick('activities')}
                                            role="tab"
                                        >
                                            <i className="ri-airplay-fill d-inline-block d-md-none"></i>
                                            <span className="d-none d-md-inline-block">Activities</span>
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
                                        <div className="col-xxl-12 col-lg-12">
                                            {activeTab === 'overview' && <Overview />}
                                            {activeTab === 'crime' && <CrimeCommitted />}
                                            {activeTab === 'media' && <MediaAndDocument />}
                                            {activeTab === 'activities' && <Activities />}
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
