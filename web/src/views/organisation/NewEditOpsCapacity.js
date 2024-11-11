import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Form, Field } from 'react-final-form';
import moment from 'moment';
import {
	CREATE_ORGS_CAPACITIES_API,
	UPDATE_ORGS_CAPACITIES_API,
} from '../../services/api';
import { notifyWithIcon, request } from '../../services/utilities';
import ModalWrapper from '../../container/ModalWrapper';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import { FORM_ERROR } from 'final-form';
import Select from 'react-select';

const NewEditOpsCapacity = ({ closeModal, data, update }) => {
	const [type, setType] = useState(null);
	const [item, setItem] = useState('');
	const [qty, setQty] = useState('');
	const [description, setDescription] = useState('');

	const params = useParams();

	// Populate fields when editing an existing activity
	useEffect(() => {
		if (data) {
			setType(
				data.type_id === 1
					? { label: 'Logistics', value: 1 }
					: { label: 'FirePower', value: 2 }
			);
			setItem(data.item || '');
			setQty(data.qty || '');
			setDescription(data.description || '');
		} else {
			// Reset the form fields when adding new data
			setType(null);
			setItem('');
			setQty('');
			setDescription('');
		}
	}, [data]);

	const onSubmit = async (values, form) => {
		try {
			const config = {
				method: data ? 'PUT' : 'POST',
				body: {
					...values,
					org_id: params.id, // Assuming the poi_id is required
					type_id: values.type.value, // type_id is required as 1 or 2
				},
			};
			const uri = data
				? UPDATE_ORGS_CAPACITIES_API.replace(':id', data.id)
				: CREATE_ORGS_CAPACITIES_API;
			const rs = await request(uri, config);
			notifyWithIcon('success', rs.message);
			Object.keys(values).forEach(key => {
				form.change(key, undefined);
			});
			update();
			closeModal();
		} catch (e) {
			return {
				[FORM_ERROR]: e.message || 'Something went wrong',
			};
		}
	};

	const typeOptions = [
		{ label: 'Logistics', value: 1 },
		{ label: 'FirePower', value: 2 },
	];

	return (
		<ModalWrapper
			title={`${data ? 'Edit' : 'Add'} Operational Capacity`}
			closeModal={closeModal}
		>
			<Form
				initialValues={{
					type: type || '',
					item: item || '',
					qty: qty || '',
					description: description || '',
				}}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					if (!values.type) {
						errors.type = 'Type is required';
					}
					if (!values.item) {
						errors.item = 'Item is required';
					}
					if (!values.qty) {
						errors.qty = 'Quantity is required';
					}
					return errors;
				}}
				render={({ handleSubmit, submitError, submitting }) => (
					<FormWrapper onSubmit={handleSubmit} submitting={submitting}>
						<div className="modal-body">
							<FormSubmitError error={submitError} />
							<div className="row g-3">
								<div className="col-lg-12">
									<label htmlFor="type" className="form-label">
										Type
									</label>
									<Field id="type" name="type">
										{({ input, meta }) => (
											<Select
												isClearable
												options={typeOptions}
												value={type}
												onChange={e => {
													setType(e);
													e ? input.onChange(e) : input.onChange('');
												}}
												className={error(meta)}
												placeholder="Select Type"
											/>
										)}
									</Field>
									<ErrorBlock name="type" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="item" className="form-label">
										Item
									</label>
									<Field id="item" name="item">
										{({ input, meta }) => (
											<input
												{...input}
												className={`form-control ${error(meta)}`}
												placeholder="Item"
												value={item}
												onChange={e => setItem(e.target.value)}
											/>
										)}
									</Field>
									<ErrorBlock name="item" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="qty" className="form-label">
										Quantity
									</label>
									<Field id="qty" name="qty">
										{({ input, meta }) => (
											<input
												{...input}
												className={`form-control ${error(meta)}`}
												placeholder="Quantity"
												value={qty}
												onChange={e => setQty(e.target.value)}
											/>
										)}
									</Field>
									<ErrorBlock name="qty" />
								</div>

								<div className="col-lg-12">
									<label htmlFor="description" className="form-label">
										Description
									</label>
									<Field id="description" name="description">
										{({ input, meta }) => (
											<textarea
												{...input}
												className={`form-control ${error(meta)}`}
												placeholder="Description"
											/>
										)}
									</Field>

									<ErrorBlock name="description" />
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button
								type="button"
								className="btn btn-light"
								onClick={closeModal}
								disabled={submitting}
							>
								Cancel
							</button>
							<button
								type="submit"
								className="btn btn-primary"
								disabled={submitting}
							>
								{data ? 'Update' : 'Add'}
							</button>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default NewEditOpsCapacity;
