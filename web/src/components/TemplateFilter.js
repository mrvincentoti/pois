import React, { useCallback, useEffect, useState } from 'react';
import Flatpickr from 'react-flatpickr';
import moment from 'moment/moment';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
	notifyWithIcon,
	parseHashString,
	request,
} from '../services/utilities';
import {
	FETCH_CRIMES_API,
	FETCH_CATEGORIES_API,
	FETCH_SOURCES_API,
	FETCH_COUNTRIES_API,
	FETCH_AFFILIATIONS_API,
	FETCH_ARRESTING_BODY_API,
} from '../services/api';
import { doClearFilter } from '../redux/slices/employee';

const TemplateFilter = ({ show, onCloseClick, onFilter, onClearFilter }) => {
	const [loaded, setLoaded] = useState(false);
	const [countries, setCountries] = useState([]);
	const [selectedCountry, setSelectedCountry] = useState(null);
	const [crimes, setCrimes] = useState([]);
	const [selectedCrime, setSelectedCrime] = useState(null);
	const [affiliations, setAffliation] = useState([]);
	const [selectedAffiliation, setSelectedAffiliation] = useState('');
	const [arrestingBodies, setArrestingBody] = useState([]);
	const [selectedArrestingBody, setSelectedArrestingBody] = useState('');
	const [sources, setSource] = useState([]);
	const [categories, setCategories] = useState([]);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	// const [serviceYears, setServiceYears] = useState('');
	// const [retiringYears, setRetiringYears] = useState('');
	// const [employmentStatus, setEmploymentStatus] = useState(null);
	// const [deployed, setDeployed] = useState(false);
	// const [inTraining, setInTraining] = useState(false);
	// const [secondments, setSecondments] = useState(false);
	// const [onposting, setOnposting] = useState(false);

	const [selectedSource, setSelectedSource] = useState(''); // State to track the selected option
	const [selectedCategory, setSelectedCategory] = useState(''); // State to track the selected option

	const clearFilter = useSelector(state => state.employee.clearFilter);

	const dispatch = useDispatch();
	const location = useLocation();

	// const fetchRanks = useCallback(async id => {
	// 	try {
	// 		if (id) {
	// 			const rs = await request(
	// 				FETCH_RANKS_BY_CADRE_API.replace(':cadre_id', id)
	// 			);
	// 			setRanks(rs.ranks);
	// 		} else {
	// 			setRanks([]);
	// 		}
	// 	} catch (error) {
	// 		notifyWithIcon('error', error.message);
	// 	}
	// }, []);

	const fetchCategories = useCallback(async () => {
		try {
			const rs = await request(`${FETCH_CATEGORIES_API}?page=1&per_page=10`);
			setCategories(rs.categories);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchCountries = useCallback(async () => {
		try {
			const rs = await request(`${FETCH_COUNTRIES_API}`);
			setCountries(rs.countries);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchCrimes = useCallback(async () => {
		try {
			const rs = await request(`${FETCH_CRIMES_API}`);
			setCrimes(rs.crimes);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchSources = useCallback(async () => {
		try {
			const rs = await request(`${FETCH_SOURCES_API}`);
			setSource(rs.sources);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchAffiliations = useCallback(async () => {
		try {
			const rs = await request(`${FETCH_AFFILIATIONS_API}`);
			setAffliation(rs.affiliations);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchArrestingBodies = useCallback(async () => {
		try {
			const rs = await request(`${FETCH_ARRESTING_BODY_API}`);
			setArrestingBody(rs.arresting_bodies);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const clearFilterParams = useCallback(() => {
		if (clearFilter) {
			setStartDate(null);
			setEndDate(null);
			setSelectedCountry('');
			setSelectedCrime('');
			setSelectedSource('');
			setSelectedAffiliation('');
			setSelectedArrestingBody('');
			// setSelectedRank('');
			setSelectedCategory('');
			// setServiceYears('');
			// setRetiringYears('');
			// setEmploymentStatus(false);
			// setInTraining(false);
			// setDeployed(false);
			// setSecondments(false);

			// setRanks([]);

			dispatch(doClearFilter(false));
		}
	}, [clearFilter, dispatch]);

	const setFilters = useCallback(() => {
		const filters = parseHashString(location.hash);
		if (filters) {
			setStartDate(filters?.from_date || null);
			setEndDate(filters?.to_date || null);

			// Check if filters?.country_id is not null and find the corresponding state
			setSelectedCountry(
				filters?.country_id
					? countries.find(country => country.id === Number(filters.country_id))
					: ''
			);
			setSelectedCrime(
				filters?.crime_id
					? crimes.find(crime => crime.id === Number(filters.crime_id))
					: ''
			);
			setSelectedSource(
				filters?.source_id
					? sources.find(source => source.id === Number(filters.source_id))
					: ''
			);

			setSelectedAffiliation(
				filters?.affiliation_id
					? affiliations.find(
							affiliation => affiliation.id === Number(filters.affiliation_id)
						)
					: ''
			);

			setSelectedArrestingBody(
				filters?.arrestingBody_id
					? arrestingBodies.find(
							arrestingBody =>
								arrestingBody.id === Number(filters.arrestingBody_id)
						)
					: ''
			);

			// Check if filters?.rank_id is not null and find the corresponding rank
			// setSelectedRank(
			// 	filters?.rank_id
			// 		? ranks.find(rank => rank.id === Number(filters.rank_id))
			// 		: ''
			// );
			setSelectedCategory(
				filters?.category_id
					? categories.find(
							category => category.id === Number(filters.category_id)
						)
					: ''
			);

			// setServiceYears(filters?.number_of_years_in_service || '');
			// setRetiringYears(filters?.months_until_retirement || '');
			// setEmploymentStatus(filters?.employment_status || false);
			// setInTraining(filters?.has_taken_training || false);
			// setDeployed(filters?.deployed_employees || false);
			// setSecondments(filters?.employee_secondment || false);

			if (selectedCategory) {
				// fetchRanks(selectedCategory.id);
			}
		}
	}, [
		categories,
		// fetchRanks,
		location.hash,
		// ranks,
		selectedCategory,
		crimes,
		countries,
		sources,
		affiliations,
		arrestingBodies,
	]);

	useEffect(() => {
		if (!loaded) {
			fetchCategories();
			fetchCountries();
			fetchCrimes();
			fetchSources();
			fetchAffiliations();
			fetchArrestingBodies();

			setFilters();

			setLoaded(true);
		}

		clearFilterParams();
	}, [
		clearFilterParams,
		fetchCategories,
		fetchCrimes,
		fetchSources,
		fetchAffiliations,
		fetchArrestingBodies,
		fetchCountries,
		loaded,
		setFilters,
	]);

	// const handleServiceYearsChange = e => {
	// 	setServiceYears(e.target.value);
	// };

	// const handleRetiringYearsChange = e => {
	// 	setRetiringYears(e.target.value);
	// };

	const doFilter = e => {
		e.preventDefault();
		const filterObject = {
			...(startDate ? { from_date: startDate } : ''),
			...(endDate ? { to_date: endDate } : ''),
			// ...(selectedRank?.id && { rank_id: selectedRank.id }),
			// ...(serviceYears && { number_of_years_in_service: serviceYears }),
			...(selectedCountry?.id && { Country_id: selectedCountry.id }),
			...(selectedCategory?.id && { category_id: selectedCategory.id }),
			// ...(retiringYears && { months_until_retirement: retiringYears }),
			...(selectedCrime?.id && { crime_id: selectedCrime.id }),
			...(selectedSource?.id && { source_id: selectedSource.id }),
			...(selectedAffiliation?.id && {
				affiliation_id: selectedAffiliation.id,
			}),
			...(selectedArrestingBody?.id && {
				arrestingBody_id: selectedArrestingBody.id,
			}),
			// ...(employmentStatus && { employment_status: employmentStatus }),
			// ...(secondments && { employee_secondment: secondments }),
			// ...(deployed && { deployed_employees: deployed }),
			// ...(inTraining && { has_taken_training: inTraining }),
			// ...(onposting && { posted_employees: onposting }),
		};

		onFilter(filterObject);

		onCloseClick();
	};

	return (
		<div
			className={`offcanvas offcanvas-end border-0 ${show ? 'show' : ''}`}
			tabIndex="-1"
			id="theme-settings-offcanvas"
		>
			<div className="d-flex align-items-center bg-dark p-3 offcanvas-header">
				<h5 className="m-0 me-2 text-white">Poi Filters</h5>

				<button
					type="button"
					onClick={onCloseClick}
					className="btn-close btn-close-white ms-auto"
					id="customizerclose-btn"
					data-bs-dismiss="offcanvas"
					aria-label="Close"
				></button>
			</div>
			<div className="offcanvas-body">
				<div className="row g-1">
					<label
						htmlFor="datepicker-range"
						className="form-label text-muted text-uppercase fw-semibold"
					>
						Date
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
					<hr />
				</div>

				<div className="row g-2">
					<div className="col-lg-6">
						<div className="mb-4">
							<label
								htmlFor="rank-select"
								className="form-label text-muted text-uppercase fw-semibold mb-3"
							>
								Category
							</label>

							<Select
								isClearable
								value={selectedCategory}
								options={categories || []}
								isSearchable={true}
								getOptionValue={option => option.id}
								getOptionLabel={option => option.name}
								placeholder="Select an option"
								onChange={e => {
									setSelectedCategory(e);
									// if (e) {
									// 	fetchRanks(e.id);
									// } else {
									// 	setSelectedRank('');
									// 	setRanks([]);
									// }
								}}
							/>
						</div>

						<div className="mb-4">
							<label
								htmlFor="affiliation-select"
								className="form-label text-muted text-uppercase fw-semibold mb-3"
							>
								Affiliation
							</label>

							<Select
								isClearable
								className="mb-0"
								value={selectedAffiliation}
								getOptionValue={option => option.id}
								getOptionLabel={option => option.name}
								options={affiliations || []}
								isSearchable={true}
								onChange={e => {
									setSelectedAffiliation(e);
								}}
								id="affiliation-select"
							></Select>
						</div>
					</div>
					<div className="col-lg-6">
						{/* <div className="mb-4">
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
								</div> */}
					</div>
				</div>

				<div className="row g-2">
					{/* <div className="col-lg-6">
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
							</div> */}
					<div className="col-lg-6">
						<div className="mb-4">
							<label
								htmlFor="country-select"
								className="form-label text-muted text-uppercase fw-semibold mb-3"
							>
								Country
							</label>

							<Select
								isClearable
								className="mb-0"
								value={selectedCountry}
								getOptionValue={option => option.id}
								getOptionLabel={option => option.name}
								options={countries || []}
								isSearchable={true}
								onChange={e => {
									setSelectedCountry(e);
								}}
								id="country-select"
							></Select>
						</div>

						<div className="mb-4">
							<label
								htmlFor="arrestingBody-select"
								className="form-label text-muted text-uppercase fw-semibold mb-3"
							>
								Arresting Body
							</label>

							<Select
								isClearable
								className="mb-0"
								value={selectedArrestingBody}
								getOptionValue={option => option.id}
								getOptionLabel={option => option.name}
								options={arrestingBodies || []}
								isSearchable={true}
								onChange={e => {
									setSelectedArrestingBody(e);
								}}
								id="arrestingBody-select"
							></Select>
						</div>
					</div>
				</div>
				<div className="row g-2">
					{/* <div className="col-lg-6">
								<div className="mb-4">
									<label
										htmlFor="retiringYears"
										className="form-label text-muted text-uppercase fw-semibold mb-3"
									>
										Retiring in
									</label>

									<input
										type="number"
										className={`form-control`}
										id="retiringYears"
										value={retiringYears}
										placeholder="Retiring years"
										onChange={handleRetiringYearsChange}
									/>
								</div>
							</div> */}

					<div className="col-lg-6">
						<div className="mb-4">
							<label
								htmlFor="crime-select"
								className="form-label text-muted text-uppercase fw-semibold mb-3"
							>
								Crime Committed
							</label>

							<Select
								isClearable
								className="mb-0"
								value={selectedCrime}
								getOptionValue={option => option.id}
								getOptionLabel={option => option.name}
								options={crimes || []}
								isSearchable={true}
								onChange={e => {
									setSelectedCrime(e);
								}}
								id="crime-select"
							></Select>
						</div>
					</div>
					<div className="col-lg-6">
						<div className="mb-4">
							<label
								htmlFor="source-select"
								className="form-label text-muted text-uppercase fw-semibold mb-3"
							>
								Source
							</label>

							<Select
								isClearable
								className="mb-0"
								value={selectedSource}
								getOptionValue={option => option.id}
								getOptionLabel={option => option.name}
								options={sources || []}
								isSearchable={true}
								onChange={e => {
									setSelectedSource(e);
								}}
								id="source-select"
							></Select>
						</div>
					</div>
				</div>

				<div className="mb-4">
					{/* <label
								htmlFor="status-select"
								className="form-label text-muted text-uppercase fw-semibold mb-3"
							>
								Employee that are
							</label> */}
					<div className="row g-2">
						{/* <div className="col-lg-6">
									<div className="form-check">
										<input
											className="form-check-input"
											type="radio"
											name="employmentStatus"
											id="radioActive"
											value="active"
											onChange={() => setEmploymentStatus('0')}
											checked={employmentStatus === '0'}
										/>
										<label className="form-check-label" htmlFor="radioActive">
											Active
										</label>
									</div>
									<div className="form-check">
										<input
											className="form-check-input"
											type="radio"
											name="employmentStatus"
											id="radioRetired"
											value="1"
											onChange={() => setEmploymentStatus('1')}
											checked={employmentStatus === '1'}
										/>
										<label className="form-check-label" htmlFor="radioRetired">
											Retired
										</label>
									</div>
									<div className="form-check">
										<input
											className="form-check-input"
											type="radio"
											name="employmentStatus"
											id="radioResigned"
											value="2"
											onChange={() => setEmploymentStatus('2')}
											checked={employmentStatus === '2'}
										/>
										<label className="form-check-label" htmlFor="radioResigned">
											Resigned
										</label>
									</div>
									<div className="form-check">
										<input
											className="form-check-input"
											type="radio"
											name="employmentStatus"
											id="radioTerminated"
											value="3"
											onChange={() => setEmploymentStatus('3')}
											checked={employmentStatus === '3'}
										/>
										<label
											className="form-check-label"
											htmlFor="radioTerminated"
										>
											Terminated
										</label>
									</div>
								</div> */}
						<div className="col-lg-6">
							{/* <div className="form-check">
										<input
											className="form-check-input"
											type="checkbox"
											id="inlineCheckbox1"
											defaultValue="option1"
											onChange={() => setDeployed(!deployed)}
											checked={deployed}
										/>
										<label
											className="form-check-label"
											htmlFor="inlineCheckbox1"
										>
											Deployed
										</label>
									</div> */}
							{/* <div className="form-check">
										<input
											className="form-check-input"
											type="checkbox"
											id="inlineCheckbox2"
											defaultValue="option2"
											onChange={() => setInTraining(!inTraining)}
											checked={inTraining}
										/>
										<label
											className="form-check-label"
											htmlFor="inlineCheckbox2"
										>
											Had Training (Last 1 year)
										</label>
									</div> */}
							{/* <div className="form-check">
										<input
											className="form-check-input"
											type="checkbox"
											id="inlineCheckbox2"
											defaultValue="option2"
											onChange={() => setSecondments(!secondments)}
											checked={secondments}
										/>
										<label
											className="form-check-label"
											htmlFor="inlineCheckbox2"
										>
											On Secondments
										</label>
									</div> */}
							{/* <div className="form-check">
										<input
											className="form-check-input"
											type="checkbox"
											id="inlineCheckbox2"
											defaultValue="option2"
											onChange={() => setOnposting(!onposting)}
											checked={onposting}
										/>
										<label
											className="form-check-label"
											htmlFor="inlineCheckbox2"
										>
											Currently on post
										</label>
									</div> */}
							{/* Add other checkboxes as needed */}
						</div>
					</div>
				</div>
			</div>

			<div className="offcanvas-footer border-top p-3 text-center">
				<div className="row">
					<div className="col-4">
						<button
							type="button"
							onClick={onClearFilter}
							className="btn btn-light w-100"
							id="reset-layout"
						>
							Clear
						</button>
					</div>
					<div className="col-4">
						<button
							type="button"
							onClick={onCloseClick}
							className="btn btn-light w-100"
							id="reset-layout"
						>
							Close
						</button>
					</div>
					<div className="col-4">
						<button
							type="button"
							onClick={doFilter}
							className="btn btn-primary w-100"
							id="reset-layout"
						>
							Submit
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TemplateFilter;
