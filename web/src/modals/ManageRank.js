import React, { useCallback, useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';

import ModalWrapper from '../container/ModalWrapper';
import { notifyWithIcon, request } from '../services/utilities';
import {
	CREATE_RANK_API,
	FETCH_CADRES_API,
	UPDATE_RANK_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';
import Select from 'react-select';
import {gradeLevels, nextOfKinCategory} from '../services/constants';

const ManageRank = ({ closeModal, update, rank }) => {
	const [loaded, setLoaded] = useState(false);
	const [cadres, setCadres] = useState([]);
	const [cadre, setCadre] = useState(null);
	const [level, setLevel] = useState(null);

	const loadCadres = useCallback(async () => {
		try {
			const rs = await request(FETCH_CADRES_API);
			setCadres(rs.cadres);
		} catch (e) {
			notifyWithIcon('error', e.message);
		}
	}, []);

	useEffect(() => {
		if (!loaded) {
			if (rank) {
				console.log("rank")
				console.log(rank)
				setCadre(rank.cadre);
				setLevel(rank.level);
				setLevel(
					gradeLevels.find(grade => grade.id === rank.level)
				);
			}

			loadCadres().then(_ => setLoaded(true));
		}
	}, [loadCadres, loaded, rank]);

	const onSubmit = async values => {
		try {
			const config = {
				method: rank ? 'PUT' : 'POST',
				body: { ...values, deleted_at: undefined, cadres: undefined },
				level: values.level.id,
			};
			const uri = rank
				? UPDATE_RANK_API.replace(':id', rank.id)
				: CREATE_RANK_API;
			const rs = await request(uri, config);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not save rank' };
		}
	};

	return (
		<ModalWrapper
			title={`${rank ? 'Edit' : 'Add'} Rank`}
			closeModal={closeModal}
		>
			<Form
				initialValues={{ ...rank, cadre_id: rank?.cadre?.id || null }}
				onSubmit={onSubmit}
				validate={values => {
					const errors = {};
					if (!values.name) {
						errors.name = 'enter rank';
					}
					if (!values.level) {
						errors.level = 'select level';
					}
					if (!values.cadre_id) {
						errors.cadre_id = 'select cadre';
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
										Ranks
									</label>
									<Field id="name" name="name">
										{({ input, meta }) => (
											<input
												{...input}
												type="name"
												className={`form-control ${error(meta)}`}
												id="name"
												placeholder="Enter rank"
											/>
										)}
									</Field>
									<ErrorBlock name="name" />
								</div>
								<div className="col-lg-12">
									<label htmlFor="level" className="form-label">
										Level
									</label>
									<Field id="level" name="level">
										{({ input, meta }) => (
											<Select
												{...input}
												options={gradeLevels}
												className={error(meta)}
												placeholder="Select level"
												getOptionValue={option => option.id}
												getOptionLabel={option => option.name}
												value={level}
												onChange={e => {
													setLevel(e);
													e ? input.onChange(e.id) : input.onChange('');
												}}
											/>
										)}
									</Field>
									<ErrorBlock name="level" />
								</div>
								<div className="col-lg-12">
									<label htmlFor="cadre_id" className="form-label">
										Cadre
									</label>
									<Field id="cadre_id" name="cadre_id">
										{({ input, meta }) => (
											<Select
												{...input}
												options={cadres}
												className={error(meta)}
												placeholder="Select cadre"
												getOptionValue={option => option.id}
												getOptionLabel={option => option.name}
												value={cadre}
												onChange={e => {
													setCadre(e);
													e ? input.onChange(e.id) : input.onChange('');
												}}
											/>
										)}
									</Field>
									<ErrorBlock name="cadre_id" />
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
									Save Rank
								</button>
							</div>
						</div>
					</FormWrapper>
				)}
			/>
		</ModalWrapper>
	);
};

export default ManageRank;
