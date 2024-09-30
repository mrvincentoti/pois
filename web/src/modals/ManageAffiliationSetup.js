import React from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';

import ModalWrapper from '../container/ModalWrapper';
import { notifyWithIcon, request } from '../services/utilities';
import {
	CREATE_AFFILIATIONS_API,
	UPDATE_AFFILIATIONS_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';

const ManageAffiliationSetup = ({ closeModal, update, affiliation }) => {
	const onSubmit = async values => {
		try {
			const config = {
				method: affiliation ? 'PUT' : 'POST',
				body: { ...values, deleted_at: undefined },
			};
			const uri = affiliation
				? UPDATE_AFFILIATIONS_API.replace(':id', affiliation.id)
				: CREATE_AFFILIATIONS_API;
			const rs = await request(uri, config);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not save affiliation' };
		}
	};

	return (
		<ModalWrapper
			title={`${affiliation ? 'Edit' : 'Add'} Affiliation`}
			closeModal={closeModal}
		>
			<Form
				initialValues={{ ...affiliation }}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					if (!values.name) {
						errors.name = 'enter affiliation';
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
										Affiliation
									</label>
									<Field id="name" name="name">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												id="name"
												placeholder="Enter affiliation"
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
									Save Affiliation
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageAffiliationSetup;
