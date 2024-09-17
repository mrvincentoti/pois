import React, { useState, useCallback, useEffect } from 'react';
import { Offcanvas, OffcanvasHeader, OffcanvasBody } from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import {
	notifyWithIcon,
	parseHashString,
	request,
} from '../services/utilities';
import {
	FETCH_ALL_SPECIALTIES_API,
	FETCH_CADRES_API,
	FETCH_RANKS_BY_CADRE_API,
	FETCH_STATES_API,
} from '../services/api';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { doClearFilter } from '../redux/slices/employee';

const RetiredEmployeeFilter = ({ show, onCloseClick, onFilter, onClearFilter }) => {
	const [loaded, setLoaded] = useState(false);
	const [states, setStates] = useState([]);
	const [specialities, setSpecialities] = useState([]);
	const [selectedState, setSelectedState] = useState(null);
	const [selectedSpeciality, setSelectedSpeciality] = useState(null);
	const [ranks, setRanks] = useState([]);
	const [cadres, setCadres] = useState([]);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [serviceYears, setServiceYears] = useState('');
	const [retiringYears, setRetiringYears] = useState('');
	const [employmentStatus, setEmploymentStatus] = useState(null);
	const [deployed, setDeployed] = useState(false);
	const [inTraining, setInTraining] = useState(false);
	const [secondments, setSecondments] = useState(false);
	const [onposting, setOnposting] = useState(false);

	const [selectedRank, setSelectedRank] = useState(''); // State to track the selected option
	const [selectedCadre, setSelectedCadre] = useState(''); // State to track the selected option

	const clearFilter = useSelector(state => state.employee.clearFilter);

	const dispatch = useDispatch();
	const location = useLocation();

	const fetchRanks = useCallback(async id => {
		try {
			if (id) {
				const rs = await request(
					FETCH_RANKS_BY_CADRE_API.replace(':cadre_id', id)
				);
				setRanks(rs.ranks);
			} else {
				setRanks([]);
			}
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchCadres = useCallback(async () => {
		try {
			const rs = await request(`${FETCH_CADRES_API}?page=1&per_page=10`);
			setCadres(rs.cadres);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchStates = useCallback(async () => {
		try {
			const rs = await request(`${FETCH_STATES_API}`);
			setStates(rs.states);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchSpeciality = useCallback(async () => {
		try {
			const rs = await request(`${FETCH_ALL_SPECIALTIES_API}`);
			setSpecialities(rs.specialties);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const clearFilterParams = useCallback(() => {
		if (clearFilter) {
			setStartDate(null);
			setEndDate(null);
			setSelectedState('');
			setSelectedSpeciality('');
			setSelectedRank('');
			setSelectedCadre('');
			setServiceYears('');
			setRetiringYears('');
			setEmploymentStatus(false);
			setInTraining(false);
			setDeployed(false);
			setSecondments(false);

			setRanks([]);

			dispatch(doClearFilter(false));
		}
	}, [clearFilter, dispatch]);

	const setFilters = useCallback(() => {
		const filters = parseHashString(location.hash);
		if (filters) {
			setStartDate(filters?.date_of_employment_start_date || null);
			setEndDate(filters?.date_of_employment_end_date || null);

			// Check if filters?.state_id is not null and find the corresponding state
			setSelectedState(
				filters?.state_id
					? states.find(state => state.id === Number(filters.state_id))
					: ''
			);
			setSelectedSpeciality(
				filters?.specialty_id
					? specialities.find(
							speciality => speciality.id === Number(filters.specialty_id)
					  )
					: ''
			);

			// Check if filters?.rank_id is not null and find the corresponding rank
			setSelectedRank(
				filters?.rank_id
					? ranks.find(rank => rank.id === Number(filters.rank_id))
					: ''
			);
			setSelectedCadre(
				filters?.cadre_id
					? cadres.find(cadre => cadre.id === Number(filters.cadre_id))
					: ''
			);

			setServiceYears(filters?.number_of_years_in_service || '');
			setRetiringYears(filters?.months_until_retirement || '');
			setEmploymentStatus(filters?.employment_status || false);
			setInTraining(filters?.has_taken_training || false);
			setDeployed(filters?.deployed_employees || false);
			setSecondments(filters?.employee_secondment || false);

			if (selectedCadre && ranks.length === 0) {
				fetchRanks(selectedCadre.id);
			}
		}
	}, [
		cadres,
		fetchRanks,
		location.hash,
		ranks,
		selectedCadre,
		specialities,
		states,
	]);

	useEffect(() => {
		if (!loaded) {
			fetchCadres();
			fetchStates();
			fetchSpeciality();

			setFilters();

			setLoaded(true);
		}

		clearFilterParams();
	}, [
		clearFilterParams,
		fetchCadres,
		fetchSpeciality,
		fetchStates,
		loaded,
		setFilters,
	]);

	const handleServiceYearsChange = e => {
		setServiceYears(e.target.value);
	};

	const handleRetiringYearsChange = e => {
		setRetiringYears(e.target.value);
	};

	const doFilter = e => {
		e.preventDefault();
		const filterObject = {
			...(startDate ? { date_of_retirement_start_date: startDate } : ''),
			...(endDate ? { date_of_retirement_end_date: endDate } : ''),
			...(selectedRank?.id && { rank_id: selectedRank.id }),
			...(serviceYears && { number_of_years_in_service: serviceYears }),
			...(selectedState?.id && { state_id: selectedState.id }),
			...(selectedCadre?.id && { cadre_id: selectedCadre.id }),
			...(retiringYears && { months_until_retirement: retiringYears }),
			...(selectedSpeciality?.id && { specialty_id: selectedSpeciality.id }),
			...(employmentStatus && { employment_status: employmentStatus }),
			...(secondments && { employee_secondment: secondments }),
			...(deployed && { deployed_employees: deployed }),
			...(inTraining && { has_taken_training: inTraining }),
			...(onposting && { posted_employees: onposting }),
		};

		onFilter(filterObject);

		onCloseClick();
	};

	return (
		<Offcanvas
			direction="end"
			isOpen={show}
			toggle={onCloseClick}
			className="overflow-auto d-flex flex-column"
		>
			<form className="d-flex flex-column h-100">
				<OffcanvasHeader className="bg-light" toggle={onCloseClick}>
					Employee Filters
				</OffcanvasHeader>
				<div className="flex-grow-1 overflow-auto">
					<OffcanvasBody>
						<div className="row g-1 mb-4">
							<label
								htmlFor="datepicker-range"
								className="form-label text-muted text-uppercase fw-semibold"
							>
								Date of retirement
							</label>
							<div className="col-lg-6 mb-2">
								<label
									htmlFor="datepicker-range"
									className="form-label text-muted text-uppercase fw-semibold mb-3"
								>
									From
								</label>
								<Flatpickr
									value={startDate}
									className="form-control"
									id="datepicker-publish-input"
									placeholder="Select a date"
									onChange={(selectedDates, dateStr) => {
										setStartDate(moment(dateStr).format('YYYY-MM-DD'));
									}}
								/>
							</div>
							<div className="col-lg-6 mb-2">
								<label
									htmlFor="endDate"
									className="form-label text-muted text-uppercase fw-semibold mb-3"
								>
									To
								</label>
								<Flatpickr
									className="form-control"
									value={endDate}
									id="endDate"
									placeholder="Select a date"
									onChange={(selectedDates, dateStr) => {
										setEndDate(moment(dateStr).format('YYYY-MM-DD'));
									}}
								/>
							</div>
						</div>



						<div className="row g-2">
							<div className="col-lg-6">
								<div className="mb-4">
									<label
										htmlFor="serviceYears"
										className="form-label text-muted text-uppercase fw-semibold mb-3"
									>
										Years In Service
									</label>

									<input
										type="number"
										className={`form-control`}
										id="serviceYears"
										value={serviceYears}
										placeholder="Service years"
										onChange={handleServiceYearsChange}
									/>
								</div>
							</div>
							<div className="col-lg-6">
								<div className="mb-4">
									<label
										htmlFor="state-select"
										className="form-label text-muted text-uppercase fw-semibold mb-3"
									>
										State of Origin
									</label>

									<Select
										isClearable
										className="mb-0"
										value={selectedState}
										getOptionValue={option => option.id}
										getOptionLabel={option => option.name}
										options={states || []}
										isSearchable={true}
										onChange={e => {
											setSelectedState(e);
										}}
										id="state-select"
									></Select>
								</div>
							</div>
						</div>
                        <div className="row g-2 vh-100">
							<div className="col-lg-6">
								<div className="mb-4">
									<label
										htmlFor="rank-select"
										className="form-label text-muted text-uppercase fw-semibold mb-3"
									>
										Cadre
									</label>

									<Select
										isClearable
										value={selectedCadre}
										options={cadres || []}
										isSearchable={true}
										getOptionValue={option => option.id}
										getOptionLabel={option => option.name}
										placeholder="Select an option"
										onChange={e => {
											setSelectedCadre(e);
											if (e) {
												fetchRanks(e.id);
											} else {
												setSelectedRank('');
												setRanks([]);
											}
										}}
									/>
								</div>
							</div>
							<div className="col-lg-6">
								<div className="mb-4">
									<label
										htmlFor="rank-select"
										className="form-label text-muted text-uppercase fw-semibold mb-3"
									>
										Rank
									</label>

									<Select
										isClearable
										value={selectedRank}
										getOptionValue={option => option.id}
										getOptionLabel={option => option.name}
										options={ranks || []}
										isSearchable={true}
										placeholder="Select an option"
										onChange={e => setSelectedRank(e)}
									/>
								</div>
							</div>
						</div>



					</OffcanvasBody>
				</div>
				<div className="offcanvas-footer border-top p-3 text-center hstack gap-1">
					<button
						className="btn btn-light w-100"
						type="button"
						onClick={onClearFilter}
					>
						Clear
					</button>

					<button
						className="btn btn-light w-100"
						type="button"
						onClick={onCloseClick}
					>
						Close
					</button>

					<button className="btn btn-primary w-100" onClick={doFilter}>
						Filters
					</button>
				</div>
			</form>
		</Offcanvas>
	);
};

export default RetiredEmployeeFilter;
