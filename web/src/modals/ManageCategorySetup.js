import React, { useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import { useDispatch, useSelector } from 'react-redux';

import ModalWrapper from '../container/ModalWrapper';
import {
	notifyWithIcon,
	request,
	updateImmutable,
} from '../services/utilities';
import {
	CREATE_CATEGORIES_API,
	UPDATE_CATEGORIES_API,
	FETCH_POI_CATEGORY_API,
	FETCH_ORG_CATEGORY_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';
import { setCategories } from '../redux/slices/category';

const ManageCategorySetup = ({ closeModal, update, category }) => {
	const categories = useSelector(state => state.category.list);
	const dispatch = useDispatch();

	const [loading, setLoading] = useState(false);

	// useEffect(() => {
	//     console.log('Category:', category);  // To ensure that category_type is part of the category object
	// }, [category]);

	const onSubmit = async values => {
		console.log('Submitting values:', values);
		try {
			const config = {
				method: category ? 'PUT' : 'POST',
				body: { ...values, deleted_at: undefined },
			};
			const uri = category
				? UPDATE_CATEGORIES_API.replace(':id', category.id)
				: CREATE_CATEGORIES_API;
			const rs = await request(uri, config);

			if (category) {
				// update
				const update_list = updateImmutable(categories, rs.category);
				dispatch(setCategories(update_list));
			} else {
				// new category
				const update_list = [...categories, rs.category];
				dispatch(setCategories(update_list));
			}

			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'Could not save category' };
		}
	};

	return (
		<ModalWrapper
			title={`${category ? 'Edit' : 'Add'} Category`}
			closeModal={closeModal}
		>
			<Form
				initialValues={{
					...category,
					category_type: category?.category_type?.toLowerCase() || '',
				}}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					if (!values.name) {
						errors.name = 'Enter category';
					}
					if (!values.description) {
						errors.description = 'Enter description';
					}
					if (!values.category_type) {
						errors.category_type = 'Select category type';
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
										Category
									</label>
									<Field id="name" name="name">
										{({ input, meta }) => (
											<input
												{...input}
												type="text"
												className={`form-control ${error(meta)}`}
												id="name"
												placeholder="Enter category"
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
								<div className="col-lg-12">
									<label htmlFor="category_type" className="form-label">
										Category Type
									</label>
									<Field name="category_type" component="select">
										{({ input, meta }) => (
											<select
												{...input}
												className={`form-control ${error(meta)}`}
												id="category_type"
											>
												<option value="">Select category type</option>
												<option value="poi">POI (Person of Interest)</option>
												<option value="org">ORG (Organization)</option>
											</select>
										)}
									</Field>
									<ErrorBlock name="category_type" />
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
									Save Category
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageCategorySetup;
