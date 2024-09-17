import React, { useState, useCallback, useEffect } from 'react';
import { Offcanvas, OffcanvasHeader, OffcanvasBody } from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import { useLocation, useNavigate } from 'react-router-dom';
import { notifyWithIcon, request } from '../services/utilities';
import {
	FETCH_ALL_SPECIALTIES_API,
	FETCH_CADRES_API,
	FETCH_RANKS_BY_CADRE_API,
	FETCH_STATES_API,
} from '../services/api';
import { error } from './FormBlock';
import moment from 'moment';

const AuditFilter = ({ show, onCloseClick, onFilter, filter }) => {
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);

	const [module, setModule] = useState(null);

	const [empProfile, setEmpProfile] = useState(false);
	const [empDeployment, setEmpDeployment] = useState(false);
	const [empAward, setEmpAward] = useState(false);
	const [empPromotion, setEmpPromotion] = useState(false);
	const [empPosting, setEmpPosting] = useState(false);
	const [empTraining, setEmpTraining] = useState(false);
	const [empConference, setEmpConference] = useState(false);
	const [empSanction, setEmpSanction] = useState(false);

	const [authUser, setAuthUser] = useState(false);
	const [authPermission, setAuthPermission] = useState(false);
	const [authRole, setAuthRole] = useState(false);

	const [setupDirectorate, setSetupDirectorate] = useState(false);
	const [setupDepartment, setSetupDepartment] = useState(false);
	const [setupCadre, setSetupCadre] = useState(false);
	const [setupUnit, setSetupUnit] = useState(false);
	const [setupConference, setSetupConference] = useState(false);
	const [setupSanction, setSetupSanction] = useState(false);
	const [setupRank, setSetupRank] = useState(false);
	const [setupDesignation, setSetupDesignation] = useState(false);
	const [setupSpeciality, setSetupSpeciality] = useState(false);
	const [setupAward, setSetupAward] = useState(false);
	const [setupTraining, setSetupTraining] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		if (filter) {
			setStartDate(filter.from_date || null);
			setEndDate(filter.to_date || null);
			setModule(filter.module || null);
		}
	}, [filter]);

	const generateFilters = () => {
		const filters = {};

		// Date filters
		if (startDate) filters.from_date = startDate;
		if (endDate) filters.to_date = endDate;

		// Employee filters
		if (module) filters.module = module;
		// Employee-related event filters
		if (empProfile) filters.empProfile = empProfile;
		if (empDeployment) filters.empDeployment = empDeployment;
		if (empAward) filters.empAward = empAward;
		if (empPromotion) filters.empPromotion = empPromotion;
		if (empPosting) filters.empPosting = empPosting;
		if (empTraining) filters.empTraining = empTraining;
		if (empConference) filters.empConference = empConference;
		if (empSanction) filters.empSanction = empSanction;

		// Auth filters
		if (authUser) filters.authUser = authUser;
		if (authPermission) filters.authPermission = authPermission;
		if (authRole) filters.authRole = authRole;

		// Setup filters
		if (setupDirectorate) filters.setupDirectorate = setupDirectorate;
		if (setupDepartment) filters.setupDepartment = setupDepartment;
		if (setupCadre) filters.setupCadre = setupCadre;
		if (setupUnit) filters.setupUnit = setupUnit;
		if (setupConference) filters.setupConference = setupConference;
		if (setupSanction) filters.setupSanction = setupSanction;
		if (setupRank) filters.setupRank = setupRank;
		if (setupDesignation) filters.setupDesignation = setupDesignation;
		if (setupSpeciality) filters.setupSpeciality = setupSpeciality;
		if (setupAward) filters.setupAward = setupAward;
		if (setupTraining) filters.setupTraining = setupTraining;

		return filters;
	};

	// Usage
	const filters = generateFilters();

	const doFilter = e => {
		e.preventDefault();
		const filters = generateFilters();

		onFilter(filters);
		onCloseClick();
	};

	return (
		<Offcanvas
			direction="end"
			isOpen={show}
			toggle={onCloseClick}
			className="overflow-auto"
		>
			<form>
				<OffcanvasHeader className="bg-light" toggle={onCloseClick}>
					Audit Filters
				</OffcanvasHeader>
				<div>
					<OffcanvasBody>
						<div className="row g-1 mb-4">
							<label
								htmlFor="datepicker-range"
								className="form-label text-muted text-uppercase fw-semibold"
							>
								Filter Activity Log
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

						<div className="mb-4">
							<label
								htmlFor="status-select"
								className="form-label text-muted text-uppercase fw-semibold mb-3"
							>
								Module
							</label>
							<div className="row g-2">
								<div className="col-lg-6">
									<div className="form-check">
										<input
											className="form-check-input"
											type="radio"
											name="module"
											id="employee"
											onChange={() => setModule('Employee')}
											checked={module === 'Employee'}
										/>
										<label
											className="form-check-label"
											htmlFor="inlineCheckbox1"
										>
											Employee
										</label>
									</div>

									<div className="form-check">
										<input
											className="form-check-input"
											type="radio"
											name="module"
											id="auth"
											onChange={() => setModule('Auth')}
											checked={module === 'Auth'}
										/>
										<label
											className="form-check-label"
											htmlFor="inlineCheckbox1"
										>
											Authentication
										</label>
									</div>
								</div>
								<div className="col-lg-6">
									<div className="form-check">
										<input
											className="form-check-input"
											type="radio"
											name="module"
											id="setup"
											onChange={() => setModule('Setup')}
											checked={module === 'Setup'}
										/>
										<label
											className="form-check-label"
											htmlFor="inlineCheckbox1"
										>
											Setup
										</label>
									</div>
								</div>
							</div>
						</div>

						{module === 'Employee' ? (
							<div className="mb-4">
								<label
									htmlFor="status-select"
									className="form-label text-muted text-uppercase fw-semibold mb-3"
								>
									Employee Sub modules
								</label>
								<div className="row g-2">
									<div className="col-lg-6">
										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setEmpProfile(!empProfile)}
												checked={empProfile}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Profile
											</label>
										</div>

										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setEmpDeployment(!empDeployment)}
												checked={empDeployment}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Deployments
											</label>
										</div>

										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setEmpAward(!empAward)}
												checked={empAward}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Awards
											</label>
										</div>

										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setEmpPromotion(!empPromotion)}
												checked={empPromotion}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Promotions
											</label>
										</div>
									</div>
									<div className="col-lg-6">
										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setEmpPosting(!empPosting)}
												checked={empPosting}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Postings
											</label>
										</div>

										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setEmpTraining(!empTraining)}
												checked={empTraining}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Trainings
											</label>
										</div>

										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setEmpConference(!empConference)}
												checked={empConference}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Conferences
											</label>
										</div>

										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setEmpSanction(!empSanction)}
												checked={empSanction}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Sanctions
											</label>
										</div>
									</div>
								</div>
							</div>
						) : (
							''
						)}

						{module === 'Auth' ? (
							<div className="mb-4">
								<label
									htmlFor="status-select"
									className="form-label text-muted text-uppercase fw-semibold mb-3"
								>
									Authentication Sub modules
								</label>
								<div className="row g-2">
									<div className="col-lg-6">
										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setAuthUser(!authUser)}
												checked={authUser}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Users
											</label>
										</div>

										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setAuthRole(!authRole)}
												checked={authRole}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Roles
											</label>
										</div>
									</div>
									<div className="col-lg-6">
										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setAuthPermission(!authPermission)}
												checked={authPermission}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Permissions
											</label>
										</div>
									</div>
								</div>
							</div>
						) : (
							''
						)}

						{module === 'Setup' ? (
							<div className="mb-4">
								<label
									htmlFor="status-select"
									className="form-label text-muted text-uppercase fw-semibold mb-3"
								>
									Setup sub modules
								</label>
								<div className="row g-2">
									<div className="col-lg-6">
										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setSetupDirectorate(!setupDirectorate)}
												checked={setupDirectorate}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Directorate
											</label>
										</div>

										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setSetupDepartment(!setupDepartment)}
												checked={setupDepartment}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Department
											</label>
										</div>

										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setSetupCadre(!setupCadre)}
												checked={setupCadre}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Cadre
											</label>
										</div>

										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setSetupUnit(!setupUnit)}
												checked={setupUnit}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Unit
											</label>
										</div>

										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setSetupConference(!setupConference)}
												checked={setupConference}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Conference
											</label>
										</div>

										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setSetupSanction(!setupSanction)}
												checked={setupSanction}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Sanction
											</label>
										</div>
									</div>
									<div className="col-lg-6">
										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setSetupRank(!setupRank)}
												checked={setupRank}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Rank
											</label>
										</div>

										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setSetupDesignation(!setupDesignation)}
												checked={setupDesignation}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Designation
											</label>
										</div>

										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setSetupSpeciality(!setupSpeciality)}
												checked={setupSpeciality}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Speciality
											</label>
										</div>

										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setSetupAward(!setupAward)}
												checked={setupAward}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Award
											</label>
										</div>

										<div className="form-check">
											<input
												className="form-check-input"
												type="checkbox"
												id="inlineCheckbox1"
												defaultValue="option1"
												onChange={() => setSetupTraining(!setupTraining)}
												checked={setupTraining}
											/>
											<label
												className="form-check-label"
												htmlFor="inlineCheckbox1"
											>
												Training
											</label>
										</div>
									</div>
								</div>
							</div>
						) : (
							''
						)}
					</OffcanvasBody>
				</div>
				<div className="offcanvas-footer border-top p-3 text-center hstack gap-1">
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

export default AuditFilter;
