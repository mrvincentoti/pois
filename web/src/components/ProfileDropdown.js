/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState } from 'react';
import {
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';

import avatar1 from '../assets/images/user.png';
import { useAuth } from '../hooks/auth';
import { notifyWithIcon, request } from '../services/utilities';
import { LOGOUT_API } from '../services/api';

const ProfileDropdown = () => {
	const [isProfileDropdown, setIsProfileDropdown] = useState(false);

	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const toggleProfileDropdown = () => {
		setIsProfileDropdown(!isProfileDropdown);
	};

	const doLogout = async () => {
		try {
			const config = { method: 'POST', body: {} };
			await request(LOGOUT_API, config);
			logout(() => navigate('/logout', { replace: true }));
		} catch (e) {
			notifyWithIcon('error', e.message || 'logout failed');
		}
	};

	return (
		<React.Fragment>
			<Dropdown
				isOpen={isProfileDropdown}
				toggle={toggleProfileDropdown}
				className="ms-sm-3 header-item topbar-user"
			>
				<DropdownToggle tag="button" type="button" className="btn">
					<span className="d-flex align-items-center">
						<img
							className="rounded-circle header-profile-user"
							src={avatar1}
							alt="Header Avatar"
						/>
						<span className="text-start ms-xl-2">
							<span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
								{user?.username}
							</span>
							<span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">
								{user?.role?.name}
							</span>
						</span>
					</span>
				</DropdownToggle>
				<DropdownMenu className="dropdown-menu-end">
					<DropdownItem className="p-0">
						<a
							className="dropdown-item cursor-pointer"
							onClick={() => doLogout()}
						>
							<i className="mdi mdi-logout text-muted fs-16 align-middle me-1" />
							<span className="align-middle">Logout</span>
						</a>
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</React.Fragment>
	);
};

export default ProfileDropdown;
