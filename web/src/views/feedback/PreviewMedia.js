import React, { useEffect, useState } from 'react';
import ModalWrapper from '../../container/ModalWrapper';
import preview from '../../assets/images/no-preview-available.png';
import { FILE_CDN } from '../../services/constants';

const renderMediaPreview = file => {
	if (file) {
		console.log(file);
		return (
			<img
				src={`${FILE_CDN}${file}`}
				alt="Preview"
				style={{ width: '100%', height: '100%' }}
			/>
		);
	}

	return (
		<img
			src={preview}
			alt="Preview"
			style={{ maxWidth: '100%', maxHeight: '100%' }}
		/>
	);
};
    
const PreviewMedia = ({ id, closeModalMedia, update, media, selectedMediaFile }) => {
    return (
			<ModalWrapper
				title='Attachment'
				closeModal={closeModalMedia}>
				<div>{renderMediaPreview(selectedMediaFile)}</div>
			</ModalWrapper>
		);
};

export default PreviewMedia;
