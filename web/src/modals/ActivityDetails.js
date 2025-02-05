import React, { useEffect } from 'react';
import ModalWrapper from '../container/ModalWrapper';

const ActivityDetails = ({ closeModal, activity }) => {
	const formatDate = dateString => {
		const date = new Date(dateString);
		const day = date.getDate();
		const suffix = day => {
			if (day > 3 && day < 21) return 'th';
			switch (day % 10) {
				case 1:
					return 'st';
				case 2:
					return 'nd';
				case 3:
					return 'rd';
				default:
					return 'th';
			}
		};

		const month = date.toLocaleString('en-US', { month: 'long' });
		const year = date.getFullYear();

		return `${day}${suffix(day)} ${month}, ${year}`;
	};
	return (
		<ModalWrapper
			title="Activity Details"
			width={'modal-xl'}
			closeModal={closeModal}>
			<div className="modal-body">
				<div className="row g-3">
					<div className="table-responsive">
						{activity?.title && (
							<div className="row">
								<div className="col-12">
									<div className="card">
										<div
											className={
												activity.type_id === 1
													? 'bg-success text-dark'
													: activity.type_id === 2
														? ' bg-info text-dark'
														: activity.type_id === 3
															? 'bg-danger text-light'
															: activity.type_id === 4
																? 'bg-warning text-light'
																: activity.type_id === 5
																	? 'bg-secondary text-light'
																	: 'bg-dark text-light'
											}>
											<div
												className="card-body"
												style={{
													fontSize: '17px',
												}}>
												<strong>Title:</strong>
												{activity?.title}
											</div>
										</div>
									</div>
								</div>
							</div>
						)}
						{activity?.activity_date && (
							<div className="row">
								<div className="col-4">
									<div className="card">
										<div
											className="card-body"
											style={{
												background: '#ebf4f7',
												fontSize: '16px',
												color: '#000',
											}}>
											<strong>Activity Date: </strong>
											{activity?.activity_date &&
												formatDate(activity.activity_date)}
										</div>
									</div>
								</div>
								<div className="col-4">
									<div className="card">
										<div
											className="card-body"
											style={{
												background: '#ebf4f7',
												fontSize: '16px',
												color: '#000',
											}}>
											<strong>Created by: </strong>
											{activity?.created_by_name && activity.created_by_name}
										</div>
									</div>
								</div>
								<div className="col-4">
									<div className="card">
										<div
											className="card-body"
											style={{
												background: '#ebf4f7',
												fontSize: '16px',
												color: '#000',
											}}>
											<strong>Media Files: </strong>
											{activity.media_files.length > 0 ? 'Yes' : 'No'}
										</div>
									</div>
								</div>
							</div>
						)}

						<div className="row">
							{activity?.location && (
								<div className="col-md-4">
									<div className="card">
										<div
											className="card-body"
											style={{
												background: '#ebf4f7',
												fontSize: '16px',
												color: '#000',
											}}>
											<strong>Location: </strong> {activity?.location}
										</div>
									</div>
								</div>
							)}
							{activity?.location_from && (
								<div className="col-md-4">
									<div className="card">
										<div
											className="card-body"
											style={{
												background: '#ebf4f7',
												fontSize: '16px',
												color: '#000',
											}}>
											<strong>Location From: </strong> {activity?.location_from}
										</div>
									</div>
								</div>
							)}
							{activity?.location_to && (
								<div className="col-md-4">
									<div className="card">
										<div
											className="card-body"
											style={{
												background: '#ebf4f7',
												fontSize: '16px',
												color: '#000',
											}}>
											<strong>Location To: </strong> {activity?.location_to}
										</div>
									</div>
								</div>
							)}
							{activity?.crime && (
								<div className="col-md-4">
									<div className="card">
										<div
											className="card-body"
											style={{
												background: '#ebf4f7',
												fontSize: '16px',
												color: '#000',
											}}>
											<strong>Crime: </strong> {activity?.crime.name}
										</div>
									</div>
								</div>
							)}
							{activity?.nature_of_attack && (
								<div className="col-md-4">
									<div className="card">
										<div
											className="card-body"
											style={{
												background: '#ebf4f7',
												fontSize: '16px',
												color: '#000',
											}}>
											<strong>Nature of Attack: </strong>{' '}
											{activity?.nature_of_attack}
										</div>
									</div>
								</div>
							)}
							{activity?.casualties_recorded && (
								<div className="col-md-4">
									<div className="card">
										<div
											className="card-body"
											style={{
												background: '#ebf4f7',
												fontSize: '16px',
												color: '#000',
											}}>
											<strong>Casualties Recorded: </strong>{' '}
											{activity?.casualties_recorded}
										</div>
									</div>
								</div>
							)}
							{activity?.action_taken && (
								<div className="col-md-4">
									<div className="card">
										<div
											className="card-body"
											style={{
												background: '#ebf4f7',
												fontSize: '16px',
												color: '#000',
											}}>
											<strong>Action Taken: </strong> {activity?.action_taken}
										</div>
									</div>
								</div>
							)}
							{activity?.facilitator && (
								<div className="col-md-4">
									<div className="card">
										<div
											className="card-body"
											style={{
												background: '#ebf4f7',
												fontSize: '16px',
												color: '#000',
											}}>
											<strong>Facilitator: </strong> {activity?.facilitator}
										</div>
									</div>
								</div>
							)}
						</div>

						{activity?.comment && (
							<div className="col-">
								<div className="card">
									<div
										className="card-header"
										style={{
											background: '#dcf1fa',
											fontSize: '16px',
											color: '#000',
										}}>
										<strong>Assessment: </strong>
									</div>
									<div
										className="card-body"
										style={{
											background: '#ebf4f7',
											fontSize: '16px',
											color: '#000',
										}}>
										{activity?.comment}
									</div>
								</div>
							</div>
						)}
					</div>
					{activity?.items && activity?.items.length > 0 && (
						<>
							<div className="row">
								<h4>
									<u>Items Procured</u>
								</h4>
								{activity.items.map((item, index) => (
									<div key={index} className="col-md-2">
										<div className="card">
											<div
												className="card-header"
												style={{
													background: '#dcf1fa',
													fontSize: '16px',
													color: '#000',
												}}>
												<strong>{item?.item_name}</strong>
											</div>
											<div
												className="card-body"
												style={{
													background: '#ebf4f7',
													fontSize: '16px',
													color: '#000',
												}}>
												{item?.qty || 'N/A'}
											</div>
										</div>
									</div>
								))}
							</div>
						</>
					)}

					{activity?.media_files?.length > 0 ? (
						<>
							<div className="row">
								<h4>
									<u>Media Files</u>
								</h4>
								{activity.media_files.map((file, index) => (
									<div key={index} className="col-2">
										<div className="card">
											<a
												href={file.media_url}
												className="image-popup d-block"
												target="_blank"
												rel="noopener noreferrer">
												<img
													src={file.media_url}
													alt="media url"
													className="img-fluid d-block rounded"
													style={{
														height: '200px',
														width: '100%',
														objectFit: 'cover',
													}}
												/>
											</a>
											<div className="card-body text-center">
												<p className="text-truncate mb-0">
													<strong>{file.media_caption || 'No caption'}</strong>
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</>
					) : (
						<div className="row">
							<div className="col-md-4">
								<p className="form-control-plaintext"></p>
							</div>
						</div>
					)}
				</div>
			</div>
		</ModalWrapper>
	);
};

export default ActivityDetails;
