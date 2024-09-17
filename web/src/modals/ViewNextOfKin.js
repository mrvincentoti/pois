import React, { useEffect, useState } from 'react';
import {
	formatEmployeeName,
	notifyWithIcon,
	request,
} from '../services/utilities';
import {
	CREATE_EMPLOYEE_POSTINGS_API,
	FETCH_EMPLOYEES_API,
	FETCH_EMPLOYEE_NEXT_OF_KIN_API,
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

const NextOfKin = ({ closeModal, update, selectedNok }) => {
	const [loaded, setLoaded] = useState(false);
	const [dateOfAssumption, setDateOfAssumption] = useState();
	const [dateOfReturn, setDateOfReturn] = useState();
	const [expectedDateOfReturn, setExpectedDateOfReturn] = useState();
	const [employee, setEmployee] = useState(null);
	const [region, setRegion] = useState(null);
	const [station, setStation] = useState(null);

	const [status, setStatus] = useState(null);

	const getNextOfKin = async q => {
		if (!q || q.length <= 1) {
			return [];
		}

		const rs = await request(`${FETCH_EMPLOYEE_NEXT_OF_KIN_API}?q=${q}`);
		return rs?.next_of_kin || [];
	};

	useEffect(() => {
		if (!loaded) {
			if (selectedNok) {
			}
			setLoaded(true);
		}
	}, [loaded, selectedNok]);

	return (
		<ModalWrapper title="NEXT OF KIN" closeModal={closeModal}>
			<div className="modal-body">
				<div className="row g-3">
					<div className="col-lg-12">
						<div className="content">
							<h5>
								First name :{' '}
								<p className="text-muted mb-2">{selectedNok?.firstname}</p>{' '}
							</h5>
						</div>
						<div className="content">
							<h5>
								Last Name :{' '}
								<p className="text-muted mb-2">{selectedNok?.lastname}</p>{' '}
							</h5>
						</div>
						<div className="content">
							<h5>
								Phone : <p className="text-muted mb-2">{selectedNok?.phone}</p>{' '}
							</h5>
						</div>
						<div className="content">
							<h5>
								Address :{' '}
								<p className="text-muted mb-2">{selectedNok?.address}</p>{' '}
							</h5>
						</div>
						<div className="content">
							<h5>
								Email : <p className="text-muted mb-2">{selectedNok?.email}</p>
							</h5>
						</div>
						<div className="content">
							<h5>
								Relationship :{' '}
								<p className="text-muted mb-2">{selectedNok?.relationship}</p>{' '}
							</h5>
						</div>
					</div>
				</div>
			</div>
		</ModalWrapper>
	);
};

export default NextOfKin;
