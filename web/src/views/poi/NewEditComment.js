import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal } from 'antd';
import { Form, Field } from 'react-final-form';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import Select from 'react-select';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import ModalWrapper from '../../container/ModalWrapper';
import { formatPoiName, notifyWithIcon, request } from '../../services/utilities';
import { FORM_ERROR } from 'final-form';

import { CREATE_ACTIVITIES_API, UPDATE_ACTIVITIES_API } from '../../services/api';

const NewEditComment = ({ closeModal, data, update}) => {
    const [loaded, setLoaded] = useState(false);
    const [activityDate, setActivityDate] = useState(null);
    const [comment, setComment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const params = useParams();

    const onSubmit = async values => {
        try {
            const config = {
                method: data ? 'PUT' : 'POST',
                body: {
                    ...values,
                    poi_id: params.id,
                    comment: values.comment || null,
                    deleted_at: undefined,
                },
            };
            const uri = CREATE_ACTIVITIES_API;
            const rs = await request(uri, config);
            notifyWithIcon('success', rs.message);
            update();
            closeModal();
        } catch (e) {
            console.error(e); // This logs the actual error object in the console
            // Check if it's an object, then extract a meaningful message
            const errorMessage = e.message || 'Something went wrong';
            return {
                [FORM_ERROR]: e.message || 'could not create crime',
            };
        }
    };

    return (
        <ModalWrapper
            title={`${data ? 'Add' : 'Edit'} Activity`}
            closeModal={closeModal}
        >
            <Form
                initialValues={{ ...data, poi_id: data?.poi_id }}
                onSubmit={onSubmit}
                validate={values => {
                    const errors = {};
                    // if (!values.employee_id) {
                    // 	errors.employee_id = 'select employee';
                    // }
                    // if (!values.award_id) {
                    // 	errors.award_id = 'select award';
                    // }
                    // if (values.type === 2 && !values.implication_id) {
                    // 	errors.implication_id = 'select implication';
                    // }
                    // if (!values.reason) {
                    // 	errors.reason = 'select reason';
                    // }
                    // if (!values.date_given) {
                    // 	errors.date_given = 'select date_given';
                    // }

                    return errors;
                }}
                render={({ handleSubmit, submitError, submitting }) => (
                    <FormWrapper onSubmit={handleSubmit} submitting={submitting}>
                        <div className="modal-body">
                            <FormSubmitError error={submitError} />
                            <div className="row g-3">
                                <div className="col-lg-12">
                                    <label htmlFor="activity_date" className="form-label">
                                        Activity Date
                                    </label>
                                    <Field id="activity_date" name="activity_date">
                                        {({ input, meta }) => (
                                            <Flatpickr
                                                className={`form-control ${error(meta)}`}
                                                placeholder="Select date of activity"
                                                value={activityDate}
                                                defaultValue={activityDate}
                                                onChange={([date]) => {
                                                    input.onChange(moment(date).format('YYYY-MM-DD'));
                                                    setActivityDate(date);
                                                }}
                                            />
                                        )}
                                    </Field>
                                    <ErrorBlock name="activity_date" />
                                </div>

                                <div className="col-lg-12">
                                    <label htmlFor="comment" className="form-label">
                                        Comment
                                    </label>
                                    <Field id="comment" name="comment">
                                        {({ input, meta }) => (
                                            <textarea
                                                {...input}
                                                type="text"
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
                        <div className="modal-footer">
                            <div className="hstack gap-2 justify-content-end">
                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={submitting}
                                >
                                    {`${data ? 'Update' : 'Add'} Activity`}
                                </button>
                            </div>
                        </div>
                    </FormWrapper>
                )}
            />
        </ModalWrapper>
    );
};

export default NewEditComment;
