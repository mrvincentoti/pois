import React, { useState } from 'react';
import {
	Offcanvas,
	OffcanvasHeader,
	OffcanvasBody,
	Label,
	Input,
	Row,
	Col,
} from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import Select from 'react-select';
import { useLocation, useNavigate } from 'react-router-dom';

const TrainingFilter = ({ show, onCloseClick }) => {
	const [states, setStates] = useState([]);
	const [selectedState, setSelectedState] = useState(null);

	const navigate = useNavigate();
	const location = useLocation();

	function handleSelectState(selectCountry) {
		setSelectedState(selectCountry);
	}

	const doFilter = () => {
		navigate(`${location.pathname}?`);
		onCloseClick();
	};

	const retirementData = [
		{ value: 'Option 1', label: 'Taken training' },
		{ value: 'Option 2', label: 'Not taken training' },
	];

	const countryData = [
		{ value: 'Argentina', label: 'Hacker' },
		{ value: 'Belgium', label: 'Programmer' },
		{ value: 'Brazil', label: 'Analyst' },
		{ value: 'Colombia', label: 'Cyber Security' },
		{ value: 'Denmark', label: 'ETL' },
		{ value: 'France', label: 'Data Cleaning' },
	];

	const [selectedOption, setSelectedOption] = useState(''); // State to track the selected option
	const [selectedCountry, setSelectedCountry] = React.useState([]);

	const handleSelectChange = e => {
		setSelectedOption(e.target.value); // Update the selected option when the user makes a choice
	};

	const handleSelectCountry = selectedOptions => {
		setSelectedCountry(selectedCountry);
	};

	return (
		<Offcanvas
			direction="end"
			isOpen={show}
			id="offcanvasExample"
			toggle={onCloseClick}
		>
			<OffcanvasHeader className="bg-light" toggle={onCloseClick}>
				Training Fliters
			</OffcanvasHeader>
			{/* <form action="" className="d-flex flex-column justify-content-end h-100"> */}
			<OffcanvasBody>
				<div className="mb-4">
					<Label
						htmlFor="datepicker-range"
						className="form-label text-muted text-uppercase fw-semibold mb-3"
					>
						Training Year
					</Label>
					<Flatpickr
						className="form-control"
						id="datepicker-publish-input"
						placeholder="Select a date"
						options={{
							altInput: true,
							altFormat: 'Y',
							dateFormat: 'y',
						}}
					/>
				</div>
				{/* <div className="mb-4">
                    <Label
                        htmlFor="country-select"
                        className="form-label text-muted text-uppercase fw-semibold mb-3"
                    >
                        State of Origin
                    </Label>

                    <Select
                        className="mb-0"
                        value={selectedState}
                        onChange={() => {
                            handleSelectState();
                        }}
                        options={states}
                        id="country-select"
                    ></Select>
                </div> */}
				<div className="mb-4">
					<Label
						htmlFor="country-select"
						className="form-label text-muted text-uppercase fw-semibold mb-3"
					>
						Options
					</Label>

					<Select
						value={selectedOption}
						onChange={handleSelectChange}
						options={retirementData}
						isSearchable={true}
						placeholder="Select an option"
					/>
				</div>
				{/* <div className="mb-4">
                    <Label
                        htmlFor="country-select"
                        className="form-label text-muted text-uppercase fw-semibold mb-3"
                    >
                        Skills
                    </Label>

                    <Select
                        isMulti
                        name="country-select"
                        id="country-select"
                        options={countryData}
                        value={selectedCountry}
                        onChange={handleSelectCountry}
                    />
                </div>
                <div className="mb-4">
                    <Label
                        htmlFor="status-select"
                        className="form-label text-muted text-uppercase fw-semibold mb-3"
                    >
                        Status
                    </Label>
                    <Row className="g-2">
                        <Col lg={6}>
                            <div className="form-check">
                                <Input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="inlineCheckbox1"
                                    defaultValue="option1"
                                />
                                <Label className="form-check-label" htmlFor="inlineCheckbox1">
                                    Deployed
                                </Label>
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="form-check">
                                <Input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="inlineCheckbox2"
                                    defaultValue="option2"
                                />
                                <Label className="form-check-label" htmlFor="inlineCheckbox2">
                                    In Training
                                </Label>
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="form-check">
                                <Input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="inlineCheckbox3"
                                    defaultValue="option3"
                                />
                                <Label className="form-check-label" htmlFor="inlineCheckbox3">
                                    Active Employees
                                </Label>
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div className="form-check">
                                <Input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="inlineCheckbox4"
                                    defaultValue="option4"
                                />
                                <Label className="form-check-label" htmlFor="inlineCheckbox4">
                                    Disabled
                                </Label>
                            </div>
                        </Col>
                    </Row>
                </div> */}
			</OffcanvasBody>
			<div className="offcanvas-footer border-top p-3 text-center hstack gap-2">
				<button
					className="btn btn-light w-100"
					type="button"
					onClick={onCloseClick}
				>
					Clear Filter
				</button>
				<button
					type="submit"
					className="btn btn-primary w-100"
					onClick={doFilter}
				>
					Filters
				</button>
			</div>
			{/* </form> */}
		</Offcanvas>
	);
};

export default TrainingFilter;
