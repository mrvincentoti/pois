import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const Directorates = lazy(() => import('./Directorates'));
const Departments = lazy(() => import('./Departments'));
const Units = lazy(() => import('./Units'));
const Cadre = lazy(() => import('./Cadre'));
const Ranks = lazy(() => import('./Ranks'));
const Designations = lazy(() => import('./Designations'));
const Specialties = lazy(() => import('./Specialties'));
const Awards = lazy(() => import('./Awards'));
const Trainings = lazy(() => import('./Trainings'));
const Conferences = lazy(() => import('./Conferences'));
const Sanctions = lazy(() => import('./Sanctions'));

const Index = () => {
	return (
		<Routes>
			<Route path="directorates" element={<Directorates />} />
			<Route path="departments" element={<Departments />} />
			<Route path="units" element={<Units />} />
			<Route path="cadre" element={<Cadre />} />
			<Route path="ranks" element={<Ranks />} />
			<Route path="designations" element={<Designations />} />
			<Route path="specialty" element={<Specialties />} />
			<Route path="awards" element={<Awards />} />
			<Route path="trainings" element={<Trainings />} />
			<Route path="Conferences" element={<Conferences />} />
			<Route path="Sanctions" element={<Sanctions />} />
		</Routes>
	);
};

export default Index;
