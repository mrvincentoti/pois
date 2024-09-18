import React, { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';


const Poi = lazy(() => import('./Poi'));
const Organisation = lazy(() => import('./Organisation'));
const Brief = lazy(() => import('./Brief'));


const Index = () => {
	return (
		<Routes>
			<Route path="poi" element={<Poi />} />
			<Route path="organisation" element={<Organisation />} />
			<Route path="brief" element={<Brief />} />
			
			<Route path="*" element={<Navigate to="/not-found" />} />
			<Route path="*" element={<Navigate to="/not-found" />} />
		</Routes>
	);
};

export default Index;