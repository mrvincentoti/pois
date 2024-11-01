import React from 'react';
import ModalWrapper from '../container/ModalWrapper';

const ItemsCartedAwayDetails = ({ closeModal, activity }) => {
	return (
		<ModalWrapper title="Procurement Details" closeModal={closeModal}>
			<div className="modal-body">
				<div className="row g-3">
					<div className="col-lg-12">
						<p>
							<span className="badge bg-success-subtle text-success fs-50 align-middle ms-1">
								Title :
							</span>{' '}
							{activity?.title || 'N/A'}
						</p>
					</div>

					<div className="col-lg-12" style={{ marginTop: '15px' }}>
						<p>
							<span className="badge bg-success-subtle text-success fs-50 align-middle ms-1">
								Location :
							</span>{' '}
							{activity?.location || 'N/A'}
						</p>
					</div>

					<div className="col-lg-12" style={{ marginTop: '15px' }}>
						<p>
							<span className="badge bg-success-subtle text-success fs-50 align-middle ms-1">
								Assessment:
							</span>{' '}
							{activity?.comment || 'N/A'}
						</p>
					</div>

					<div className="col-lg-12" style={{ marginTop: '15px' }}>
						<p>
							<span className="badge bg-success-subtle text-success fs-50 align-middle ms-1">
								Activity Date:
							</span>{' '}
							{activity?.activity_date
								? new Date(activity.activity_date).toLocaleDateString()
								: 'N/A'}
						</p>
					</div>

					<div className="col-lg-12" style={{ marginTop: '20px' }}>
						<p>
							<span className="badge bg-success-subtle text-success fs-50 align-middle ms-1">
								Items:
							</span>{' '}
							{activity?.items?.length > 0 ? (
								activity.items.map((item, index) => (
									<div
										key={index}
										style={{ marginBottom: '10px', marginLeft: '20px' }}
									>
										<div>
											<strong>Item:</strong> {item.item || 'N/A'}
										</div>
										<div>
											<strong>Quantity:</strong> {item.qty || 'N/A'}
										</div>
									</div>
								))
							) : (
								<p className="form-control-plaintext">No items available</p>
							)}
						</p>
					</div>

					<div className="col-lg-12" style={{ marginTop: '20px' }}>
						<p>
							<span className="badge bg-success-subtle text-success fs-50 align-middle ms-1">
								Media Files:
							</span>{' '}
							{activity?.media_files?.length > 0 ? (
								activity.media_files.map((file, index) => (
									<div
										key={index}
										style={{ marginBottom: '10px', marginLeft: '20px' }}
									>
										<div>
											<strong>File:</strong>
											<div>
												<a
													href={file.media_url}
													target="_blank"
													rel="noopener noreferrer"
												>
													{file.media_url.split('/').pop()}
												</a>
											</div>
										</div>
										<div
											style={{
												display: 'flex',
												alignItems: 'center',
												marginBottom: '5px',
											}}
										>
											<strong>Caption:</strong>
											<p
												className="form-control-plaintext"
												style={{ marginLeft: '10px', marginBottom: '0' }}
											>
												{file.media_caption || 'No Caption'}
											</p>
										</div>
									</div>
								))
							) : (
								<p className="form-control-plaintext">
									No media files available
								</p>
							)}
						</p>
					</div>
				</div>
			</div>
		</ModalWrapper>
	);
};

export default ItemsCartedAwayDetails;
