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
import { DatePicker } from 'antd';

const PromotionBriefFilter = ({ show, onCloseClick, onFilter, onClearFilter }) => {
	const [loaded, setLoaded] = useState(false);
	const [ranks, setRanks] = useState([]);
	const [cadres, setCadres] = useState([]);
    const [years, setYears] = useState([]);

	const [selectedRank, setSelectedRank] = useState(''); // State to track the selected option
	const [selectedCadre, setSelectedCadre] = useState(''); // State to track the selected option
	const [selectedYear, setSelectedYear] = useState(''); // State to track the selected option

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

              const currentYear = (new Date()).getFullYear();
              const startYear = 2012;
              const yearData = Array.from(
                  { length: currentYear - startYear + 1 },
                  (_, index) => startYear + index
                );

              const formattedYears = yearData.map((year, index) => ({
                  id: index + 4, // Adjust the starting id as needed
                  year: `${year}`,
                }));
                setYears(formattedYears)
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);





	const clearFilterParams = useCallback(() => {
		if (clearFilter) {

			setSelectedRank('');
			setSelectedCadre('');
			setSelectedYear('')
			setRanks([]);

			dispatch(doClearFilter(false));
		}
	}, [clearFilter, dispatch]);

	const setFilters = useCallback(() => {
		const filters = parseHashString(location.hash);
		if (filters) {
			setSelectedYear(
				filters?.year
					? years.find(
							year => year.year === Number(filters.year)
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
	]);

	useEffect(() => {
		if (!loaded) {
			fetchCadres();

			setFilters();

			setLoaded(true);
		}

		clearFilterParams();
	}, [
		clearFilterParams,
		fetchCadres,
		loaded,
		setFilters,
	]);



	const doFilter = e => {
		e.preventDefault();
		const filterObject = {
			...(selectedRank?.id && { rank_id: selectedRank.id }),
			...(selectedCadre?.id && { cadre_id: selectedCadre.id }),
			...(selectedYear?.year && { year: selectedYear.year })

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
					Promotion Brief Filter
				</OffcanvasHeader>
				<div className="flex-grow-1 overflow-auto">
					<OffcanvasBody >
                        <div className="row g-1 mb-4">
                            <label
							htmlFor="datepicker-range"
							className="form-label text-muted text-uppercase fw-semibold">
							Year
						</label>
                             <Select
										isClearable
										value={selectedYear}
										options={years || []}
										isSearchable={true}
										getOptionValue={option => option.year}
										getOptionLabel={option => option.year}
										placeholder="Select an option"
										onChange={e => {
											setSelectedYear(e);
										}}
									/>

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

export default PromotionBriefFilter;
