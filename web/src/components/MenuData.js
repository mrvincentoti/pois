import React, { useEffect, useState } from 'react';
import { checkPermission } from '../services/utilities';
import { useSelector } from 'react-redux';

const Navdata = () => {
	const [isEntity, setIsEntity] = useState(false);
	const [isAccounts, setIsAccounts] = useState(false);
	const [isSetup, setIsSetup] = useState(false);
	const [isPromotions, setIsPromotions] = useState(false);

	const [isCurrentState, setIsCurrentState] = useState('Dashboard');
	const permissions = useSelector(state => state.user.permissions);

	function updateIconSidebar(e) {
		if (e && e.target && e.target.getAttribute('subitems')) {
			const ul = document.getElementById('two-column-menu');
			const iconItems = ul.querySelectorAll('.nav-icon.active');
			let activeIconItems = [...iconItems];
			activeIconItems.forEach(item => {
				item.classList.remove('active');
				const id = item.getAttribute('subitems');
				if (document.getElementById(id)) {
					document.getElementById(id).classList.remove('show');
				}
			});
		}
	}

	useEffect(() => {
		document.body.classList.remove('twocolumn-panel');
		if (isCurrentState === 'Dashboard' || isCurrentState === 'Audit Trail') {
			document.body.classList.add('twocolumn-panel');
		}
		if (isCurrentState !== 'Entity') {
			setIsEntity(false);
		}
		if (isCurrentState !== 'Entity') {
			setIsEntity(false);
		}
		if (isCurrentState !== 'Accounts') {
			setIsAccounts(false);
		}
		if (isCurrentState !== 'Setup') {
			setIsSetup(false);
		}
	}, [isCurrentState]);

	const menuItems = [
		{
			label: 'menu',
			isHeader: true,
			permission:
				checkPermission(permissions, 'can-see-dashboard-link') ||
				checkPermission(permissions, 'can-see-entity-link') ||
				checkPermission(permissions, 'can-see-audit-trail-link'),
		},
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: 'ri-home-3-line',
			link: '/',
			click: function (e) {
				e.preventDefault();
				setIsCurrentState('Dashboard');
				setIsEntity(false);
				setIsAccounts(false);
				setIsSetup(false);
			},
			permission: checkPermission(permissions, 'can-see-dashboard-link'),
		},
		// {
		// 	id: 'entity',
		// 	label: 'Entity',
		// 	link: '/#',
		// 	click: function (e) {
		// 		e.preventDefault();
		// 		updateIconSidebar(e);
		// 		setIsCurrentState('Entity');
		// 		setIsEntity(false);
		// 		setIsAccounts(false);
		// 		setIsSetup(false);
		// 	},
		// 	permission: checkPermission(permissions, 'can-see-entity-link'),
		// 	stateVariables: isEntity,
		// 	subItems: [

		// 	],
		// },
		{
			label: 'entities',
			isHeader: true,
			permission:
				checkPermission(permissions, 'can-see-poi-link') ||
				checkPermission(permissions, 'can-see-organisation-link') ||
				checkPermission(permissions, 'can-see-brieflink'),
		},
		{
			id: 'poi',
			label: 'POI',
			icon: 'ri-group-fill',
			link: '/pois/poi',
			click: function (e) {
				e.preventDefault();
				setIsCurrentState('POI');
				setIsEntity(false);
				setIsAccounts(false);
				setIsSetup(false);
			},
			permission: checkPermission(permissions, 'can-see-poi-link'),
		},
		{
			id: 'organisation',
			label: 'Organisation',
			icon: 'ri-organization-chart',
			link: '/entity/organisation',
			click: function (e) {
				e.preventDefault();
				setIsCurrentState('Organisation');
				setIsEntity(false);
				setIsAccounts(false);
				setIsSetup(false);
			},
			permission: checkPermission(permissions, 'can-see-organisation-link'),
		},
		{
			id: 'brief',
			label: 'Brief',
			icon: 'ri-file-shred-line',
			link: '/entity/brief',
			parentId: 'entity',
			permission: checkPermission(permissions, 'can-see-brief-list'),
		},
		{
			label: 'AUDIT',
			isHeader: true,
			permission: checkPermission(permissions, 'can-see-audit-trail-link'),
		},

		{
			id: 'audit',
			label: 'Audit Trail',
			icon: 'ri-history-line',
			link: '/audit-trail',
			click: function (e) {
				e.preventDefault();
				setIsCurrentState('Audit Trail');
				setIsEntity(false);
				setIsAccounts(false);
				setIsSetup(false);
			},
			permission: checkPermission(permissions, 'can-see-audit-trail-link'),
		},
		{
			label: 'settings',
			isHeader: true,
			permission:
				checkPermission(permissions, 'can-see-user-account-link') ||
				checkPermission(permissions, 'can-see-setup-link'),
		},
		{
			id: 'accounts',
			label: 'User Accounts',
			icon: 'ri-group-2-line',
			link: '/#',
			click: function (e) {
				e.preventDefault();
				updateIconSidebar(e);
				setIsCurrentState('Accounts');
				setIsEntity(false);
				setIsAccounts(!isAccounts);
				setIsSetup(false);
			},
			permission: checkPermission(permissions, 'can-see-user-account-link'),
			stateVariables: isAccounts,
			subItems: [
				{
					id: 'users',
					label: 'Users',
					link: '/accounts/users',
					parentId: 'accounts',
					permission: checkPermission(
						permissions,
						'can-see-account-users-list'
					),
				},
				{
					id: 'roles',
					label: 'Roles',
					link: '/accounts/roles',
					parentId: 'accounts',
					permission: checkPermission(
						permissions,
						'can-see-account-roles-list'
					),
				},
				{
					id: 'permissions',
					label: 'Permissions',
					link: '/accounts/permissions',
					parentId: 'accounts',
					permission: checkPermission(
						permissions,
						'can-see-account-permissions-list'
					),
				},
			],
		},

		{
			id: 'setup',
			label: 'Setup',
			icon: 'ri-settings-5-line',
			link: '/#',
			click: function (e) {
				e.preventDefault();
				updateIconSidebar(e);
				setIsCurrentState('Setup');
				setIsEntity(false);
				setIsAccounts(false);
				setIsSetup(!isSetup);
			},
			permission: checkPermission(permissions, 'can-see-setup-link'),
			stateVariables: isSetup,
			subItems: [
				{
					id: 'directorates',
					label: 'Directorates',
					link: '/setup/directorates',
					parentId: 'setup',
					permission: checkPermission(
						permissions,
						'can-see-setup-directorate-list'
					),
				},
				{
					id: 'departments',
					label: 'Departments',
					link: '/setup/departments',
					parentId: 'setup',
					permission: checkPermission(
						permissions,
						'can-see-setup-department-list'
					),
				},
				{
					id: 'cadre',
					label: 'Cadre',
					link: '/setup/cadre',
					parentId: 'setup',
					permission: checkPermission(permissions, 'can-see-setup-cadre-list'),
				},
				{
					id: 'units',
					label: 'Units',
					link: '/setup/units',
					parentId: 'setup',
					permission: checkPermission(permissions, 'can-see-setup-unit-list'),
				},
				{
					id: 'ranks',
					label: 'Ranks',
					link: '/setup/ranks',
					parentId: 'setup',
					permission: checkPermission(permissions, 'can-see-setup-rank-list'),
				},
				{
					id: 'designations',
					label: 'Designations',
					link: '/setup/designations',
					parentId: 'setup',
					permission: checkPermission(
						permissions,
						'can-see-setup-designation-list'
					),
				},
				{
					id: 'specialty',
					label: 'Specialty',
					link: '/setup/specialty',
					parentId: 'setup',
					permission: checkPermission(
						permissions,
						'can-see-setup-specialty-list'
					),
				},
				{
					id: 'awards',
					label: 'Awards',
					link: 'setup/awards',
					parentId: 'setup',
					permission: checkPermission(permissions, 'can-see-setup-award-list'),
				},
				{
					id: 'trainings',
					label: 'Trainings',
					icon: 'ri-projector-2-line',
					link: 'setup/trainings',
					permission: checkPermission(
						permissions,
						'can-see-setup-training-list'
					),
				},
				{
					id: 'conferences',
					label: 'Conferences',
					icon: 'ri-slideshow-3-line',
					link: 'setup/conferences',
					permission: checkPermission(
						permissions,
						'can-see-setup-conference-list'
					),
				},
				{
					id: 'sanctions',
					label: 'Sanctions',
					icon: 'ri-auction-line',
					link: 'setup/sanctions',
					permission: checkPermission(
						permissions,
						'can-see-setup-sanction-list'
					),
				},
			],
		},
		// {
		// 	label: 'User',
		// 	isHeader: true,
		// 	permission: checkPermission(permissions, 'can-see-dependents-link'),
		// },

		// {
		// 	id: 'trainings',
		// 	label: 'Trainings',
		// 	icon: 'ri-projector-2-line',
		// 	link: '/trainings',
		// 	click: function (e) {
		// 		e.preventDefault();
		// 		setIsCurrentState('Trainings');
		// 		setisEntity(false);
		// 		setIsAccounts(false);
		// 		setIsSetup(false);
		// 	},
		// 	permission: checkPermission(permissions, 'can-see-dependents-link'),
		// },
		// {
		// 	id: 'conferences',
		// 	label: 'Conferences',
		// 	icon: 'ri-slideshow-3-line',
		// 	link: '/conferences',
		// 	click: function (e) {
		// 		e.preventDefault();
		// 		setIsCurrentState('Conferences');
		// 		setisEntity(false);
		// 		setIsAccounts(false);
		// 		setIsSetup(false);
		// 	},
		// 	permission: checkPermission(permissions, 'can-see-dependents-link'),
		// },
	];
	return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;
