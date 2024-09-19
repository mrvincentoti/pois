import React, { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const NewPoi = lazy(() => import('./NewPoi'));

const Index = () => {
	return (
		<Routes>
			<Route path="new" element={<NewPoi />} />
			<Route path="*" element={<Navigate to="/not-found" />} />
			<Route path="*" element={<Navigate to="/not-found" />} />
		</Routes>
	);
};

export default Index;
