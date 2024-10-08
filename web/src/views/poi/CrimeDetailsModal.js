import React, { useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import Select from 'react-select';
import ModalWrapper from '../../container/ModalWrapper';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import { notifyWithIcon, request, createHeaders } from '../../services/utilities';
import testMedia from '../../assets/images/users/avatar-1.jpg';
import {
    CREATE_MEDIA_API,
    UPDATE_MEDIA_API,
    FETCH_MEDIA_API,
    FETCH_CRIMES_API, // Import the API for fetching crimes
} from '../../services/api';
import { Button, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const CrimeDetailsModal = ({ id, closeModal, update, media, crimeCommitted }) => {
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [crime, setCrime] = useState(null); // Store the selected crime
    const [crimesOptions, setCrimesOptions] = useState([]); // Store crime options
    const params = useParams();

    useEffect(() => {
        loadCrimes(); // Load crimes when component mounts
    }, []);

    const loadCrimes = async () => {
        const rs = await request(FETCH_CRIMES_API);
        setCrimesOptions(rs?.crimes || []); // Set crimes options for the Select input
    };

    const onSubmit = async values => {
        try {

            const crime_committed_id = crimeCommitted?.id;
            const formData = new FormData();
            formData.append('file', fileList[0]);
            formData.append('media_caption', values.caption);
            formData.append('crime_id', crime_committed_id);

            // for (let pair of formData.entries()) {
            // 	console.log(`${pair[0]}: ${pair[1]}`);
            // }

            // return

            const uri = media
                ? UPDATE_MEDIA_API.replace(':id', id)
                : CREATE_MEDIA_API.replace(':id', id);

            const headers = createHeaders(true);
            const response = await fetch(uri, {
                method: 'POST',
                body: formData,
                headers: headers,
            });

            const data = await response.json();

            if (data.error) {
                let errorMessage = data.error;

                notifyWithIcon('error', errorMessage);
            } else {
                notifyWithIcon('success', ' uploaded successfully');
            }

            update();
            closeModal();
        } catch (e) {
            return {
                [FORM_ERROR]: e.message || 'Could not save media',
            };
        }
    };

    const props = {
        maxCount: 1,
        onRemove: file => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: file => {
            setFileList([file]);
        },
        fileList,
    };

    return (
        <div
            className="modal fade bs-example-modal-lg show"
            tabIndex={-1}
            role="dialog"
            aria-labelledby="myLargeModalLabel"
            aria-modal="true"
            style={{ display: "block", paddingLeft: 0 }}
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="myLargeModalLabel">
                            {crimeCommitted?.crime.name}-{(crimeCommitted?.crime_date)}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            onClick={closeModal}
                        />
                    </div>
                    <div className="modal-body">
                        <h6 className="fs-15">Arms Recovered</h6>
                        <div className="d-flex">
                            <div className="flex-grow-1">
                                <div className="card-body">
                                    <>
                                        {/* Tables Border Colors */}
                                        <table className="table table-bordered border-secondary table-nowrap">
                                            <thead>
                                                <tr>
                                                    {/* <th scope="col">Id</th> */}
                                                    <th scope="col">Title</th>
                                                    <th scope="col">Date</th>
                                                    <th scope="col">Casualties</th>
                                                    <th scope="col">Arresting Body</th>
                                                    <th scope="col">Place Of Detention</th>
                                                    <th scope="col">Action Taken</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    {/* <th scope="row">{i + min}</th> */}
                                                    <td>{crimeCommitted?.crime.name || 'N/A'}</td>
                                                    <td>
                                                        <span className="badge bg-primary-subtle text-primary">{crimeCommitted?.crime_date || 'N/A'}</span>
                                                    </td>
                                                    <td>{crimeCommitted?.casualties_recorded || 'N/A'}</td>
                                                    <td>{crimeCommitted?.arresting_body.name || 'N/A'}</td>
                                                    <td>{crimeCommitted?.place_of_detention || 'N/A'}</td>
                                                    <td>{crimeCommitted?.action_taken || 'N/A'}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </>
                                </div>
                            </div>
                        </div>
                      
                        <h6 className="fs-16 my-3">Media</h6>
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-lg-4">
                                    <div className="gallery-container">
                                        <a className="image-popup" href="assets/images/small/img-1.jpg" title="">
                                            <img
                                                className="gallery-img img-fluid mx-auto"
                                                src={testMedia}
                                                alt=""
                                            />
                                            <div className="gallery-overlay">
                                                <h5 className="overlay-caption">Glasses and laptop from above</h5>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                                <div className="col-lg-4">
                                    <div className="gallery-container">
                                        <a className="image-popup" href="assets/images/small/img-1.jpg" title="">
                                            <img
                                                className="gallery-img img-fluid mx-auto"
                                                src={testMedia}
                                                alt=""
                                            />
                                            <div className="gallery-overlay">
                                                <h5 className="overlay-caption">Glasses and laptop from above</h5>
                                            </div>
                                        </a>
                                    </div>

                                </div>
                                <div className="col-lg-4">
                                    <div className="gallery-container">
                                        <a className="image-popup" href="assets/images/small/img-1.jpg" title="">
                                            <img
                                                className="gallery-img img-fluid mx-auto"
                                                src={testMedia}
                                                alt=""
                                            />
                                            <div className="gallery-overlay">
                                                <h5 className="overlay-caption">Glasses and laptop from above</h5>
                                            </div>
                                        </a>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <a
                            href="javascript:void(0);"
                            className="btn btn-link link-success fw-medium"
                            data-bs-dismiss="modal"
                            onClick={closeModal}
                        >
                            <i className="ri-close-line me-1 align-middle" /> Close
                        </a>
                        <button type="button" className="btn btn-primary ">
                            Save changes
                        </button>
                    </div>
                </div>
                {/* /.modal-content */}
            </div>
            {/* /.modal-dialog */}
        </div>
    );
};

export default CrimeDetailsModal;
