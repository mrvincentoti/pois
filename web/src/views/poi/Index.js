import React, { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Poi from'./Poi';
import NewPoi from'./NewPoi';
import ViewPoi from'./ViewPoi';
import PoiPrint from'./PoiPrint';
import EditPoi from'./EditPoi';
import ManagePoi from './ManagePoi';


const Index = () => {
	return (
		<Routes>
			<Route path="poi/:category" element={<Poi />} />
			<Route path="new" element={<NewPoi />} />
			<Route path=":id/view" element={<ViewPoi />} />
			<Route path=":id/print" element={<PoiPrint />} />
			<Route path=":id/edit" element={<EditPoi />} />
			<Route path=":id/manage" element={<ManagePoi />} />
			<Route path="*" element={<Navigate to="/not-found" />} />
		</Routes>
	);
};

export default Index;
