import React from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';

import ModalWrapper from '../container/ModalWrapper';
import { notifyWithIcon, request } from '../services/utilities';
import { CREATE_CONFERENCE_API, UPDATE_CONFERENCE_API } from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';

const ManageConference = ({ closeModal, update, conference }) => {
	const onSubmit = async values => {
		try {
			const config = {
				method: conference ? 'PUT' : 'POST',
				body: { ...values, deleted_at: undefined },
			};
			const uri = conference
				? UPDATE_CONFERENCE_API.replace(':id', conference.id)
				: CREATE_CONFERENCE_API;
			const rs = await request(uri, config);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not save conference' };
		}
	};

	return (
		<ModalWrapper
			title={`${conference ? 'Edit' : 'Add'} Conference`}
			closeModal={closeModal}
		>
			<Form
				initialValues={{ ...conference }}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					if (!values.name) {
						errors.name = 'enter conference';
					}
					if (!values.description) {
						errors.description = 'enter description';
					}

					return errors;
				}}
				render={({ handleSubmit, submitError, submitting }) => (
					<FormWrapper onSubmit={handleSubmit} submitting={submitting}>
						<div className="modal-body">
							<FormSubmitError error={submitError} />
							<div className="row g-3">
								<div className="col-lg-12">
									<label htmlFor="name" className="form-label">
										Conference
									</label>
									<Field id="name" name="name">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												id="name"
												placeholder="Enter conference"
											/>
										)}
									</Field>
									<ErrorBlock name="name" />
								</div>
								<div className="col-lg-12">
									<label htmlFor="description" className="form-label">
										Description
									</label>
									<Field id="description" name="description">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												id="description"
												placeholder="Enter description"
											/>
										)}
									</Field>
									<ErrorBlock name="description" />
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
									Save Conference
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageConference;
