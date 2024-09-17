import React, { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Collapse } from 'reactstrap';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import navdata from './MenuData';
import withRouter from '../container/withRouter';

const VerticalSidebar = props => {
	const navData = navdata().props.children;

	const selectLayoutState = state => state.layout;

	const selectLayoutProperties = createSelector(selectLayoutState, layout => ({
		leftSidebarSizeType: layout.leftSidebarSizeType,
		sidebarVisibilitytype: layout.sidebarVisibilitytype,
		layoutType: layout.layoutType,
	}));

	const { leftSidebarSizeType, sidebarVisibilitytype, layoutType } =
		useSelector(selectLayoutProperties);

	const resizeSidebarMenu = useCallback(() => {
		const windowSize = document.documentElement.clientWidth;
		const hamburgerIcon = document.querySelector('.hamburger-icon');
		if (windowSize >= 1025) {
			if (document.documentElement.getAttribute('data-layout') === 'vertical') {
				document.documentElement.setAttribute(
					'data-sidebar-size',
					leftSidebarSizeType
				);
			}
			if (document.documentElement.getAttribute('data-layout') === 'semibox') {
				document.documentElement.setAttribute(
					'data-sidebar-size',
					leftSidebarSizeType
				);
			}
			if (
				(sidebarVisibilitytype === 'show' ||
					layoutType === 'vertical' ||
					layoutType === 'twocolumn') &&
				document.querySelector('.hamburger-icon')
			) {
				if (hamburgerIcon !== null) {
					hamburgerIcon.classList.remove('open');
				}
			} else {
				if (hamburgerIcon !== null) {
					hamburgerIcon.classList.add('open');
				}
			}
		} else if (windowSize < 1025 && windowSize > 767) {
			document.body.classList.remove('twocolumn-panel');
			if (document.documentElement.getAttribute('data-layout') === 'vertical') {
				document.documentElement.setAttribute('data-sidebar-size', 'sm');
			}
			if (document.documentElement.getAttribute('data-layout') === 'semibox') {
				document.documentElement.setAttribute('data-sidebar-size', 'sm');
			}
			if (document.querySelector('.hamburger-icon')) {
				document.querySelector('.hamburger-icon').classList.add('open');
			}
		} else if (windowSize <= 767) {
			document.body.classList.remove('vertical-sidebar-enable');
			if (
				document.documentElement.getAttribute('data-layout') !== 'horizontal'
			) {
				document.documentElement.setAttribute('data-sidebar-size', 'lg');
			}
			if (document.querySelector('.hamburger-icon')) {
				document.querySelector('.hamburger-icon') &&
					document.querySelector('.hamburger-icon').classList.add('open');
			}
		}
	}, [layoutType, leftSidebarSizeType, sidebarVisibilitytype]);

	useEffect(() => {
		window.addEventListener('resize', resizeSidebarMenu, true);
	}, [resizeSidebarMenu]);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		const initMenu = () => {
			const pathName = `${process.env.PUBLIC_URL}${props.router.location.pathname}`;
			const ul = document.getElementById('navbar-nav');
			const items = ul.getElementsByTagName('a');
			let itemsArray = [...items]; // converts NodeList to Array
			removeActivation(itemsArray);
			let matchingMenuItem = itemsArray.find(x => {
				return x.pathname === pathName;
			});
			if (matchingMenuItem) {
				activateParentDropdown(matchingMenuItem);
			}
		};
		if (props.layoutType === 'vertical') {
			initMenu();
		}
	}, [props.router.location.pathname, props.layoutType]);

	function activateParentDropdown(item) {
		item.classList.add('active');
		let parentCollapseDiv = item.closest('.collapse.menu-dropdown');

		if (parentCollapseDiv) {
			// to set aria expand true remaining
			parentCollapseDiv.classList.add('show');
			parentCollapseDiv.parentElement.children[0].classList.add('active');
			parentCollapseDiv.parentElement.children[0].setAttribute(
				'aria-expanded',
				'true'
			);
			if (parentCollapseDiv.parentElement.closest('.collapse.menu-dropdown')) {
				parentCollapseDiv.parentElement
					.closest('.collapse')
					.classList.add('show');
				if (
					parentCollapseDiv.parentElement.closest('.collapse')
						.previousElementSibling
				) {
					parentCollapseDiv.parentElement
						.closest('.collapse')
						.previousElementSibling.classList.add('active');
				}
				if (
					parentCollapseDiv.parentElement
						.closest('.collapse')
						.previousElementSibling.closest('.collapse')
				) {
					parentCollapseDiv.parentElement
						.closest('.collapse')
						.previousElementSibling.closest('.collapse')
						.classList.add('show');
					parentCollapseDiv.parentElement
						.closest('.collapse')
						.previousElementSibling.closest('.collapse')
						.previousElementSibling.classList.add('active');
				}
			}
			return false;
		}
		return false;
	}

	const removeActivation = items => {
		let actiItems = items.filter(x => x.classList.contains('active'));

		actiItems.forEach(item => {
			if (item.classList.contains('menu-link')) {
				if (!item.classList.contains('active')) {
					item.setAttribute('aria-expanded', false);
				}
				if (item.nextElementSibling) {
					item.nextElementSibling.classList.remove('show');
				}
			}
			if (item.classList.contains('nav-link')) {
				if (item.nextElementSibling) {
					item.nextElementSibling.classList.remove('show');
				}
				item.setAttribute('aria-expanded', false);
			}
			item.classList.remove('active');
		});
	};

	return (
		<React.Fragment>
			{/* menu Items */}
			{(navData || [])
				.filter(n => n.permission)
				.map((item, key) => {
					return (
						<React.Fragment key={key}>
							{/* Main Header */}
							{item['isHeader'] ? (
								<li className="menu-title">
									<span data-key="t-menu">{item.label} </span>
								</li>
							) : item.subItems ? (
								<li className="nav-item">
									<Link
										onClick={item.click}
										className={`nav-link menu-link ${
											item.stateVariables ? 'collapsed' : ''
										}`}
										to={item.link ? item.link : '/#'}
										data-bs-toggle="collapse"
										aria-expanded={item.stateVariables}
									>
										<i className={item.icon}></i>
										<span data-key="t-apps">{item.label}</span>
										{item.badgeName ? (
											<span
												className={'badge badge-pill bg-' + item.badgeColor}
												data-key="t-new"
											>
												{item.badgeName}
											</span>
										) : null}
									</Link>
									<Collapse
										className="menu-dropdown"
										isOpen={item.stateVariables}
										id="sidebarHr"
									>
										<ul className="nav nav-sm flex-column test">
											{/* subItms  */}
											{item.subItems &&
												(item.subItems || [])
													.filter(n => n.permission)
													.map((subItem, key) => (
														<React.Fragment key={key}>
															{!subItem.isChildItem ? (
																<li className="nav-item">
																	<Link
																		to={subItem.link ? subItem.link : '/#'}
																		className="nav-link"
																	>
																		{subItem.label}
																		{subItem.badgeName ? (
																			<span
																				className={
																					'badge badge-pill bg-' +
																					subItem.badgeColor
																				}
																				data-key="t-new"
																			>
																				{subItem.badgeName}
																			</span>
																		) : null}
																	</Link>
																</li>
															) : (
																<li className="nav-item">
																	<Link
																		onClick={subItem.click}
																		className="nav-link"
																		to="/#"
																		data-bs-toggle="collapse"
																	>
																		{subItem.label}
																		{subItem.badgeName ? (
																			<span
																				className={
																					'badge badge-pill bg-' +
																					subItem.badgeColor
																				}
																				data-key="t-new"
																			>
																				{subItem.badgeName}
																			</span>
																		) : null}
																	</Link>
																	<Collapse
																		className="menu-dropdown"
																		isOpen={subItem.stateVariables}
																		id="sidebarEcommerce"
																	>
																		<ul className="nav nav-sm flex-column">
																			{/* child subItms  */}
																			{subItem.childItems &&
																				(subItem.childItems || [])
																					.filter(n => n.permission)
																					.map((childItem, key) => (
																						<React.Fragment key={key}>
																							{!childItem.childItems ? (
																								<li className="nav-item">
																									<Link
																										to={
																											childItem.link
																												? childItem.link
																												: '/#'
																										}
																										className="nav-link"
																									>
																										{childItem.label}
																									</Link>
																								</li>
																							) : (
																								<li className="nav-item">
																									<Link
																										to="/#"
																										className="nav-link"
																										onClick={childItem.click}
																										data-bs-toggle="collapse"
																									>
																										{props.t(childItem.label)}
																									</Link>
																									<Collapse
																										className="menu-dropdown"
																										isOpen={
																											childItem.stateVariables
																										}
																										id="sidebaremailTemplates"
																									>
																										<ul className="nav nav-sm flex-column">
																											{childItem.childItems.map(
																												(subChildItem, key) => (
																													<li
																														className="nav-item"
																														key={key}
																													>
																														<Link
																															to={
																																subChildItem.link
																															}
																															className="nav-link"
																															data-key="t-basic-action"
																														>
																															{
																																subChildItem.label
																															}
																														</Link>
																													</li>
																												)
																											)}
																										</ul>
																									</Collapse>
																								</li>
																							)}
																						</React.Fragment>
																					))}
																		</ul>
																	</Collapse>
																</li>
															)}
														</React.Fragment>
													))}
										</ul>
									</Collapse>
								</li>
							) : (
								<li className="nav-item">
									<Link
										className="nav-link menu-link"
										to={item.link ? item.link : '/#'}
									>
										<i className={item.icon}></i> <span>{item.label}</span>
										{item.badgeName ? (
											<span
												className={'badge badge-pill bg-' + item.badgeColor}
												data-key="t-new"
											>
												{item.badgeName}
											</span>
										) : null}
									</Link>
								</li>
							)}
						</React.Fragment>
					);
				})}
		</React.Fragment>
	);
};

export default withRouter(VerticalSidebar);
