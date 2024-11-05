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
	LIST_CRIMES_API,
	FETCH_ORG_CATEGORY_API,
	LIST_SOURCES_API,
	LIST_AFFILIATIONS_API,
	LIST_ARRESTING_BODY_API,
	LIST_ARMS_API,
} from '../services/api';
import { doClearFilter } from '../redux/slices/employee';

const OrgTemplateFilter = ({ show, onCloseClick, onFilter, onClearFilter }) => {
	const [loaded, setLoaded] = useState(false);
	const [crimes, setCrimes] = useState([]);
	const [selectedCrime, setSelectedCrime] = useState(null);
	const [arms, setArms] = useState([]);
	const [selectedArm, setSelectedArm] = useState(null);
	const [affiliations, setAffliation] = useState([]);
	const [selectedAffiliation, setSelectedAffiliation] = useState('');
	const [arrestingBodies, setArrestingBody] = useState([]);
	const [selectedArrestingBody, setSelectedArrestingBody] = useState('');
	const [sources, setSource] = useState([]);
	const [categories, setCategories] = useState([]);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);

	const [selectedSource, setSelectedSource] = useState(''); // State to track the selected option
	const [selectedCategory, setSelectedCategory] = useState(''); // State to track the selected option

	const clearFilter = useSelector(state => state.employee.clearFilter);

	const dispatch = useDispatch();
	const location = useLocation();

	const fetchCategories = useCallback(async () => {
		try {
			const rs = await request(`${FETCH_ORG_CATEGORY_API}?page=1&per_page=10`);
			setCategories(rs.categories);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchCrimes = useCallback(async () => {
		try {
			const rs = await request(`${LIST_CRIMES_API}`);
			setCrimes(rs.crimes);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchArms = useCallback(async () => {
		try {
			const rs = await request(`${LIST_ARMS_API}`);
			setArms(rs.arms);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchSources = useCallback(async () => {
		try {
			const rs = await request(`${LIST_SOURCES_API}`);
			setSource(rs.sources);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchAffiliations = useCallback(async () => {
		try {
			const rs = await request(`${LIST_AFFILIATIONS_API}`);
			setAffliation(rs.affiliations);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchArrestingBodies = useCallback(async () => {
		try {
			const rs = await request(`${LIST_ARRESTING_BODY_API}`);
			setArrestingBody(rs.arresting_bodies);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const clearFilterParams = useCallback(() => {
		if (clearFilter) {
			setStartDate(null);
			setEndDate(null);
			setSelectedCrime('');
			setSelectedArm('');
			setSelectedSource('');
			setSelectedAffiliation('');
			setSelectedArrestingBody('');
			setSelectedCategory('');

			dispatch(doClearFilter(false));
		}
	}, [clearFilter, dispatch]);

	const setFilters = useCallback(() => {
		const filters = parseHashString(location.hash);
		if (filters) {
			setStartDate(filters?.from_date || null);
			setEndDate(filters?.to_date || null);

			setSelectedCrime(
				filters?.crime_id
					? crimes.find(crime => crime.id === Number(filters.crime_id))
					: ''
			);

			setSelectedArm(
				filters?.arm_id
					? arms.find(arm => arm.id === Number(filters.arm_id))
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

			setSelectedCategory(
				filters?.category_id
					? categories.find(
							category => category.id === Number(filters.category_id)
						)
					: ''
			);

			if (selectedCategory) {
			}
		}
	}, [
		categories,
		location.hash,
		selectedCategory,
		crimes,
		arms,
		sources,
		affiliations,
		arrestingBodies,
	]);

	useEffect(() => {
		if (!loaded) {
			fetchCategories();
			fetchCrimes();
			fetchArms();
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
		fetchArms,
		fetchSources,
		fetchAffiliations,
		fetchArrestingBodies,
		loaded,
		setFilters,
	]);

	const doFilter = e => {
		e.preventDefault();
		const filterObject = {
			...(startDate ? { from_date: startDate } : ''),
			...(endDate ? { to_date: endDate } : ''),
			...(selectedCategory?.id && { category_id: selectedCategory.id }),
			...(selectedCrime?.id && { crime_id: selectedCrime.id }),
			...(selectedArm?.id && { arm_id: selectedArm.id }),
			...(selectedSource?.id && { source_id: selectedSource.id }),
			...(selectedAffiliation?.id && {
				affiliation_id: selectedAffiliation.id,
			}),
			...(selectedArrestingBody?.id && {
				arrestingBody_id: selectedArrestingBody.id,
			}),
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
				<h5 className="m-0 me-2 text-white"> Filter Organisation</h5>

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
								}}
							/>
						</div>
					</div>
					<div className="col-lg-6">
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
				</div>

				<div className="row g-2">
					{/* <div className="col-lg-6">
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
					</div> */}
					<div className="col-lg-6">
						{/* <div className="mb-4">
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
						</div> */}
					</div>
				</div>

				<div className="row g-2">
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
					<div className="col-lg-6">
						{/* <div className="mb-4">
							<label
								htmlFor="arm-select"
								className="form-label text-muted text-uppercase fw-semibold mb-3"
							>
								Arms Recovered
							</label>

							<Select
								isClearable
								className="mb-0"
								value={selectedArm}
								getOptionValue={option => option.id}
								getOptionLabel={option => option.name}
								options={arms || []}
								isSearchable={true}
								onChange={e => {
									setSelectedArm(e);
								}}
								id="arm-select"
							></Select>
						</div> */}
					</div>
				</div>

				<div className="mb-4">
					<div className="row g-2">
						<div className="col-lg-6"></div>
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

export default OrgTemplateFilter;
