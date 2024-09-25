import React, { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from 'antd';
import DocumentMediaDropDown from '../../components/DocumentMediaDropDown';
import NewEditCrime from './NewEditCrime';
import ManageCrimes from '../../modals/ManageCrimes';
import { GET_CRIMES_COMMITTED_API } from '../../services/api';
import {
	antIconSync,
	formatDate,
	formatDateWord,
	formatPoiName,
	formatGetInitialsName,
	notifyWithIcon,
	request,
} from '../../services/utilities';
import Spin from 'antd/es/spin';

const CrimeCommitted = () => {
	const [loaded, setLoaded] = useState(false);
	const [crimesData, setCrimesData] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [working, setWorking] = useState(false);
	const [crimes, setCrimes] = useState(null);

	const navigate = useNavigate();
	const params = useParams();

	const fetchCrimesDetails = useCallback(async Id => {
		try {
			const rs = await request(GET_CRIMES_COMMITTED_API.replace(':id', Id));
			console.log(rs.crimes_committed);
			setCrimesData(rs.crimes_committed);
		} catch (error) {
			throw error;
		}
	}, []);

	useEffect(() => {
		if (!loaded) {
			fetchCrimesDetails(params.id)
				.then(_ => setLoaded(true))
				.catch(e => {
					notifyWithIcon('error', e.message);
					navigate('/not-found');
				});
		}
	}, [fetchCrimesDetails, loaded, navigate, params.id, crimesData]);

	const handleEditClick = id => {
		navigate(`/pois/${id}/edit`);
	};

	const addCrimes = () => {
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const editCrimes = item => {
		document.body.classList.add('modal-open');
		setCrimes(item);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setCrimes(null);
		document.body.classList.remove('modal-open');
	};

	const refreshTable = async () => {
		setWorking(true);

		await fetchCrimesDetails(params.id);
	};

	return (
		<>
			<div className="container-fluid no-printme mb-5">
				{loaded && crimesData ? (
					<div className="card">
						<div className="card-body">
							<div className="d-flex align-items-center mb-4">
								<h5 className="card-title flex-grow-1 mb-0">Crime Committed</h5>
								<div onClick={() => addCrimes()}>
									<label htmlFor="formFile" className="btn btn-success">
										<i className="ri-add-fill me-1 align-bottom"></i> Add
									</label>
								</div>
							</div>
							<div className="row">
								{/* Generate columns dynamically based on crimesData */}
								{crimesData.map((item, i) => (
									<div key={i} className="col-xxl-4 col-sm-4">
										<div className="card profile-project-card shadow-none profile-project-warning">
											<div className="card-body p-4">
												<div className="d-flex">
													<div className="flex-grow-1 text-muted overflow-hidden">
														<h5 className="fs-14 text-truncate">
															<a href="#" className="text-body">
																{item.crime.name || 'N/A'}
															</a>
														</h5>
														<p className="text-muted text-truncate mb-0">
															Crime Date:
															<span className="fw-semibold text-body">
																{item.crime_date || 'N/A'}
															</span>
														</p>
														<p className="text-muted text-truncate mb-0">
															Casualties Recorded:
															<span className="fw-semibold text-body">
																{item.casualties_recorded || 'N/A'}
															</span>
														</p>
														<p className="text-muted text-truncate mb-0">
															Arresting Body:
															<span className="fw-semibold text-body">
																{item.arresting_body.name || 'N/A'}
															</span>
														</p>
														<p className="text-muted text-truncate mb-0">
															Place Of Detention:
															<span className="fw-semibold text-body">
																{item.place_of_detention || 'N/A'}
															</span>
														</p>
														<p className="text-muted text-truncate mb-0">
															Action Taken:
															<span className="fw-semibold text-body">
																{item.action_taken || 'N/A'}
															</span>
														</p>
													</div>
												</div>
												{/* Edit button */}
												<div className="mt-3 d-flex justify-content-end gap-2">
													<button
														className="btn btn-sm btn-outline-primary"
														onClick={() => editCrimes(item)}
													>
														Edit
													</button>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
							{/* end row */}
						</div>
					</div>
				) : (
					<div>
						<Spin spinning={true} indicator={antIconSync}>
							<div className="fetching" />
						</Spin>
					</div>
				)}
			</div>
			{showModal && (
				<ManageCrimes
					closeModal={() => closeModal()}
					crimesCommitted={crimes}
					update={async () => {
						await refreshTable().then(_ => setWorking(false));
					}}
				/>
			)}
		</>
	);
};

export default CrimeCommitted;
