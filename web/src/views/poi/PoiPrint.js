import '../../assets/scss/profile.css';
import {
	formatCadre,
	formatDate,
	formatDateWord,
	formatDateYear,
	formatFullName,
	formatGetInitialsName,
} from '../../services/utilities';

import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
const PoiPrint = ({ poiData }) => {
	const [open, setOpen] = useState(false);
	const [poi, setPoi] = useState(null);

	useEffect(() => {
		setPoi(poiData);
	}, [poiData]);

	return (
		<>
			<div className="chat-wrapper d-lg-flex gap-1 mx-n4 mt-n4 p-1">
				<div className="row w-100">
					<div className="col-5 border-right">
						<div className="p-3 d-flex flex-column h-100 text-left align-items-right">
							<div className="p-4 card-body">
								<div className="text-center mb-4">
									<div className="profile-user position-relative d-inline-block  mb-4">
										{poiData?.photo ? (
											<img
												src={poiData?.photo}
												className="rounded-circle avatar-xl img-thumbnail user-profile-image"
												alt="user-profile"
											/>
										) : (
											<div className="avatar-xl">
												<div
													className="avatar-title rounded-circle bg-light text-primary text-uppercase "
													style={{ fontSize: '60px' }}
												>
													{formatGetInitialsName(poiData)}
												</div>
											</div>
										)}
									</div>
									<h5 className="fs-16 mb-1">{formatFullName(poiData)}</h5>
									<p className="text-muted mb-0">
										{poiData?.rank?.name || 'N/A'}
									</p>
								</div>

								<div className="d-flex align-items-left">
									<div className="mb-4 pb-2">
										<h5 className="card-title text-decoration-underline mb-3">
											BIO DATA
										</h5>
										<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
											<div className="flex-grow-1">
												<h6 className="fs-14 mb-2 text-black">
													• Date of Birth:{' '}
													<span className="text-muted">
														{poiData?.dob
															? formatDateWord(poiData.dob)
															: 'N/A'}
													</span>
												</h6>
												<h6 className="fs-14 mb-2 text-black">
													• State of Origin:{' '}
													<span className="text-muted">
														{' '}
														{poiData?.state?.name || 'N/A'}{' '}
													</span>
												</h6>
												<h6 className="fs-14 mb-2 text-black">
													• Marital Status:{' '}
													<span >
														{poiData?.marital_status
															? poiData.marital_status
															: 'N/A'}
													</span>
												</h6>

												<h6 className="fs-14 mb-2 text-black">
													• Contact :{' '}
													<span>
														{poiData?.phone
															? poiData.phone
															: 'N/A'}
													</span>
												</h6>

												{poiData?.nok &&
													poiData.nok.length > 0 ? (
													poiData.nok.map((item, i) => (
														<>
															<h6 className="fs-14 mb-2 text-black">
																• NOK name :{' '}
																<span >
																	{item?.first_name
																		? `${item.first_name} ${item.last_name}`
																		: 'N/A'}
																</span>

															</h6>

															<h6 className="fs-14 mb-2 text-black">
																• NOK Contact :{' '}
																<span className="text-muted">
																	{item?.phone
																		? `${item.phone}`
																		: 'N/A'}
																</span>

															</h6>
														</>
													))) : ("")}
											</div>
										</div>
									</div>
								</div>

								<div className="d-flex align-items-left">
									<div className="mb-4 pb-2">
										<h5 className="card-title text-decoration-underline mb-3">
											EDUCATION
										</h5>
										<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
											<div className="flex-grow-1">
												<h6 className="fs-14 mb-2">•{' '}
													{poiData?.qualification
														? poiData?.qualification
														: 'N/A'}
												</h6>
											</div>
										</div>
									</div>
								</div>

								<div className="d-flex align-items-left">
									<div className="mb-4 pb-2">
										<h5 className="card-title text-decoration-underline mb-3">
											LANGUAGES
										</h5>
										<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
											<div className="flex-grow-1">
												<h6 className="fs-14 mb-2"> •{' '}
													{poiData?.language_spoken
														? poiData?.language_spoken
														: 'N/A'}
												</h6>
											</div>
										</div>
									</div>
								</div>

								<div className="d-flex align-items-left">
									<div className="mb-4 pb-2">
										<h5 className="card-title text-decoration-underline mb-3">
											EMPLOYMENT BACKGROUND{' '}
										</h5>
										<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
											<div className="flex-grow-1">
												<h6 className="fs-14 mb-2 text-black">
													•{' '} PF(S) Number:{' '}
													<span className="text-muted">
														{poiData?.pf_num
															? poiData.pf_num
															: 'N/A'}
													</span>
												</h6>


												<h6 className="fs-14 mb-2 text-black">
													•{' '} Date of Employment:{' '}
													<span className="text-muted">
														{poiData?.date_of_appointment
															? formatDateWord(poiData.date_of_appointment)
															: 'N/A'}
													</span>
												</h6>
												<h6 className="fs-14 mb-2 text-black">
													•{' '} Employment Rank: {' '}
													<span className="text-muted">
														{poiData?.grade_on_app
															? poiData.grade_on_app
															: 'N/A'}{' '}
													</span>
												</h6>

												<h6 className="fs-14 mb-2 text-black">
													•{' '} Cadre:{' '}
													<span className="text-muted">
														{poiData?.cadre?.name || 'N/A'}
													</span>
												</h6>

												<h6 className="fs-14 mb-2 text-black">
													•{' '} Current Rank:
													<span className="text-muted">
														{poiData?.rank
															? ` GL.${poiData.rank.level} (${poiData.rank.name})`
															: 'N/A'}
													</span>
												</h6>
												<h6 className="fs-14 mb-2 text-black">
													•{' '} Date of Retirement: {' '}
													<span className="text-muted">
														{poiData?.date_of_retirement
															? formatDateWord(poiData.date_of_retirement)
															: 'N/A'}{' '}
													</span>
												</h6>

											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="col-7">
						<div className="w-100 pt-4 px-4 file-manager-content-scroll">
							<div id="folder-list" className="mb-2">
								<div className="row g-2 mb-3">
									<div className="col-12">
										<div className="setRight">
											<span className="card-title mb-3">
												<h1 className="fs-1 mb-0">POI PROFILE</h1>
											</span>
										</div>

										<div className="d-flex align-items-center">
											<div className="mb-4 pb-2 w-100">
												<h5 className="card-title text-decoration-underline mb-3 setRight">
													<a href={`/promotions/${poiData?.id}`}>CAREER PROGRESSION</a>
												</h5>
												{poiData?.promotions &&
													poiData.promotions.length > 0 ? (
													poiData.promotions.map((item, i) => (
														<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
															<div className="flex-grow-1">
																<h6 className="fs-14 mb-1 text-uppercase">
																	•{' '} GL.
																	{item.current_rank_level
																		? item.current_rank_level
																		: 'N/A'}{' '}
																	- W.E.F {' '}
																	{item.promotion_date
																		? formatDateWord(item.promotion_date)
																		: 'N/A'} -
																	{item.promotion_cadre ? item.promotion_cadre
																		: 'N/A'}
																</h6>
															</div>
														</div>
													))
												) : (
													<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
														<div className="flex-grow-3">
															<h6 className="fs-14 mb-1"> •{' '}GL.
																{poiData?.rank
																	? poiData.rank.level
																	: 'N/A'}{' '}
																- W.E.F{' '}
																{poiData?.date_of_appointment
																	? formatDateWord(poiData?.date_of_appointment)
																	: 'N/A'}
																-{' '}
																{poiData?.cadre ? formatCadre(poiData.cadre.id)
																	: 'N/A'}
															</h6>
														</div>
													</div>
												)}
												{poiData?.stagnation === 3
													?
													<h6 className="fs-14 mb-2">
														<span className="text-muted">
															<>Stagnated at Current Rank- {poiData?.rank
																? ` GL.${poiData.rank.level} (${poiData.rank.name})`
																: 'N/A'} </>

														</span>
													</h6>
													: ''}

											</div>
										</div>

										<div className="d-flex align-items-right">
											<div className="mb-4 pb-2 w-100">
												<h5 className="card-title text-decoration-underline mb-3 setRight">
													<a href={`/deployments/${poiData?.id}`}>DEPLOYMENTS</a>
												</h5>

												{poiData?.deployments &&
													poiData.deployments.length > 0 ? (
													poiData.deployments.map((item, i) => (
														<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
															<div className="flex-grow-1">
																<h6 className="fs-14 mb-1">
																	•{' '}

																	{item.type === 2 ?
																		`${item.directorate?.description} (${item.directorate?.name})` : item.deployed_to}{' '}



																	-{' '}
																	{item.date_of_assumption
																		? formatDateYear(
																			item.date_of_assumption,
																			'D MMM, YYYY'
																		)
																		: 'N/A'}{' '}




																</h6>
															</div>
														</div>
													))
												) : (
													<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
														<div className="flex-grow-3">
															<h6 className="fs-14 mb-1"> •{' '} N/A</h6>
														</div>
													</div>
												)}
											</div>
										</div>

										<div className="d-flex align-items-center">
											<div className="mb-4 pb-2 w-100">
												<h5 className="card-title text-decoration-underline mb-3 setRight">
													<a href={`/trainings/${poiData?.id}`}>TRAININGS & SKILLS</a>
												</h5>

												{poiData?.trainings &&
													poiData.trainings.length > 0 ? (
													poiData.trainings.map((item, i) => (
														<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
															<div className="flex-grow-1">
																<h6 className="fs-14 mb-1">•{' '}
																	{item.training.name
																		? item.training.name
																		: 'N/A'}{' '}
																	(
																	{item.date_attended
																		? formatDateYear(item.date_attended)
																		: 'N/A'}
																	)
																</h6>
															</div>
														</div>
													))
												) : (
													<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
														<div className="flex-grow-3">
															<h6 className="fs-14 mb-1">•{' '} N/A</h6>
														</div>
													</div>
												)}
											</div>
										</div>

										<div className="d-flex align-items-center">
											<div className="mb-4 pb-2 w-100">
												<h5 className="card-title text-decoration-underline mb-3 setRight">
													<a href={`/employee-posting/${poiData?.id}`}>POSTING HISTORY</a>
												</h5>

												{poiData?.postings &&
													poiData.postings.length > 0 ? (
													poiData.postings.map((item, i) => (
														<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
															<div className="flex-grow-1">
																<h6 className="fs-14 mb-1"> •{' '}
																	{item.designation_at_post ? item.designation_at_post : 'N/A'}	{item.station.name ? item.station.name : 'N/A'}{' '}
																	(
																	{formatDateYear(
																		item.assumption_date,
																		'D MMM, YYYY'
																	)}{' '}
																	-{' '}
																	{formatDateYear(
																		item.date_of_return,
																		'D MMM, YYYY'
																	)}
																	)
																</h6>
															</div>
														</div>
													))
												) : (
													<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
														<div className="flex-grow-3">
															<h6 className="fs-14 mb-1">•{' '} N/A</h6>
														</div>
													</div>
												)}
											</div>
										</div>

										<div className="d-flex align-items-center">
											<div className="mb-4 pb-2 w-100">
												<h5 className="card-title text-decoration-underline mb-3 setRight">
													<a href={`/awards/${poiData?.id}`}>AWARDS & ACHIEVEMENTS</a>
												</h5>

												{poiData?.awards &&
													poiData.awards.length > 0 ? (
													poiData.awards.map((item, i) => (
														<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
															<div className="flex-grow-1">
																<h6 className="fs-14 mb-1 ">•{' '}
																	{item.award.name ? item.award.name : 'N/A'}- (
																	{item.date_given
																		? formatDateWord(item.date_given)
																		: 'N/A'}
																	)
																</h6>
															</div>
														</div>
													))
												) : (
													<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
														<div className="flex-grow-3">
															<h6 className="fs-14 mb-1">•{' '} N/A</h6>
														</div>
													</div>
												)}
											</div>
										</div>

										<div className="d-flex align-items-center">
											<div className="mb-4 pb-2 w-100">
												<h5 className="card-title text-decoration-underline mb-3 setRight">
													<a href={`/sanctions/${poiData?.id}`}>DISCIPLINARY CASES</a>
												</h5>

												{poiData?.sanctions &&
													poiData.sanctions.length > 0 ? (
													poiData.sanctions.map((item, i) => (
														<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
															<div className="flex-grow-1">
																<h6 className="fs-14 mb-1 ">•{' '}
																	{item.sanction.name ? item.sanction.name : 'N/A'}- (
																	{item.date_given
																		? formatDateYear(item.date_given)
																		: 'N/A'}


																	)
																</h6>
															</div>
														</div>
													))
												) : (
													<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
														<div className="flex-grow-3">
															<h6 className="fs-14 mb-1">•{' '} N/A</h6>
														</div>
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							</div>
							<div></div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
export default PoiPrint;
