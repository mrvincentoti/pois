import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const Crimes = lazy(() => import('./Crimes'));
const ArrestingBodies = lazy(() => import('./Arresting_Bodies'));
const Arms = lazy(() => import('./Arms'));
const Sources = lazy(() => import('./Sources'));
const Categories = lazy(() => import('./Categories'));
const Affiliations = lazy(() => import('./Affiliations'));

const Index = () => {
	return (
		<Routes>
			<Route path="crimes" element={<Crimes />} />
			<Route path="arresting_bodies" element={<ArrestingBodies />} />
			<Route path="arms" element={<Arms />} />
			<Route path="sources" element={<Sources />} />
			<Route path="categories" element={<Categories />} />
			<Route path="affiliations" element={<Affiliations />} />
		</Routes>
	);
};

export default Index;
