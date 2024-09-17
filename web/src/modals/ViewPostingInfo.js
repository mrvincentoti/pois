import React, { useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';

import ModalWrapper from '../container/ModalWrapper';
import {
	formatDate,
	formatEmployeeName,
	notifyWithIcon,
	request,
} from '../services/utilities';
import {
	CREATE_EMPLOYEE_POSTINGS_API,
	FETCH_EMPLOYEES_API,
	FETCH_REGIONS_API,
	FETCH_STATIONS_API,
	UPDATE_EMPLOYEE_POSTINGS_ACTION_API,
	UPDATE_EMPLOYEE_POSTINGS_API,
} from '../services/api';
import { ErrorBlock, FormSubmitError, error } from '../components/FormBlock';
import FormWrapper from '../container/FormWrapper';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import { postingTypes, statusTypes } from '../services/constants';

const ViewPostingInfo = ({ action, closeModal, update, selectedPosting }) => {
	const [loaded, setLoaded] = useState(false);
	const [dateOfAssumption, setDateOfAssumption] = useState();
	const [dateOfReturn, setDateOfReturn] = useState();
	const [expectedDateOfReturn, setExpectedDateOfReturn] = useState();
	const [employee, setEmployee] = useState(null);
	const [region, setRegion] = useState(null);
	const [station, setStation] = useState(null);

	const [status, setStatus] = useState(null);

	const getEmployees = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_EMPLOYEES_API}?q=${q}`);
		return rs?.employees || [];
	};

	const getRegions = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_REGIONS_API}?q=${q}`);
		return rs?.regions || [];
	};

	const getStations = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_STATIONS_API}?region_id=${region.id}`);
		return rs?.stations || [];
	};

	useEffect(() => {
		if (!loaded) {
			if (selectedPosting) {
				setEmployee(selectedPosting.employee);
				setRegion(selectedPosting.region);
				setStation(selectedPosting.station);
				setDateOfAssumption(selectedPosting.assumption_date);
				setDateOfReturn(selectedPosting.date_of_return);
				setExpectedDateOfReturn(selectedPosting.expected_date_of_return);
				setStatus(
					statusTypes.find(status => status.id === selectedPosting.status)
				);
			}
			setLoaded(true);
		}
	}, [loaded, selectedPosting]);

	const onSubmit = async values => {
		try {
			const config = {
				method: 'POST',
				body: { ...values, posting_type: action, action: action },
			};
			const uri = UPDATE_EMPLOYEE_POSTINGS_ACTION_API.replace(
				':id',
				selectedPosting.id
			);

			const rs = await request(uri, config);

			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			return { [FORM_ERROR]: e.message || 'could not create posting' };
		}
	};

	return (
		<ModalWrapper
			title={`${selectedPosting ? 'Posting' : 'Add'} History`}
			closeModal={closeModal}
		>
			<div style={{ background: '#f3f3f9' }}>


				<div className="row m-4">
					<h5 className="mb-1">{selectedPosting.region.name}</h5>
					<p className="text-muted mb-0">
						{selectedPosting.station.country.en_short_name} - {selectedPosting.station.name}
					</p>
					<p className="text-muted mb-0">
						{selectedPosting.designation_at_post}
					</p>
					<p className="text-muted mb-0">
						Expected date of return: {selectedPosting.expected_date_of_return}
					</p>
					<p className="text-muted mb-0">
						Assumption date: {selectedPosting.assumption_date}
					</p>
					<p className="text-muted mb-0">
						Date of return: {selectedPosting.date_of_return}
					</p>
				</div>
				<div className="timeline-2 m-3">
					{selectedPosting.children && selectedPosting.children.length > 0
						? selectedPosting.children.map((item, i) => (
								<div className="timeline-continue">
									<div className="row timeline-right">
										<div className="col-12">
											<div className="timeline-box">
												<div className="timeline-text">
													<div className="d-flex">
														<div className="flex-grow-1 ms-3">
															<h5 className="mb-1">{item.region.name}</h5>
															<p className="text-muted mb-0">
																{item.station.country} - {item.station.name}
															</p>
															<p className="text-muted mb-0">
																Designation at post: {item.designation_at_post}
															</p>
															<p className="text-muted mb-0">
																Expected date of return:{' '}
																{item.expected_date_of_return}
															</p>
															<p className="text-muted mb-0">
																Assumption date: {item.assumption_date}
															</p>
															<p className="text-muted mb-0">
																Date of return: {item.date_of_return}
															</p>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div className="col-12">
											<p className="timeline-date">
												{item.posting_type && item.posting_type
													? postingTypes.find(
															type => type.id === item.posting_type
													  ).name
													: 'on-going'}
											</p>
										</div>
									</div>
								</div>
						  ))
						: ''}
				</div>
			</div>
		</ModalWrapper>
	);
};

export default ViewPostingInfo;
