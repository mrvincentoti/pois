import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import DuePromotions from "./DuePromotions";

const Promotions = lazy(() => import('./Promotions'));
const Briefs = lazy(() => import('./Briefs'));
const BriefDetails = lazy(() => import('./BriefDetails'));
const UpdateBrief = lazy(() => import('./UpdateBrief'));

const Index = () => {
	return (
		<Routes>
			<Route path="" element={<Promotions />} />
			<Route exact path="briefs" element={<Briefs />} />
			<Route exact path="due" element={<DuePromotions />} />
			<Route exact path="briefs/:id" element={<BriefDetails />} />
			<Route exact path="updatebrief/:id" element={<UpdateBrief />} />
		</Routes>
	);
};

export default Index;
