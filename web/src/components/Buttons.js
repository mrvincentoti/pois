import Tooltip from 'antd/es/tooltip';
import { Link } from 'react-router-dom';

export const ViewLink = ({ to }) => {
	return (
		<Link className="link-primary fs-18" role="button" to={to}>
			<Tooltip title="View">
				<i className="ri-eye-line" />
			</Tooltip>
		</Link>
	);
};

export const ViewPostingHistoryLink = ({ to }) => {
	return (
		<Link className="link-primary fs-18" role="button" to={to}>
			<Tooltip title="view">View History</Tooltip>
		</Link>
	);
};

export const ViewListLink = ({ to }) => {
	return (
		<Link className="link-primary fs-18" role="button" to={to}>
			<Tooltip title="view">View History</Tooltip>
		</Link>
	);
};

export const EditButton = ({ onClick }) => {
	return (
		<a className="link-success fs-18" role="button" onClick={onClick}>
			<Tooltip title="edit">
				<i className="ri-edit-2-line" />
			</Tooltip>
		</a>
	);
};

export const EditLink = ({ to }) => {
	return (
		<Link className="link-secondary fs-18" role="button" to={to}>
			<Tooltip title="Edit">
				<i className="ri-edit-2-line" />
			</Tooltip>
		</Link>
	);
};

export const DeleteButton = ({ onClick, text }) => {
	return (
		<a className="link-danger fs-18" role="button" onClick={onClick}>
			<Tooltip title={text ? text : 'Delete'}>
				<i className="ri-delete-bin-line" />
			</Tooltip>
		</a>
	);
};

export const ViewButton = ({ onClick, text }) => {
	return (
		<a className="link-primary fs-18" role="button" onClick={onClick}>
			<Tooltip title={text ? text : 'View'}>View Log</Tooltip>
		</a>
	);
};

export const ViewButtonPosting = ({ onClick, text }) => {
	return (
		<a className="link-primary fs-18" role="button" onClick={onClick}>
			<Tooltip title={text ? text : 'View'}> Detail</Tooltip>
		</a>
	);
};

export const ViewButtonNok = ({ onClick }) => {
	return (
		<a className="link-success fs-18" role="button" onClick={onClick}>
			<Tooltip title="view">
				<i className="ri-eye-line" />
			</Tooltip>
		</a>
	);
};

export const RestoreButton = ({ onClick }) => {
	return (
		<a className="text-btn text-primary" role="button" onClick={onClick}>
			<Tooltip title="Restore">
				<i className="ri-arrow-go-back-fill fs-16" />
			</Tooltip>
		</a>
	);
};

export const ManagePoi = ({ to }) => {
	return (
		<Link className="link-danger fs-18" role="button" to={to}>
			<Tooltip title="Manage">
				<i className="ri-briefcase-5-fill" />
			</Tooltip>
		</Link>
	);
};
