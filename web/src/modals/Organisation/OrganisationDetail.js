// OrganizationDetailsModal.js
import React from 'react';
import { Modal } from 'antd';

const OrganisationDetail = ({ visible, onClose, organization }) => {
	return (
		<Modal
			visible={visible}
			title="Organization Details"
			onCancel={onClose}
			footer={null}
		>
			<div className="organization-details">
				<p>
					<strong>Name:</strong> {organization?.name || 'N/A'}
				</p>
				<p>
					<strong>Address:</strong> {organization?.website || 'N/A'}
				</p>
			</div>
		</Modal>
	);
};

export default OrganisationDetail;
