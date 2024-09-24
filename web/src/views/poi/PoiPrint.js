import '../../assets/scss/profile.css';
import {
	formatCadre,
	formatDate,
	formatDateWord,
	formatDateYear,
	formatFullName,
	formatGetInitialsName,
} from '../../services/utilities';
import { useEffect, useState } from 'react';
const PoiPrint = ({ employeeData }) => {
	const [employee, setEmployee] = useState(null);

	useEffect(() => {
		setEmployee(employeeData);
	}, [employeeData]);
	return (
		<div className="chat-wrapper d-lg-flex gap-1 mx-n4 mt-n4 p-1">
			<div className="row w-100">
				<div className="col-5 border-right">
					<div className="p-3 d-flex flex-column h-100 text-left align-items-right">
						<div className="p-4 card-body">
							<div className="text-center mb-4">
								<div className="profile-user position-relative d-inline-block  mb-4">
									{employeeData?.photo ? (
										<img
											src={employeeData?.photo}
											className="rounded-circle avatar-xl img-thumbnail user-profile-image"
											alt="user-profile"
										/>
									) : (
										<div className="avatar-xl">
											<div
												className="avatar-title rounded-circle bg-light text-primary text-uppercase "
												style={{ fontSize: '60px' }}
											>
												{formatGetInitialsName(employeeData)}
											</div>
										</div>
									)}
								</div>
								<h5 className="fs-16 mb-1">{formatFullName(employeeData)}</h5>
								<p className="text-muted mb-0">
									{employeeData?.rank?.name || 'N/A'}
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
													{employeeData?.dob
														? formatDateWord(employeeData.dob)
														: 'N/A'}
												</span>
											</h6>
											<h6 className="fs-14 mb-2 text-black">
												• State of Origin:{' '}
												<span className="text-muted">
													{' '}
													{employeeData?.state?.name || 'N/A'}{' '}
												</span>
											</h6>
											<h6 className="fs-14 mb-2 text-black">
												• Marital Status:{' '}
												<span>
													{employeeData?.marital_status
														? employeeData.marital_status
														: 'N/A'}
												</span>
											</h6>

											<h6 className="fs-14 mb-2 text-black">
												• Contact :{' '}
												<span>
													{employeeData?.phone ? employeeData.phone : 'N/A'}
												</span>
											</h6>

											{employeeData?.nok && employeeData.nok.length > 0
												? employeeData.nok.map((item, i) => (
														<>
															<h6 className="fs-14 mb-2 text-black">
																• NOK name :{' '}
																<span>
																	{item?.first_name
																		? `${item.first_name} ${item.last_name}`
																		: 'N/A'}
																</span>
															</h6>

															<h6 className="fs-14 mb-2 text-black">
																• NOK Contact :{' '}
																<span className="text-muted">
																	{item?.phone ? `${item.phone}` : 'N/A'}
																</span>
															</h6>
														</>
													))
												: ''}
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
											<h6 className="fs-14 mb-2">
												•{' '}
												{employeeData?.qualification
													? employeeData?.qualification
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
											<h6 className="fs-14 mb-2">
												{' '}
												•{' '}
												{employeeData?.language_spoken
													? employeeData?.language_spoken
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
												• PF(S) Number:{' '}
												<span className="text-muted">
													{employeeData?.pf_num ? employeeData.pf_num : 'N/A'}
												</span>
											</h6>

											<h6 className="fs-14 mb-2 text-black">
												• Date of Employment:{' '}
												<span className="text-muted">
													{employeeData?.date_of_appointment
														? formatDateWord(employeeData.date_of_appointment)
														: 'N/A'}
												</span>
											</h6>
											<h6 className="fs-14 mb-2 text-black">
												• Employment Rank:{' '}
												<span className="text-muted">
													{employeeData?.grade_on_app
														? employeeData.grade_on_app
														: 'N/A'}{' '}
												</span>
											</h6>

											<h6 className="fs-14 mb-2 text-black">
												• Cadre:{' '}
												<span className="text-muted">
													{employeeData?.cadre?.name || 'N/A'}
												</span>
											</h6>

											<h6 className="fs-14 mb-2 text-black">
												• Current Rank:
												<span className="text-muted">
													{employeeData?.rank
														? ` GL.${employeeData.rank.level} (${employeeData.rank.name})`
														: 'N/A'}
												</span>
											</h6>
											<h6 className="fs-14 mb-2 text-black">
												• Date of Retirement:{' '}
												<span className="text-muted">
													{employeeData?.date_of_retirement
														? formatDateWord(employeeData.date_of_retirement)
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
											<h1 className="fs-1 mb-0">STAFF PROFILE</h1>
										</span>
									</div>

									<div className="d-flex align-items-center">
										<div className="mb-4 pb-2 w-100">
											<h5 className="card-title text-decoration-underline mb-3 setRight">
												<a href={`/promotions/${employeeData?.id}`}>
													CAREER PROGRESSION
												</a>
											</h5>
											{employeeData?.promotions &&
											employeeData.promotions.length > 0 ? (
												employeeData.promotions.map((item, i) => (
													<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
														<div className="flex-grow-1">
															<h6 className="fs-14 mb-1 text-uppercase">
																• GL.
																{item.current_rank_level
																	? item.current_rank_level
																	: 'N/A'}{' '}
																- W.E.F{' '}
																{item.promotion_date
																	? formatDateWord(item.promotion_date)
																	: 'N/A'}{' '}
																-
																{item.promotion_cadre
																	? item.promotion_cadre
																	: 'N/A'}
															</h6>
														</div>
													</div>
												))
											) : (
												<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
													<div className="flex-grow-3">
														<h6 className="fs-14 mb-1">
															{' '}
															• GL.
															{employeeData?.rank
																? employeeData.rank.level
																: 'N/A'}{' '}
															- W.E.F{' '}
															{employeeData?.date_of_appointment
																? formatDateWord(
																		employeeData?.date_of_appointment
																	)
																: 'N/A'}
															-{' '}
															{employeeData?.cadre
																? formatCadre(employeeData.cadre.id)
																: 'N/A'}
														</h6>
													</div>
												</div>
											)}
											{employeeData?.stagnation === 3 ? (
												<h6 className="fs-14 mb-2">
													<span className="text-muted">
														<>
															Stagnated at Current Rank-{' '}
															{employeeData?.rank
																? ` GL.${employeeData.rank.level} (${employeeData.rank.name})`
																: 'N/A'}{' '}
														</>
													</span>
												</h6>
											) : (
												''
											)}
										</div>
									</div>

									<div className="d-flex align-items-right">
										<div className="mb-4 pb-2 w-100">
											<h5 className="card-title text-decoration-underline mb-3 setRight">
												<a href={`/deployments/${employeeData?.id}`}>
													DEPLOYMENTS
												</a>
											</h5>

											{employeeData?.deployments &&
											employeeData.deployments.length > 0 ? (
												employeeData.deployments.map((item, i) => (
													<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
														<div className="flex-grow-1">
															<h6 className="fs-14 mb-1">
																•{' '}
																{item.type === 2
																	? `${item.directorate?.description} (${item.directorate?.name})`
																	: item.deployed_to}{' '}
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
														<h6 className="fs-14 mb-1"> • N/A</h6>
													</div>
												</div>
											)}
										</div>
									</div>

									<div className="d-flex align-items-center">
										<div className="mb-4 pb-2 w-100">
											<h5 className="card-title text-decoration-underline mb-3 setRight">
												<a href={`/trainings/${employeeData?.id}`}>
													TRAININGS & SKILLS
												</a>
											</h5>

											{employeeData?.trainings &&
											employeeData.trainings.length > 0 ? (
												employeeData.trainings.map((item, i) => (
													<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
														<div className="flex-grow-1">
															<h6 className="fs-14 mb-1">
																•{' '}
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
														<h6 className="fs-14 mb-1">• N/A</h6>
													</div>
												</div>
											)}
										</div>
									</div>

									<div className="d-flex align-items-center">
										<div className="mb-4 pb-2 w-100">
											<h5 className="card-title text-decoration-underline mb-3 setRight">
												<a href={`/employee-posting/${employeeData?.id}`}>
													POSTING HISTORY
												</a>
											</h5>

											{employeeData?.postings &&
											employeeData.postings.length > 0 ? (
												employeeData.postings.map((item, i) => (
													<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
														<div className="flex-grow-1">
															<h6 className="fs-14 mb-1">
																{' '}
																•{' '}
																{item.designation_at_post
																	? item.designation_at_post
																	: 'N/A'}{' '}
																{item.station.name ? item.station.name : 'N/A'}{' '}
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
														<h6 className="fs-14 mb-1">• N/A</h6>
													</div>
												</div>
											)}
										</div>
									</div>

									<div className="d-flex align-items-center">
										<div className="mb-4 pb-2 w-100">
											<h5 className="card-title text-decoration-underline mb-3 setRight">
												<a href={`/awards/${employeeData?.id}`}>
													AWARDS & ACHIEVEMENTS
												</a>
											</h5>

											{employeeData?.awards &&
											employeeData.awards.length > 0 ? (
												employeeData.awards.map((item, i) => (
													<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
														<div className="flex-grow-1">
															<h6 className="fs-14 mb-1 ">
																• {item.award.name ? item.award.name : 'N/A'}- (
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
														<h6 className="fs-14 mb-1">• N/A</h6>
													</div>
												</div>
											)}
										</div>
									</div>

									<div className="d-flex align-items-center">
										<div className="mb-4 pb-2 w-100">
											<h5 className="card-title text-decoration-underline mb-3 setRight">
												<a href={`/sanctions/${employeeData?.id}`}>
													DISCIPLINARY CASES
												</a>
											</h5>

											{employeeData?.sanctions &&
											employeeData.sanctions.length > 0 ? (
												employeeData.sanctions.map((item, i) => (
													<div className="d-flex flex-column flex-sm-row mb-4 mb-sm-0">
														<div className="flex-grow-1">
															<h6 className="fs-14 mb-1 ">
																•{' '}
																{item.sanction.name
																	? item.sanction.name
																	: 'N/A'}
																- (
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
														<h6 className="fs-14 mb-1">• N/A</h6>
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
	);
};

export default PoiPrint;
