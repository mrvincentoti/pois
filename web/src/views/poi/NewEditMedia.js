import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from 'antd';
import { Form, Field } from 'react-final-form';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import Select from 'react-select';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';

const NewEditMedia = ({ isModalOpen, handleOk, handleCancel, data, modalType }) => {
    const [sources, setSources] = useState([]);
    const [crimeDate, setcrimeDate] = useState('');
    const [arrestingBody, setArrestingBody] = useState([]);

    const onSubmit = async values => {
        console.log(values)
    };

    return (
        <Modal
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
        >
            <div className="container-fluid">
                <div className="row">
                    <Form
                        initialValues={{}}
                        onSubmit={onSubmit}
                        validate={values => {
                            const errors = {};

                            return errors;
                        }}

                        render={({ handleSubmit, submitError, submitting, form }) => (
                            <FormWrapper onSubmit={handleSubmit} submitting={submitting}>
                                <div className="row">
                                    <div className="col-lg-12">
                                        <FormSubmitError error={submitError} />
                                    </div>
                                    {modalType === 'add' ?
                                        <div className="col-lg-12">
                                            <div className="card mt-3">
                                                <div className="card-header">
                                                    <h5 className="card-title mb-0">{modalType === 'add' ? 'Upload Media' : 'Edit Media'}</h5>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-lg-12 mb-3">
                                                            <label className="form-label" htmlFor="media_caption">
                                                                Media Caption <span style={{ color: 'red' }}>*</span>
                                                            </label>
                                                            <Field id="media_caption" name="media_caption">
                                                                {({ input, meta }) => (
                                                                    <input
                                                                        {...input}
                                                                        type="number"
                                                                        className={`form-control ${error(meta)}`}
                                                                        id="media_caption"
                                                                        placeholder="Media Caption"
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorBlock name="media_caption" />
                                                        </div>

                                                        <div className="col-lg-12 mb-3">
                                                            <label className="form-label" htmlFor="media_type">
                                                                Media Type <span style={{ color: 'red' }}>*</span>
                                                            </label>
                                                            <Field id="media_type" name="media_type">
                                                                {({ input, meta }) => (
                                                                    <Select
                                                                        {...input}
                                                                        className={error(meta)}
                                                                        placeholder="Select Type"
                                                                        options={sources}
                                                                        getOptionValue={option => option.id}
                                                                        getOptionLabel={option => option.name}
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorBlock name="media_type" />
                                                        </div>

                                                        <div className="col-lg-12 mb-3">
                                                            <label className="form-label" htmlFor="media_url">
                                                                Media Url <span style={{ color: 'red' }}>*</span>
                                                            </label>
                                                            <Field id="media_url" name="media_url">
                                                                {({ input, meta }) => (
                                                                    <input
                                                                        {...input}
                                                                        type="number"
                                                                        className={`form-control ${error(meta)}`}
                                                                        id="media_url"
                                                                        placeholder="Media Url"
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorBlock name="casualties_recorded" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        <div className="col-lg-12">
                                            <div className="card mt-3">
                                                <div className="card-header">
                                                    <h5 className="card-title mb-0">{modalType === 'add' ? 'Upload Media' : 'Edit Media'}</h5>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-lg-12 mb-3">
                                                            <label className="form-label" htmlFor="media_caption">
                                                                Media Caption <span style={{ color: 'red' }}>*</span>
                                                            </label>
                                                            <Field id="media_caption" name="media_caption">
                                                                {({ input, meta }) => (
                                                                    <input
                                                                        {...input}
                                                                        type="number"
                                                                        className={`form-control ${error(meta)}`}
                                                                        id="media_caption"
                                                                        placeholder="Media Caption"
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorBlock name="media_caption" />
                                                        </div>

                                                        <div className="col-lg-12 mb-3">
                                                            <label className="form-label" htmlFor="media_type">
                                                                Media Type <span style={{ color: 'red' }}>*</span>
                                                            </label>
                                                            <Field id="media_type" name="media_type">
                                                                {({ input, meta }) => (
                                                                    <Select
                                                                        {...input}
                                                                        className={error(meta)}
                                                                        placeholder="Select Type"
                                                                        options={sources}
                                                                        getOptionValue={option => option.id}
                                                                        getOptionLabel={option => option.name}
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorBlock name="media_type" />
                                                        </div>

                                                        <div className="col-lg-12 mb-3">
                                                            <label className="form-label" htmlFor="media_url">
                                                                Media Url <span style={{ color: 'red' }}>*</span>
                                                            </label>
                                                            <Field id="media_url" name="media_url">
                                                                {({ input, meta }) => (
                                                                    <input
                                                                        {...input}
                                                                        type="number"
                                                                        className={`form-control ${error(meta)}`}
                                                                        id="media_url"
                                                                        placeholder="Media Url"
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorBlock name="casualties_recorded" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </FormWrapper>
                        )}
                    />
                </div>
                {/* <p>{modalType === 'add' ? 'Add new item here' : 'Edit the item'}</p>
                <p>{data}</p> */}
            </div>
        </Modal>
    );
};

export default NewEditMedia;
