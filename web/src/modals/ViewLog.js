import React, { useEffect, useState } from 'react';
import {
	checkIfContainsEdit,
	formatDateTime,
	formatEmployeeName,
	notifyWithIcon,
	request,
} from '../services/utilities';
import {
	CREATE_EMPLOYEE_POSTINGS_API,
	FETCH_EMPLOYEES_API,
	FETCH_REGIONS_API,
	FETCH_STATIONS_API,
	UPDATE_EMPLOYEE_POSTINGS_API,
} from '../services/api';
import { statusTypes } from '../services/constants';
import { FORM_ERROR } from 'final-form';
import ModalWrapper from '../container/ModalWrapper';
import { Field, Form } from 'react-final-form';
import FormWrapper from '../container/FormWrapper';
import { error, ErrorBlock, FormSubmitError } from '../components/FormBlock';
import AsyncSelect from 'react-select/async';
import Flatpickr from 'react-flatpickr';
import moment from 'moment/moment';
import Select from 'react-select';

const ViewLog = ({ closeModal, update, selectedLog }) => {
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
			if (selectedLog) {
			}
			setLoaded(true);
		}
	}, [loaded, selectedLog]);

	return (
		<ModalWrapper
			title={`${formatDateTime(selectedLog.updated_at)} Log`}
			closeModal={closeModal}
		>
			<div className="modal-body">
				<div className="row g-3">
					<div className="col-lg-12">
						<div className="content">
							<p>
								<span className="badge bg-success-subtle text-success fs-10 align-middle ms-1">
									Event
								</span>{' '}
								{selectedLog?.event}
							</p>

							<p>
								<span className="badge bg-success-subtle text-success fs-10 align-middle ms-1">
									url
								</span>{' '}
								{selectedLog?.url}
							</p>
							<p>
								<span className="badge bg-success-subtle text-success fs-10 align-middle ms-1">
									Ip address
								</span>{' '}
								{selectedLog?.ip_address}
							</p>
							<p>
								<span className="badge bg-success-subtle text-success fs-10 align-middle ms-1">
									User agent
								</span>{' '}
								{selectedLog?.user_agent}
							</p>
							<p>
								<span className="badge bg-success-subtle text-success fs-10 align-middle ms-1">
									Old values
								</span>{' '}
								{selectedLog.old_values ? selectedLog.old_values : 'None'}
							</p>
							<p>
								<span className="badge bg-success-subtle text-success fs-10 align-middle ms-1">
									New values
								</span>{' '}
								{selectedLog.new_values ? selectedLog.new_values : 'None'}
							</p>
							<p>
								<span className="badge bg-success-subtle text-success fs-10 align-middle ms-1">
									Date
								</span>{' '}
								{selectedLog?.created_at}
							</p>
						</div>

						{checkIfContainsEdit(selectedLog?.event) ? (
							<div className="content">
								<h5>
									New Value
									<span className="badge bg-success-subtle text-success fs-10 align-middle ms-1">
										Change
									</span>
								</h5>
								<p className="text-muted mb-2">
									{selectedLog.new_values ? selectedLog.new_values : 'None'}
								</p>

								<h5>
									Old Value
									<span className="badge bg-success-subtle text-success fs-10 align-middle ms-1">
										Old
									</span>
								</h5>
								<p className="text-muted mb-2">
									{selectedLog.old_values ? selectedLog.old_values : 'None'}
								</p>
							</div>
						) : (
							''
						)}

						<div className="content"></div>
					</div>
				</div>
			</div>
		</ModalWrapper>
	);
};

export default ViewLog;
