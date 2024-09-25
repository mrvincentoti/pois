import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DocumentMediaDropDown from '../../components/DocumentMediaDropDown';
import NewEditComment from './NewEditComment';

import { FETCH_ACTIVITIES_API } from '../../services/api';
import {
    antIconSync,
    formatDate,
    formatDateWord,
    formatPoiName,
    formatGetInitialsName,
    notifyWithIcon,
    request,
    formatActivitiesDate,
    timeAgo
} from '../../services/utilities';
import Spin from 'antd/es/spin';

const routes = {
	view: '/view/123',
	download: '/download/123',
	delete: '/delete/123',
};

const Activities = () => {
    const [loaded, setLoaded] = useState(false);
    const [activitiesData, setActivitiesData] = useState(null);
    const [working, setWorking] = useState(false);
    const [activities, setActivities] = useState(null);

    const navigate = useNavigate();
    const params = useParams();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState('');
    const [modalType, setModalType] = useState('');

    const fetchActivitiesDetails = useCallback(async Id => {
        try {
            const rs = await request(FETCH_ACTIVITIES_API.replace(':id', Id));
            setActivitiesData(rs.activities);
        } catch (error) {
            throw error;
        }
    }, []);

    useEffect(() => {
        if (!loaded) {
            fetchActivitiesDetails(params.id)
                .then(_ => setLoaded(true))
                .catch(e => {
                    notifyWithIcon('error', e.message);
                    navigate('/not-found');
                });
        }
    }, [fetchActivitiesDetails, loaded, navigate, params.id, activitiesData]);

    const showModal = (type, data = '') => {
        setModalType(type);
        setModalData(data);
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="card">
                <div className="card-body">
                    <div class="d-flex align-items-center mb-2">
                        <h5 class="card-title flex-grow-1 mb-0">Activities</h5>
                        <div class="flex-shrink-0" onClick={() => showModal('add')}>
                            <label for="formFile" class="btn btn-success">
                                <i class="ri-add-fill me-1 align-bottom"></i> Add
                            </label>
                        </div>
                    </div>

                    <div class="row" style={{ background: '#f3f3f9' }}>
                        <div class="col-lg-12">
                            <div>
                                <div class="timeline">
                                    {loaded && activitiesData ? (
                                        activitiesData.map((item, i) => (
                                            <div className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`} key={i}>
                                                <i className="icon ri-stack-line"></i>
                                                <div className="date">{formatActivitiesDate(item.activity_date)}</div>
                                                <div className="content">
                                                    <div className="d-flex">
                                                        <div className="flex-shrink-0 avatar-xs acitivity-avatar" style={{ size: '20px' }}>
                                                            <div className="avatar-title bg-success-subtle text-success rounded-circle">
                                                                N
                                                            </div>
                                                        </div>
                                                        <div className="flex-grow-1 ms-3">
                                                            <h5 className="fs-15">@Erica245 <small className="text-muted fs-13 fw-normal">- {timeAgo(item.activity_date) }</small></h5>
                                                            <p className="text-muted mb-2">Wish someone a sincere ‘good luck in your new job’ with these sweet messages...</p>
                                                            <div className="hstack gap-2">
                                                                <a className="btn btn-sm btn-light"><span className="me-1">&#128293;</span> 19</a>
                                                                <a className="btn btn-sm btn-light"><span className="me-1">&#129321;</span> 22</a>
                                                            </div>
                                                            {/* Edit and Delete buttons */}
                                                            <div className="mt-3 d-flex justify-content-end gap-2">
                                                                <button className="btn btn-sm btn-outline-success" onClick={() => showModal('edit')}>Edit</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))

                                    ): (
                                        <div>
                                            <Spin spinning={true} indicator={antIconSync}>
                                                <div className="fetching" />
                                            </Spin>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <NewEditComment
                isModalOpen={isModalOpen}
                handleOk={handleOk}
                handleCancel={handleCancel}
                data={modalData}
                modalType={modalType}
            />
        </>
    );
};

export default Activities;
