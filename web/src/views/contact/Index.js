import React, { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const NewFeedback = lazy(() => import('./NewFeedback'));

const Index = () => {
    return (
			<Routes>
				<Route path="/" element={<NewFeedback />} />
				<Route path="*" element={<Navigate to="/not-found" />} />
			</Routes>
		);
};

export default Index;
