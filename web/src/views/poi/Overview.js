import React from 'react';
import DocumentMediaDropDown from '../../components/DocumentMediaDropDown';



const Overview = () => {
    return (
        <>
            <div className="card">
                <div className="card-body">
                    <div class="d-flex align-items-center mb-4">
                        <h5 class="card-title flex-grow-1 mb-0">Personal Information</h5>
                        <div class="flex-shrink-0">
                            <input class="form-control d-none" type="file" id="formFile" />
                            <label for="formFile" class="btn btn-info">
                                <i class="ri-pencil-line me-1 align-bottom"></i> Edit
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
        </>
    );
};

export default Overview;
