import React from 'react';
import ModalHeader from '../components/ModalHeader';

const ModalWrapper = ({ title, width, closeModal, children }) => {
	return (
		<div className="modal fade zoomIn show" role="dialog">
			<div className={`modal-dialog ${width || 'modal-md'}`}>
				<div className="modal-content">
					<ModalHeader title={title} closeModal={closeModal} />
					{children}
				</div>
			</div>
		</div>
	);
};

export default ModalWrapper;
