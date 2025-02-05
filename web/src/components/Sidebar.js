import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SimpleBar from 'simplebar-react';

import logoSm from '../assets/images/logo-sm.png';
import logoSmNew from '../assets/images/logo/manforticon.svg';
import logoSmLarge from '../assets/images/logo/Manfort@4x.png';
// import logoLight from '../assets/images/logo-light.png';
import VerticalSidebar from './VerticalSidebar';

const Sidebar = ({ layoutType }) => {
	useEffect(() => {
		var verticalOverlay = document.getElementsByClassName('vertical-overlay');
		if (verticalOverlay) {
			verticalOverlay[0].addEventListener('click', function () {
				document.body.classList.remove('vertical-sidebar-enable');
			});
		}
	});

	const addEventListenerOnSmHoverMenu = () => {
		// add listener Sidebar Hover icon on change layout from setting
		if (
			document.documentElement.getAttribute('data-sidebar-size') === 'sm-hover'
		) {
			document.documentElement.setAttribute(
				'data-sidebar-size',
				'sm-hover-active'
			);
		} else if (
			document.documentElement.getAttribute('data-sidebar-size') ===
			'sm-hover-active'
		) {
			document.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
		} else {
			document.documentElement.setAttribute('data-sidebar-size', 'sm-hover');
		}
	};

	return (
		<>
			<div className="app-menu navbar-menu">
				<div className="navbar-brand-box">
					<Link to="/" className="logo logo-dark">
						<span className="logo-sm">
							<img src={logoSmNew} alt="" height="40" />
						</span>
						<span className="logo-lg">
							<img src={logoSmLarge} alt="" height="50" />
						</span>
					</Link>

					<Link to="/" className="logo logo-light">
						<span className="logo-sm">
							<img src={logoSm} alt="" height="40" />
						</span>
						<span className="logo-lg">
							<img src={logoSm} alt="" height="35" />
						</span>
					</Link>
					<button
						onClick={addEventListenerOnSmHoverMenu}
						type="button"
						className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover"
						id="vertical-hover"
					>
						<i className="ri-record-circle-line"></i>
					</button>
				</div>
				{layoutType === 'horizontal' ? (
					<div id="scrollbar">
						<div className="container-fluid">
							<div id="two-column-menu"></div>
							<ul className="navbar-nav" id="navbar-nav">
								{/* <HorizontalLayout /> */}
							</ul>
						</div>
					</div>
				) : layoutType === 'twocolumn' ? (
					<React.Fragment>
						{/* <TwoColumnLayout /> */}
						<div className="sidebar-background"></div>
					</React.Fragment>
				) : (
					<React.Fragment>
						<SimpleBar id="scrollbar" className="h-100">
							<div className="container-fluid">
								<div id="two-column-menu"></div>
								<ul className="navbar-nav" id="navbar-nav">
									<VerticalSidebar layoutType={layoutType} />
								</ul>
							</div>
						</SimpleBar>
						<div className="sidebar-background"></div>
					</React.Fragment>
				)}
			</div>
			<div className="vertical-overlay"></div>
		</>
	);
};

export default Sidebar;
