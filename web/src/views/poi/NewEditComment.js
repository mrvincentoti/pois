import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from 'antd';
import { Form, Field } from 'react-final-form';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import Select from 'react-select';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';

const NewEditComment = ({ isModalOpen, handleOk, handleCancel, data, modalType }) => {

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
                                                    <h5 className="card-title mb-0">{modalType === 'add' ? 'New Comment' : 'Edit Comment'}</h5>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-lg-12 mb-3">
                                                            <label className="form-label" htmlFor="comment">
                                                                Comment <span style={{ color: 'red' }}>*</span>
                                                            </label>
                                                            <Field id="comment" name="comment">
                                                                {({ input, meta }) => (
                                                                    <textarea
                                                                        {...input}
                                                                        className={`form-control ${error(meta)}`}
                                                                        id="comment"
                                                                        placeholder="Type your comment here"
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorBlock name="comment" />
                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        <div className="col-lg-12">
                                            <div className="card mt-3">
                                                <div className="card-header">
                                                    <h5 className="card-title mb-0">{modalType === 'add' ? 'New Comment' : 'Edit Comment'}</h5>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-lg-12 mb-3">
                                                            <label className="form-label" htmlFor="comment">
                                                                Comment <span style={{ color: 'red' }}>*</span>
                                                            </label>
                                                            <Field id="comment" name="comment">
                                                                {({ input, meta }) => (
                                                                    <textarea
                                                                        {...input}
                                                                        className={`form-control ${error(meta)}`}
                                                                        id="comment"
                                                                        placeholder="Type your comment here"
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorBlock name="comment" />
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
            </div>
        </Modal>
    );
};

export default NewEditComment;
