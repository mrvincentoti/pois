import React, { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const Poi = lazy(() => import('./Poi'));
const NewPoi = lazy(() => import('./NewPoi'));
const ViewPoi = lazy(() => import('./ViewPoi'));
const PoiPrint = lazy(() => import('./PoiPrint'));
const EditPoi = lazy(() => import('./EditPoi'));
const ManagePoi = lazy(() => import('./ManagePoi'));

const Index = () => {
	return (
		<Routes>
			<Route path="poi" element={<Poi />} />
			<Route path="new" element={<NewPoi />} />
			<Route path=":id/view" element={<ViewPoi />} />
			<Route path=":id/print" element={<PoiPrint />} />
			<Route path=":id/edit" element={<EditPoi />} />
			<Route path=":id/manage" element={<ManagePoi />} />
			<Route path="*" element={<Navigate to="/not-found" />} />
			<Route path="*" element={<Navigate to="/not-found" />} />
		</Routes>
	);
};

export default Index;
