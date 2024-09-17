import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';

import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import {
	changeLayout,
	changeLayoutMode,
	changeLayoutPosition,
	changeLayoutWidth,
	changeLeftSidebarSizeType,
	changeLeftSidebarViewType,
	changeSidebarImageType,
	changeSidebarTheme,
	changeSidebarVisibility,
	changeTopbarTheme,
} from '../redux/slices/layout';
// import { useAuth } from '../hooks/auth';

const Layout = () => {
	const [headerClass, setHeaderClass] = useState('');

	const dispatch = useDispatch();
	// const { user } = useAuth();

	const hasSidebardPermission = true;

	const layoutType = useSelector(state => state.layout.layoutType);
	const leftSidebarType = useSelector(state => state.layout.leftSidebarType);
	const layoutModeType = useSelector(state => state.layout.layoutModeType);
	const layoutWidthType = useSelector(state => state.layout.layoutWidthType);
	const layoutPositionType = useSelector(
		state => state.layout.layoutPositionType
	);
	const topbarThemeType = useSelector(state => state.layout.topbarThemeType);
	const leftSidebarSizeType = useSelector(
		state => state.layout.leftSidebarSizeType
	);
	const leftSidebarViewType = useSelector(
		state => state.layout.leftSidebarViewType
	);
	const leftSidebarImageType = useSelector(
		state => state.layout.leftSidebarImageType
	);
	const sidebarVisibilitytype = useSelector(
		state => state.layout.sidebarVisibilitytype
	);

	function scrollNavigation() {
		var scrollup = document.documentElement.scrollTop;
		if (scrollup > 50) {
			setHeaderClass('topbar-shadow');
		} else {
			setHeaderClass('');
		}
	}

	useEffect(() => {
		window.addEventListener('scroll', scrollNavigation, true);
	});

	useEffect(() => {
		if (
			sidebarVisibilitytype === 'show' ||
			layoutType === 'vertical' ||
			layoutType === 'twocolumn'
		) {
			document.querySelector('.hamburger-icon')?.classList?.remove('open');
		} else {
			document.querySelector('.hamburger-icon')?.classList?.add('open');
		}
	}, [sidebarVisibilitytype, layoutType]);

	useEffect(() => {
		if (
			layoutType ||
			leftSidebarType ||
			layoutModeType ||
			layoutWidthType ||
			layoutPositionType ||
			topbarThemeType ||
			leftSidebarSizeType ||
			leftSidebarViewType ||
			leftSidebarImageType ||
			sidebarVisibilitytype
		) {
			window.dispatchEvent(new Event('resize'));
			dispatch(changeLeftSidebarViewType(leftSidebarViewType));
			dispatch(changeLeftSidebarSizeType(leftSidebarSizeType));
			dispatch(changeSidebarTheme(leftSidebarType));
			dispatch(changeLayoutMode(layoutModeType));
			dispatch(changeLayoutWidth(layoutWidthType));
			dispatch(changeLayoutPosition(layoutPositionType));
			dispatch(changeTopbarTheme(topbarThemeType));
			dispatch(changeLayout(layoutType));
			dispatch(changeSidebarImageType(leftSidebarImageType));
			dispatch(changeSidebarVisibility(sidebarVisibilitytype));
		}
	}, [
		dispatch,
		layoutModeType,
		layoutPositionType,
		layoutType,
		layoutWidthType,
		leftSidebarImageType,
		leftSidebarSizeType,
		leftSidebarType,
		leftSidebarViewType,
		sidebarVisibilitytype,
		topbarThemeType,
	]);

	const onChangeLayoutMode = value => {
		dispatch(changeLayoutMode(value));
	};

	return (
		<>
			<div id="layout-wrapper">
				<Header
					headerclassName={headerClass}
					layoutModeType={layoutModeType}
					onChangeLayoutMode={onChangeLayoutMode}
				/>
				{hasSidebardPermission && <Sidebar layoutType={layoutType} />}
				<div
					className="main-content"
					style={!hasSidebardPermission ? { margin: 0 } : {}}
				>
					<div className="page-content">
						<Outlet />
					</div>
					<Footer />
				</div>
			</div>
			<button className="btn btn-danger btn-icon" id="back-to-top">
				<i className="ri-arrow-up-line"></i>
			</button>
		</>
	);
};

export default Layout;
