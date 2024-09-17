import React from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';

import ModalWrapper from '../container/ModalWrapper';
import { notifyWithIcon, request } from '../services/utilities';
import { CREATE_SPECIALTY_API, UPDATE_SPECIALTY_API } from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';

const ManageSpecialty = ({ closeModal, update, specialty }) => {
	const onSubmit = async values => {
		try {
			const config = {
				method: specialty ? 'PUT' : 'POST',
				body: { ...values, deleted_at: undefined },
			};
			const uri = specialty
				? UPDATE_SPECIALTY_API.replace(':id', specialty.id)
				: CREATE_SPECIALTY_API;
			const rs = await request(uri, config);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not save specialty' };
		}
	};

	return (
		<ModalWrapper
			title={`${specialty ? 'Edit' : 'Add'} Specialty`}
			closeModal={closeModal}
		>
			<Form
				initialValues={{ ...specialty }}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					if (!values.name) {
						errors.name = 'enter specialty';
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
										Specialty
									</label>
									<Field id="name" name="name">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												id="name"
												placeholder="Enter specialty"
											/>
										)}
									</Field>
									<ErrorBlock name="name" />
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
									Save Specialty
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageSpecialty;
