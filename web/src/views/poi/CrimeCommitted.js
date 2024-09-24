import React, { useState } from 'react';
import { Button } from 'antd';
import DocumentMediaDropDown from '../../components/DocumentMediaDropDown';
import NewEditCrime from './NewEditCrime';

const routes = {
	view: '/view/123',
	download: '/download/123',
	delete: '/delete/123',
};

const CrimeCommitted = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalData, setModalData] = useState('');
	const [modalType, setModalType] = useState('');

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
                <div class="d-flex align-items-center mb-4">
                    <h5 class="card-title flex-grow-1 mb-0">Crime Committed</h5>
                    <div class="flex-shrink-0" onClick={() => showModal('add')}>
                        <label for="formFile" class="btn btn-success">
                            <i class="ri-add-fill me-1 align-bottom"></i> Add
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
                                {/* Edit and Delete buttons */}
                                <div className="mt-3 d-flex justify-content-end gap-2">
                                        <button className="btn btn-sm btn-outline-primary" onClick={() => showModal('edit')}>Edit</button>
                                    
                                </div>
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
                                {/* Edit and Delete buttons */}
                                <div className="mt-3 d-flex justify-content-end gap-2">
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => showModal('add')}>Edit</button>
                                    
                                </div>
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
                                {/* Edit and Delete buttons */}
                                <div className="mt-3 d-flex justify-content-end gap-2">
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => showModal('add')}>Edit</button>
                                    
                                </div>
                            </div>
                            {/* end card body */}
                        </div>
                        {/* end card */}
                    </div>
                    {/* end col */}
                    <div className="col-xxl-3 col-sm-4">
                        <div className="card profile-project-card shadow-none profile-project-tertiary">
                            <div className="card-body p-4">
                                <div className="d-flex">
                                    <div className="flex-grow-1 text-muted overflow-hidden">
                                        <h5 className="fs-14 text-truncate">
                                            <a href="#" className="text-body">Stealing of 2000 Crates Of Eggs</a>
                                        </h5>
                                        <p className="text-muted text-truncate mb-0">Crime Date : <span className="fw-semibold text-body">2 year Ago</span></p>
                                        <p className="text-muted text-truncate mb-0">Casualties Recorded : <span className="fw-semibold text-body">50</span></p>
                                        <p className="text-muted text-truncate mb-0">Arresting Body : <span className="fw-semibold text-body">APS</span></p>
                                        <p className="text-muted text-truncate mb-0">Place Of Detention : <span className="fw-semibold text-body">San Jose</span></p>
                                        <p className="text-muted text-truncate mb-0">Action Taken : <span className="fw-semibold text-body">2 years Ago</span></p>
                                    </div>
                                    <div className="flex-shrink-0 ms-2">
                                        <div className="badge bg-warning-subtle text-warning fs-10">Banditry</div>
                                    </div>
                                </div>
                                {/* Edit and Delete buttons */}
                                <div className="mt-3 d-flex justify-content-end gap-2">
                                    <button className="btn btn-sm btn-outline-primary" onClick={() => showModal('add')}>Edit</button>
                                    
                                </div>
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
        <NewEditCrime
            isModalOpen={isModalOpen}
            handleOk={handleOk}
            handleCancel={handleCancel}
            data={modalData}
            modalType={modalType} // Pass the modal type to distinguish between Add/Edit
        />
        </>
    );
};

export default CrimeCommitted;
