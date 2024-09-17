import { createSlice } from '@reduxjs/toolkit';

import {
	layoutModeTypes,
	layoutPositionTypes,
	layoutTypes,
	layoutWidthTypes,
	leftSidebarImageTypes,
	leftSidebarTypes,
	leftSidebarViewTypes,
	leftSidebarSizeTypes,
	preloaderTypes,
	sidebarVisibilitytypes,
	topbarThemeTypes,
} from '../../services/layout';
import { changeHTMLAttribute } from '../../services/utilities';

export const layoutSlice = createSlice({
	name: 'layout',
	initialState: {
		layoutType: layoutTypes.VERTICAL,
		leftSidebarType: leftSidebarTypes.LIGHT,
		layoutModeType: layoutModeTypes.LIGHTMODE,
		layoutWidthType: layoutWidthTypes.FLUID,
		layoutPositionType: layoutPositionTypes.FIXED,
		topbarThemeType: topbarThemeTypes.DARK,
		leftSidebarSizeType: leftSidebarSizeTypes.DEFAULT,
		leftSidebarViewType: leftSidebarViewTypes.DEFAULT,
		leftSidebarImageType: leftSidebarImageTypes.NONE,
		preloader: preloaderTypes.DISABLE,
		sidebarVisibilitytype: sidebarVisibilitytypes.SHOW,
	},
	reducers: {
		changeLayout(state, action) {
			state.layoutType = action.payload;
			try {
				if (action.payload === 'twocolumn') {
					document.documentElement.removeAttribute('data-layout-width');
				} else if (action.payload === 'horizontal') {
					document.documentElement.removeAttribute('data-sidebar-size');
				} else if (action.payload === 'semibox') {
					changeHTMLAttribute('data-layout-width', 'fluid');
					changeHTMLAttribute('data-layout-style', 'default');
				}
				changeHTMLAttribute('data-layout', action.payload);
			} catch (error) {}
		},
		changeLayoutMode(state, action) {
			state.layoutModeType = action.payload;
			try {
				changeHTMLAttribute('data-bs-theme', action.payload);
			} catch (error) {}
		},
		changeLeftSidebarViewType(state, action) {
			state.leftSidebarViewType = action.payload;
			try {
				changeHTMLAttribute('data-layout-style', action.payload);
			} catch (error) {}
		},
		changeLeftSidebarSizeType(state, action) {
			state.leftSidebarSizeType = action.payload;
			try {
				switch (action.payload) {
					case 'lg':
						changeHTMLAttribute('data-sidebar-size', 'lg');
						break;
					case 'md':
						changeHTMLAttribute('data-sidebar-size', 'md');
						break;
					case 'sm':
						changeHTMLAttribute('data-sidebar-size', 'sm');
						break;
					case 'sm-hover':
						changeHTMLAttribute('data-sidebar-size', 'sm-hover');
						break;
					default:
						changeHTMLAttribute('data-sidebar-size', 'lg');
				}
			} catch (error) {}
		},
		changeSidebarTheme(state, action) {
			state.leftSidebarType = action.payload;
			try {
				changeHTMLAttribute('data-sidebar', action.payload);
			} catch (error) {}
		},
		changeLayoutWidth(state, action) {
			state.layoutWidthType = action.payload;
			try {
				if (action.payload === 'lg') {
					changeHTMLAttribute('data-layout-width', 'fluid');
				} else {
					changeHTMLAttribute('data-layout-width', 'boxed');
				}
			} catch (error) {}
		},
		changeLayoutPosition(state, action) {
			state.layoutPositionType = action.payload;
			try {
				changeHTMLAttribute('data-layout-position', action.payload);
			} catch (error) {}
		},
		changeTopbarTheme(state, action) {
			state.topbarThemeType = action.payload;
			try {
				changeHTMLAttribute('data-topbar', action.payload);
			} catch (error) {}
		},
		changeSidebarImageType(state, action) {
			state.leftSidebarImageType = action.payload;
			try {
				changeHTMLAttribute('data-sidebar-image', action.payload);
			} catch (error) {}
		},
		changeSidebarVisibility(state, action) {
			state.sidebarVisibilitytype = action.payload;
			try {
				changeHTMLAttribute('data-sidebar-visibility', action.payload);
			} catch (error) {}
		},
	},
});

export const {
	changeLayout,
	changeLayoutMode,
	changeLeftSidebarViewType,
	changeLeftSidebarSizeType,
	changeSidebarTheme,
	changeLayoutWidth,
	changeLayoutPosition,
	changeTopbarTheme,
	changeSidebarImageType,
	changeSidebarVisibility,
} = layoutSlice.actions;

export default layoutSlice.reducer;
