import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Modal } from 'antd';
import { Form, Field } from 'react-final-form';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import Select from 'react-select';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';

const NewEditCrime = ({ isModalOpen, handleOk, handleCancel, data, modalType }) => {
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
                                                <h5 className="card-title mb-0">{modalType === 'add' ? 'New Crime Committed' : 'Edit Crime Committed'}</h5>
                                            </div>
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-lg-12 mb-3">
                                                        <label className="form-label" htmlFor="crime_id">
                                                            Crime Committed <span style={{ color: 'red' }}>*</span>
                                                        </label>
                                                        <Field id="crime_id" name="crime_id">
                                                            {({ input, meta }) => (
                                                                <Select
                                                                    {...input}
                                                                    className={error(meta)}
                                                                    placeholder="Select crime"
                                                                    options={sources}
                                                                    getOptionValue={option => option.id}
                                                                    getOptionLabel={option => option.name}
                                                                />
                                                            )}
                                                        </Field>
                                                        <ErrorBlock name="crime_id" />
                                                    </div>

                                                    <div className="col-lg-12 mb-3">
                                                        <label className="form-label" htmlFor="dob">
                                                            Crime Date{' '}
                                                            <span style={{ color: 'red' }}>*</span>
                                                        </label>
                                                        <Field id="crime_date" name="crime_date">
                                                            {({ input, meta }) => (
                                                                <Flatpickr
                                                                    className={`form-control ${error(meta)}`}
                                                                    options={{
                                                                        dateFormat: 'd M, Y',
                                                                        maxDate: new Date(),
                                                                    }}
                                                                    placeholder="Select crime date"
                                                                    value={crimeDate}
                                                                    onChange={([date]) => {
                                                                        input.onChange(
                                                                            moment(date).format('YYYY-MM-DD')
                                                                        );
                                                                        setcrimeDate(date);
                                                                    }}
                                                                />
                                                            )}
                                                        </Field>
                                                        <ErrorBlock name="crime_date" />
                                                    </div>

                                                    <div className="col-lg-12 mb-3">
                                                        <label className="form-label" htmlFor="casualties_recorded">
                                                            Casualties Recorded <span style={{ color: 'red' }}></span>
                                                        </label>
                                                        <Field id="casualties_recorded" name="casualties_recorded">
                                                            {({ input, meta }) => (
                                                                <input
                                                                    {...input}
                                                                    type="number"
                                                                    className={`form-control ${error(meta)}`}
                                                                    id="casualties_recorded"
                                                                    placeholder="Casualties Recorded"
                                                                />
                                                            )}
                                                        </Field>
                                                        <ErrorBlock name="casualties_recorded" />
                                                    </div>

                                                    <div className="col-lg-12 mb-3">
                                                        <label className="form-label" htmlFor="arresting_body">
                                                            Arresting Body <span style={{ color: 'red' }}>*</span>
                                                        </label>
                                                        <Field id="arresting_body" name="arresting_body">
                                                            {({ input, meta }) => (
                                                                <Select
                                                                    {...input}
                                                                    className={error(meta)}
                                                                    placeholder="Select arresting body"
                                                                    options={arrestingBody}
                                                                    getOptionValue={option => option.id}
                                                                    getOptionLabel={option => option.name}
                                                                />
                                                            )}
                                                        </Field>
                                                        <ErrorBlock name="arresting_body" />
                                                    </div>

                                                    <div className="col-lg-12 mb-3">
                                                        <label className="form-label" htmlFor="place_of_detention">
                                                            Place Of Detention <span style={{ color: 'red' }}></span>
                                                        </label>
                                                        <Field id="place_of_detention" name="place_of_detention">
                                                            {({ input, meta }) => (
                                                                <input
                                                                    {...input}
                                                                    type="text"
                                                                    className={`form-control ${error(meta)}`}
                                                                    id="place_of_detention"
                                                                    placeholder="Place Of Detention"
                                                                />
                                                            )}
                                                        </Field>
                                                        <ErrorBlock name="place_of_detention" />
                                                    </div>

                                                    <div className="col-lg-12 mb-3">
                                                        <label className="form-label" htmlFor="action_taken">
                                                            Action Taken <span style={{ color: 'red' }}></span>
                                                        </label>
                                                        <Field id="action_taken" name="action_taken">
                                                            {({ input, meta }) => (
                                                                <input
                                                                    {...input}
                                                                    type="text"
                                                                    className={`form-control ${error(meta)}`}
                                                                    id="action_taken"
                                                                    placeholder="Action Taken"
                                                                />
                                                            )}
                                                        </Field>
                                                        <ErrorBlock name="action_taken" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        </div>
                                        :
                                        <div className="col-lg-12">
                                            <div className="card mt-3">
                                                <div className="card-header">
                                                    <h5 className="card-title mb-0">{modalType === 'add' ? 'New Crime Committed' : 'Edit Crime Committed'}</h5>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-lg-12 mb-3">
                                                            <label className="form-label" htmlFor="crime_id">
                                                                Crime Committed <span style={{ color: 'red' }}>*</span>
                                                            </label>
                                                            <Field id="crime_id" name="crime_id">
                                                                {({ input, meta }) => (
                                                                    <Select
                                                                        {...input}
                                                                        className={error(meta)}
                                                                        placeholder="Select crime"
                                                                        options={sources}
                                                                        getOptionValue={option => option.id}
                                                                        getOptionLabel={option => option.name}
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorBlock name="crime_id" />
                                                        </div>

                                                        <div className="col-lg-12 mb-3">
                                                            <label className="form-label" htmlFor="dob">
                                                                Crime Date{' '}
                                                                <span style={{ color: 'red' }}>*</span>
                                                            </label>
                                                            <Field id="crime_date" name="crime_date">
                                                                {({ input, meta }) => (
                                                                    <Flatpickr
                                                                        className={`form-control ${error(meta)}`}
                                                                        options={{
                                                                            dateFormat: 'd M, Y',
                                                                            maxDate: new Date(),
                                                                        }}
                                                                        placeholder="Select crime date"
                                                                        value={crimeDate}
                                                                        onChange={([date]) => {
                                                                            input.onChange(
                                                                                moment(date).format('YYYY-MM-DD')
                                                                            );
                                                                            setcrimeDate(date);
                                                                        }}
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorBlock name="crime_date" />
                                                        </div>

                                                        <div className="col-lg-12 mb-3">
                                                            <label className="form-label" htmlFor="casualties_recorded">
                                                                Casualties Recorded <span style={{ color: 'red' }}></span>
                                                            </label>
                                                            <Field id="casualties_recorded" name="casualties_recorded">
                                                                {({ input, meta }) => (
                                                                    <input
                                                                        {...input}
                                                                        type="number"
                                                                        className={`form-control ${error(meta)}`}
                                                                        id="casualties_recorded"
                                                                        placeholder="Casualties Recorded"
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorBlock name="casualties_recorded" />
                                                        </div>

                                                        <div className="col-lg-12 mb-3">
                                                            <label className="form-label" htmlFor="arresting_body">
                                                                Arresting Body <span style={{ color: 'red' }}>*</span>
                                                            </label>
                                                            <Field id="arresting_body" name="arresting_body">
                                                                {({ input, meta }) => (
                                                                    <Select
                                                                        {...input}
                                                                        className={error(meta)}
                                                                        placeholder="Select arresting body"
                                                                        options={arrestingBody}
                                                                        getOptionValue={option => option.id}
                                                                        getOptionLabel={option => option.name}
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorBlock name="arresting_body" />
                                                        </div>

                                                        <div className="col-lg-12 mb-3">
                                                            <label className="form-label" htmlFor="place_of_detention">
                                                                Place Of Detention <span style={{ color: 'red' }}></span>
                                                            </label>
                                                            <Field id="place_of_detention" name="place_of_detention">
                                                                {({ input, meta }) => (
                                                                    <input
                                                                        {...input}
                                                                        type="text"
                                                                        className={`form-control ${error(meta)}`}
                                                                        id="place_of_detention"
                                                                        placeholder="Place Of Detention"
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorBlock name="place_of_detention" />
                                                        </div>

                                                        <div className="col-lg-12 mb-3">
                                                            <label className="form-label" htmlFor="action_taken">
                                                                Action Taken <span style={{ color: 'red' }}></span>
                                                            </label>
                                                            <Field id="action_taken" name="action_taken">
                                                                {({ input, meta }) => (
                                                                    <input
                                                                        {...input}
                                                                        type="text"
                                                                        className={`form-control ${error(meta)}`}
                                                                        id="action_taken"
                                                                        placeholder="Action Taken"
                                                                    />
                                                                )}
                                                            </Field>
                                                            <ErrorBlock name="action_taken" />
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

export default NewEditCrime;
