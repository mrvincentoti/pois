import React from 'react';

const ModalHeader = ({ title, closeModal }) => {
	return (
		<div className="modal-header p-3 bg-info-subtle">
			<h5 className="modal-title">{title}</h5>
			<button
				type="button"
				className="btn-close"
				aria-label="Close"
				id="close-modal"
				onClick={() => closeModal()}
			></button>
		</div>
	);
};

export default ModalHeader;
