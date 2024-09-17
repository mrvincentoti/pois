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
	FETCH_RANKS_BY_CADRE_API, FETCH_REGIONS_API,
	FETCH_STATES_API, FETCH_STATIONS_API,
} from '../services/api';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { doClearFilter } from '../redux/slices/employee';

const PostingFilter = ({ show, onCloseClick, onFilter, onClearFilter }) => {
	const [loaded, setLoaded] = useState(false);

	const [stations, setStations] = useState(null);
	const [regions, setRegions] = useState(null);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);

	const [dorStartDate, setDorStartDate] = useState(null);
	const [dorEndDate, setDorEndDate] = useState(null);

	const [postingStatus, setPostingStatus] = useState(null);



	const clearFilter = useSelector(state => state.employee.clearFilter);

	const [selectedStation, setSelectedStation] = useState(''); // State to track the selected option
	const [selectedRegion, setSelectedRegion] = useState(''); // State to track the selected option


	const dispatch = useDispatch();
	const location = useLocation();


	const fetchStations = useCallback(async id => {
		try {
			if(id){
				const rs = await request(`${FETCH_STATIONS_API}?region_id=${id}`)
			setStations(rs.stations);
			}else{
				setStations(null)
			}

		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const fetchRegion = useCallback(async () => {
		try {
			const rs = await request(
				`${FETCH_REGIONS_API}?page=1&per_page=10`
			);
			setRegions(rs.regions);
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	const clearFilterParams = useCallback(() => {
		if (clearFilter) {
			setStartDate(null);
			setEndDate(null);
			setDorStartDate(null)
			setDorEndDate(null)
			setSelectedStation(null)
			setSelectedRegion(null)
			setPostingStatus(null)
			dispatch(doClearFilter(false));
		}
	}, [clearFilter, dispatch]);

	const setFilters = useCallback(() => {
		const filters = parseHashString(location.hash);
		if (filters) {
			setStartDate(filters.assumption_date_start_date || null);
  			setEndDate(filters.assumption_date_end_date || null);
  			setDorStartDate(filters.expected_date_of_return_start_date || null);
  			setDorEndDate(filters.expected_date_of_return_end_date || null);

  			// Check if filter.state_id is not null and find the corresponding state
  			setSelectedRegion(filters.region_id ? regions.find(region => region.id === filters.region_id) : null);
  			setSelectedStation(filters.station_id ? stations.find(station => station.id === filters.station_id) : null);

  			// Check if filter.rank_id is not null and find the corresponding rank


			setPostingStatus(filters.employment_status || null);
		}
	}, [
		location.hash,
		regions,
		stations
	]);

	useEffect(() => {
		if (!loaded) {
			fetchRegion()
			fetchStations()
			setFilters();
			setLoaded(true);
		}
		clearFilterParams();
	}, [
		clearFilterParams,
		loaded,
		setFilters,
		fetchRegion,
		fetchStations,
	]);











	const handleSelectStation = e => {
		setSelectedStation(selectedStation); // Update the selected option when the user makes a choice
	};

	const handleSelectRegion = e => {
		setSelectedRegion(e.selectedCadre); // Update the selected option when the user makes a choice
	};








		const doFilter = (e) => {
 		e.preventDefault();
		  const filters = {
			  ...(startDate? { "assumption_date_start_date": startDate }:""),
			  ...(endDate? { "assumption_date_end_date": endDate }:""),
			  ...(dorStartDate? { "expected_date_of_return_start_date": dorStartDate }:""),
			  ...(dorEndDate? { "expected_date_of_return_end_date": dorEndDate }:""),
  			...(selectedStation?.id && { "station_id": selectedStation.id }),
  			...(selectedRegion && { "region_id": selectedRegion.id }),
  			...(postingStatus && { "posting_type": postingStatus }),
			};

    	onFilter(filters);

		onCloseClick();
	};


	return (
				<Offcanvas direction="end" isOpen={show} toggle={onCloseClick} className="overflow-auto">

			<form>
				<OffcanvasHeader className="bg-light" toggle={onCloseClick}>
					Posting Filters
				</OffcanvasHeader>
				<div >
					<OffcanvasBody>


					<div className="row g-1">
						<label
							htmlFor="datepicker-range"
							className="form-label text-muted text-uppercase fw-semibold">
							Date of assumption
						</label>
							<div className="col-lg-6 mb-2">

								<label
									htmlFor="datepicker-range"
									className="form-label text-muted text-uppercase fw-semibold mb-3">
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
									className="form-label text-muted text-uppercase fw-semibold mb-3">
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
						<hr/>

					</div>

						<div className="row g-1">
						<label
							htmlFor="datepicker-range"
							className="form-label text-muted text-uppercase fw-semibold">
							Expected Date of return
						</label>
							<div className="col-lg-6 mb-2">

								<label
									htmlFor="datepicker-range"
									className="form-label text-muted text-uppercase fw-semibold mb-3">
									From
								</label>
								<Flatpickr
									value={dorStartDate}
									className="form-control"
									id="datepicker-publish-input"
									placeholder="Select a date"


									onChange={(selectedDates, dateStr) => {
        								setDorStartDate(moment(dateStr).format('YYYY-MM-DD'));
      								}}
								/>

							</div>
							<div className="col-lg-6 mb-2">

								<label
									htmlFor="endDate"
									className="form-label text-muted text-uppercase fw-semibold mb-3">
									To
								</label>
								<Flatpickr
									className="form-control"
									value={dorEndDate}
									id="expected_date_of_return_end_date"
									placeholder="Select a date"
									onChange={(selectedDates, dateStr) => {
        								setDorEndDate(moment(dateStr).format('YYYY-MM-DD'));
      								}}
								/>
							</div>
						<hr/>

					</div>


					<div className="row g-2">

							<div className="col-lg-6">
									<div className="mb-4">
									<label
										htmlFor="rank-select"
										className="form-label text-muted text-uppercase fw-semibold mb-3">
										Region
									</label>

										<Select
											value={selectedRegion}
											options={regions || []}
											isSearchable={true}
											getOptionValue={option => option.id}
											getOptionLabel={option => option.name}
											placeholder="Select an option"
											onChange={e => {
											setSelectedRegion(e);
											fetchStations(e.id);
										}}

										/>

									</div>
							</div>
							<div className="col-lg-6">
							<div className="mb-4">
								<label
									htmlFor="rank-select"
									className="form-label text-muted text-uppercase fw-semibold mb-3">
									Station
								</label>

									<Select
										value={selectedStation}
										getOptionValue={option => option.id}
										getOptionLabel={option => option.name}
										options={stations || []}
										isSearchable={true}
										placeholder="Select an option"
										onChange={e => 	setSelectedStation(e)}
									/>
							</div>
							</div>
					</div>

			<div className="mb-4">
				  <label
					htmlFor="status-select"
					className="form-label text-muted text-uppercase fw-semibold mb-3">
					Posting Status
				  </label>
					  <div className="row g-2">
						<div className="col-lg-12">

							<div className="form-check">
							<input
							  className="form-check-input"
							  type="radio"
							  name="postingStatus"
							  id="radioActive"
							  value="active"
							  onChange={() => setPostingStatus("0")}
							  checked={postingStatus === "0"}
							/>
							<label className="form-check-label" htmlFor="radioActive">
							  Primary
							</label>
						  </div>
						  <div className="form-check">
							<input
							  className="form-check-input"
							  type="radio"
							  name="postingStatus"
							  id="radioRetired"
							  value="1"
							  onChange={() => setPostingStatus("1")}
							  checked={postingStatus === "1"}
							/>
							<label className="form-check-label" htmlFor="radioRetired">
							  Extension
							</label>
						  </div>
						  <div className="form-check">
							<input
							  className="form-check-input"
							  type="radio"
							  name="postingStatus"
							  id="radioResigned"
							  value="2"
							  onChange={() => setPostingStatus("2")}
							  checked={postingStatus === "2"}
							/>
							<label className="form-check-label" htmlFor="radioResigned">
							  Recalled
							</label>
						  </div>
							 <div className="form-check">
							<input
							  className="form-check-input"
							  type="radio"
							  name="postingStatus"
							  id="radioTerminated"
							  value="3"
							  onChange={() => setPostingStatus("3")}
							  checked={postingStatus === "3"}
							/>
							<label className="form-check-label" htmlFor="radioTerminated">
								Cross posted
							</label>
						  </div>
						  <div className="form-check">
							<input
							  className="form-check-input"
							  type="radio"
							  name="postingStatus"
							  id="radioTerminated"
							  value="4"
							  onChange={() => setPostingStatus("4")}
							  checked={postingStatus === "4"}
							/>
							<label className="form-check-label" htmlFor="radioTerminated">
								Ended
							</label>
						  </div>
						</div>

					  </div>
</div>


				</OffcanvasBody>
					</div>
			<div className="offcanvas-footer border-top p-3 text-center hstack gap-1">
				<button
					className="btn btn-light w-100"
					type="button"
					onClick={onClearFilter}>
					clear
				</button>

				<button
					className="btn btn-light w-100"
					type="button"
					onClick={onCloseClick}>
					Close
				</button>

				<button
					className="btn btn-primary w-100"
					onClick={doFilter}>
					Submit
				</button>
			</div>
			</form>

		</Offcanvas>
	);
};

export default PostingFilter;
