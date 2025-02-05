import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
	GET_FEEDBACK_API
} from '../../services/api';
import {
	notifyWithIcon,
	request,
	formatDate,
} from '../../services/utilities';
import PreviewMedia from './PreviewMedia';
import { limit, paginate } from '../../services/constants';
import { useQuery } from '../../hooks/query';
import AppPagination from '../../components/AppPagination';

function ViewFeedback() {
	const [loaded, setLoaded] = useState(false);
	const [meta, setMeta] = useState(paginate);
	const [feedBackData, setFeedBackData] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [showPreviewModal, setShowPreviewModal] = useState(false);
	const [selectedMedia, setSelectedMedia] = useState(null);
	const [selectedMediaFile, setSelectedMediaFile] = useState(null);
	const [working, setWorking] = useState(false);
	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);
	const [fetching, setFetching] = useState(true);

	const navigate = useNavigate();
	const params = useParams();
	const query = useQuery();

	const fetchFeedBackDetails = useCallback(async Id => {
		try {
			const rs = await request(GET_FEEDBACK_API.replace(':id', Id));
			setFeedBackData(rs.feedback);
		} catch (error) {
			throw error;
		}
	}, []);

	
	useEffect(() => {
		if (!loaded) {
			fetchFeedBackDetails(params.id)
				.then(_ => setLoaded(true))
				.catch(e => {
					notifyWithIcon('error', e.message);
					navigate('/not-found');
				});
		}
	}, [fetchFeedBackDetails, loaded, navigate, params.id]);


	const previewMedia = item => {
		document.body.classList.add('modal-open');
		setSelectedMediaFile(item);
		setShowPreviewModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setSelectedMedia(null);
		refreshTable();
		document.body.classList.remove('modal-open');
	};

	const closeModalMedia = () => {
		setShowPreviewModal(false);
		setSelectedMediaFile(null);
		refreshTable();
		document.body.classList.remove('modal-open');
	};

	const refreshTable = async () => {
		const _limit = Number(query.get('entries_per_page') || limit);
	};

	return (
		<>
			<div className="container-fluid">
				{/* end row */}
				<div className="row">
					<div className="col-lg-12">
						<div className="tab-content text-muted">
							<div
								className="tab-pane fade show active"
								id="project-overview"
								role="tabpanel">
								<div className="row">
									<div className="col-xl-8 col-lg-8">
										<div className="card">
											<div className="card-body">
												<div className="text-muted">
													<h6 className="mb-3 fw-semibold text-uppercase">
														SUBJECT: {feedBackData?.subject}
													</h6>
													<hr />
													<strong>Feedback</strong>
													<p>{feedBackData?.feedback}</p>

													<div className="pt-3 border-top border-top-dashed mt-4">
														<div className="row">
															<div className="col-lg-3 col-sm-6">
																<div>
																	<p className="mb-2 text-uppercase fw-semibold fs-13">
																		Feedback Date :
																	</p>
																	<h5 className="fs-15 mb-0">
																		{formatDate(feedBackData?.created_at)}
																	</h5>
																</div>
															</div>
															<div className="col-lg-3 col-sm-6">
																<div>
																	<p className="mb-2 text-uppercase fw-semibold fs-13">
																		Feedback by :
																	</p>
																	<h5 className="fs-15 mb-0">
																		{feedBackData?.created_by_name}
																	</h5>
																</div>
															</div>
															<div className="col-lg-3 col-sm-6">
																<div>
																	<p className="mb-2 text-uppercase fw-semibold fs-13">
																		Status :
																	</p>
																	<div className="badge fs-16">
																		<span
																			className={`badge ${
																				feedBackData?.status === 1
																					? 'bg-success'
																					: 'bg-warning'
																			}`}>
																			{feedBackData?.status === 1
																				? 'Resolved'
																				: 'Pending'}
																		</span>
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
											{/* end card body */}
										</div>
										<div className="text-end mb-4">
											<Link to="/feedback" className="btn btn-danger w-sm me-1">
												Cancel
											</Link>
										</div>
										{/* end card */}
									</div>
									{/* ene col */}
									<div className="col-xl-4 col-lg-4">
										<div className="card">
											<div className="card-header align-items-center d-flex border-bottom-dashed">
												<h4 className="card-title mb-0 flex-grow-1">
													Attachment
												</h4>
											</div>
											<div className="card-body">
												<div className="vstack gap-2">
													<div className="border rounded border-dashed p-2">
														<div className="d-flex align-items-center">
															{feedBackData?.attachment ? (
																<>
																	<div className="flex-shrink-0 me-3">
																		<div className="avatar-sm">
																			<div className="avatar-title bg-light text-secondary rounded fs-24">
																				<i className="ri-folder-zip-line" />
																			</div>
																		</div>
																	</div>
																	<div className="flex-grow-1 overflow-hidden">
																		<h5 className="fs-15 mb-1">
																			<a
																				href="#"
																				className="text-body text-truncate d-block">
																				Attachment by user
																			</a>
																		</h5>
																		<div>Size: {feedBackData?.file_size}</div>
																	</div>
																	<div className="flex-shrink-0 ms-2">
																		<div className="d-flex gap-1">
																			<button
																				onClick={() =>
																					previewMedia(feedBackData?.attachment)
																				}
																				type="button"
																				className="btn btn-icon text-muted btn-sm fs-18">
																				<i
																					className="ri-eye-2-line"
																					style={{ color: '#11d1b7' }}
																				/>
																			</button>
																		</div>
																	</div>
																</>
															) : (
																<p className="text-muted">
																	No attachment available
																</p>
															)}
														</div>
													</div>
												</div>
												<div className="align-items-center mt-1 pt-2 justify-content-between row text-center text-sm-start">
													<AppPagination meta={meta} />
												</div>
											</div>
											{/* end card body */}
										</div>
										{/* end card */}
									</div>
									{/* end col */}
								</div>
								{/* end row */}
							</div>
						</div>

						{showPreviewModal && (
							<PreviewMedia
								id={params.id}
								selectedMediaFile={selectedMediaFile}
								closeModalMedia={() => closeModalMedia()}
								update={async () => {
									await refreshTable().then(() => setWorking(false));
								}}
							/>
						)}
					</div>
					{/* end col */}
				</div>
				{/* end row */}
			</div>
		</>
	);
}

export default ViewFeedback;
