import React, { useState } from 'react';
import DocumentMediaDropDown from '../../components/DocumentMediaDropDown';
import NewEditMedia from './NewEditMedia';


const routes = {
    view: '/view/123',
    download: '/download/123',
    delete: '/delete/123'
};


const MediaAndDocument = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState("");
    const [modalType, setModalType] = useState("");

    const showModal = (type, data = "") => {
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
                    <div className="d-flex align-items-center mb-4">
                        <h5 className="card-title flex-grow-1 mb-0">Media/Documents</h5>
                        <div class="flex-shrink-0" onClick={() => showModal('add')}>
                            <label for="formFile" class="btn btn-success">
                                <i className=" ri-upload-cloud-2-line me-1 align-bottom"></i> Upload File
                            </label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="table-responsive">
                                <table className="table table-borderless align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">File Name</th>
                                            <th scope="col">Type</th>
                                            <th scope="col">Size</th>
                                            <th scope="col">Upload Date</th>
                                            <th scope="col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-sm">
                                                        <div className="avatar-title bg-primary-subtle text-primary rounded fs-20">
                                                            <i className="ri-file-zip-fill"></i>
                                                        </div>
                                                    </div>
                                                    <div className="ms-3 flex-grow-1">
                                                        <h6 className="fs-15 mb-0"><a href="javascript:void(0)">Artboard-documents.zip</a>
                                                        </h6>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>Zip File</td>
                                            <td>4.57 MB</td>
                                            <td>12 Dec 2021</td>
                                            <td>
                                                {/* <DocumentMediaDropDown routes={routes} /> */}
                                                <div class="flex-shrink-0" onClick={() => showModal('edit')}>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-pencil-fill me-1 align-bottom" style={{ fontSize: '20px' }}></i>
                                                    </a>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-download-cloud-2-line me-2 align-middle" style={{ fontSize: '20px', color: '#0eb29c' }}></i>
                                                    </a>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-delete-bin-line me-2 align-middle" style={{ fontSize: '20px', color: '#f06548' }}></i>
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-sm">
                                                        <div className="avatar-title bg-danger-subtle text-danger rounded fs-20">
                                                            <i className="ri-file-pdf-fill"></i>
                                                        </div>
                                                    </div>
                                                    <div className="ms-3 flex-grow-1">
                                                        <h6 className="fs-15 mb-0"><a href="javascript:void(0);">Bank Management System</a></h6>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>PDF File</td>
                                            <td>8.89 MB</td>
                                            <td>24 Nov 2021</td>
                                            <td>
                                                <div class="flex-shrink-0" onClick={() => showModal('edit')}>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-pencil-fill me-1 align-bottom" style={{ fontSize: '20px' }}></i>
                                                    </a>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-download-cloud-2-line me-2 align-middle" style={{ fontSize: '20px', color: '#0eb29c' }}></i>
                                                    </a>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-delete-bin-line me-2 align-middle" style={{ fontSize: '20px', color: '#f06548' }}></i>
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-sm">
                                                        <div className="avatar-title bg-secondary-subtle text-secondary rounded fs-20">
                                                            <i className="ri-video-line"></i>
                                                        </div>
                                                    </div>
                                                    <div className="ms-3 flex-grow-1">
                                                        <h6 className="fs-15 mb-0"><a href="javascript:void(0);">Tour-video.mp4</a></h6>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>MP4 File</td>
                                            <td>14.62 MB</td>
                                            <td>19 Nov 2021</td>
                                            <td>
                                                <div class="flex-shrink-0" onClick={() => showModal('edit')}>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-pencil-fill me-1 align-bottom" style={{ fontSize: '20px' }}></i>
                                                    </a>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-download-cloud-2-line me-2 align-middle" style={{ fontSize: '20px', color: '#0eb29c' }}></i>
                                                    </a>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-delete-bin-line me-2 align-middle" style={{ fontSize: '20px', color: '#f06548' }}></i>
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-sm">
                                                        <div className="avatar-title bg-success-subtle text-success rounded fs-20">
                                                            <i className="ri-file-excel-fill"></i>
                                                        </div>
                                                    </div>
                                                    <div className="ms-3 flex-grow-1">
                                                        <h6 className="fs-15 mb-0"><a href="javascript:void(0);">Account-statement.xsl</a></h6>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>XSL File</td>
                                            <td>2.38 KB</td>
                                            <td>14 Nov 2021</td>
                                            <td>
                                                <div class="flex-shrink-0" onClick={() => showModal('edit')}>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-pencil-fill me-1 align-bottom" style={{ fontSize: '20px' }}></i>
                                                    </a>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-download-cloud-2-line me-2 align-middle" style={{ fontSize: '20px', color: '#0eb29c' }}></i>
                                                    </a>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-delete-bin-line me-2 align-middle" style={{ fontSize: '20px', color: '#f06548' }}></i>
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-sm">
                                                        <div className="avatar-title bg-info-subtle text-info rounded fs-20">
                                                            <i className="ri-folder-line"></i>
                                                        </div>
                                                    </div>
                                                    <div className="ms-3 flex-grow-1">
                                                        <h6 className="fs-15 mb-0"><a href="javascript:void(0);">Project Screenshots Collection</a></h6>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>Floder File</td>
                                            <td>87.24 MB</td>
                                            <td>08 Nov 2021</td>
                                            <td>
                                                <div class="flex-shrink-0" onClick={() => showModal('edit')}>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-pencil-fill me-1 align-bottom" style={{ fontSize: '20px' }}></i>
                                                    </a>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-download-cloud-2-line me-2 align-middle" style={{ fontSize: '20px', color: '#0eb29c' }}></i>
                                                    </a>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-delete-bin-line me-2 align-middle" style={{ fontSize: '20px', color: '#f06548' }}></i>
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    <div className="avatar-sm">
                                                        <div className="avatar-title bg-danger-subtle text-danger rounded fs-20">
                                                            <i className="ri-image-2-fill"></i>
                                                        </div>
                                                    </div>
                                                    <div className="ms-3 flex-grow-1">
                                                        <h6 className="fs-15 mb-0">
                                                            <a href="javascript:void(0);">Velzon-logo.png</a>
                                                        </h6>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>PNG File</td>
                                            <td>879 KB</td>
                                            <td>02 Nov 2021</td>
                                            <td>
                                                <div class="flex-shrink-0" onClick={() => showModal('edit')}>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-pencil-fill me-1 align-bottom" style={{ fontSize: '20px' }}></i>
                                                    </a>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-download-cloud-2-line me-2 align-middle" style={{ fontSize: '20px', color: '#0eb29c' }}></i>
                                                    </a>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-delete-bin-line me-2 align-middle" style={{ fontSize: '20px', color: '#f06548' }}></i>
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            {/* <div className="text-center mt-3">
                            <a href="javascript:void(0);" className="text-success"><i className="mdi mdi-loading mdi-spin fs-20 align-middle me-2"></i> Load more </a>
                        </div> */}
                        </div>
                    </div>
                </div>
            </div>
        
            <NewEditMedia
            isModalOpen={isModalOpen}
            handleOk={handleOk}
            handleCancel={handleCancel}
            data={modalData}
            modalType={modalType}
        />
        </>
    );
};

export default MediaAndDocument;
