import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Field } from 'react-final-form';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import { CREATE_ORG_ACTIVITIES_API, UPDATE_ORG_ACTIVITIES_API } from '../../services/api';
import { notifyWithIcon, request } from '../../services/utilities';
import ModalWrapper from '../../container/ModalWrapper';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import { FORM_ERROR } from 'final-form';

const NewEditComment = ({ closeModal, data, update }) => {
    const [activityDate, setActivityDate] = useState(null);
    const [comment, setComment] = useState('');
    const params = useParams();

    // Populate fields when editing an existing activity
    useEffect(() => {
        if (data) {
            setActivityDate(moment(data.activity_date).toDate()); // Convert to Date object
            setComment(data.comment);
        } else {
            setActivityDate(null);
            setComment('');
        }
    }, [data]);

    const onSubmit = async (values, form) => {
        try {
            const config = {
                method: data ? 'PUT' : 'POST',
                body: {
                    ...values,
                    org_id: params.id,
                    comment: values.comment || null,
                },
            };
            const uri = data ? `${UPDATE_ORG_ACTIVITIES_API}/${data.id}` : CREATE_ORG_ACTIVITIES_API;
            const rs = await request(uri, config);
            notifyWithIcon('success', rs.message);
            Object.keys(values).forEach(key => {
                form.change(key, undefined);
            });
            update();
            closeModal();
        } catch (e) {
            console.error(e);
            return {
                [FORM_ERROR]: e.message || 'Something went wrong',
            };
        }
    };

    return (
        <ModalWrapper
            title={`${data ? 'Edit' : 'Add'} Activity`}
            closeModal={closeModal}
        >
            <Form
                initialValues={{
                    activity_date: data ? moment(data.activity_date).format('YYYY-MM-DD') : '',
                    comment: data ? data.comment : '',
                    poi_id: params.id,
                }}
                onSubmit={onSubmit}
                validate={values => {
                    const errors = {};
                    if (!values.activity_date) {
                        errors.activity_date = 'Activity date is required';
                    }
                    if (!values.comment) {
                        errors.comment = 'Comment is required';
                    }
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
                                                placeholder="Select date and time of activity"
                                                value={activityDate}
                                                options={{
                                                    enableTime: true,   // Enable time selection
                                                    dateFormat: "Y-m-d H:i:S",  // Format to include date and time
                                                    time_24hr: true,    // 24-hour time format
                                                }}
                                                onChange={([date]) => {
                                                    // Ensure that date and time are correctly formatted
                                                    input.onChange(moment(date).format('YYYY-MM-DD HH:mm:ss'));
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
                                                className={`form-control ${error(meta)}`}
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