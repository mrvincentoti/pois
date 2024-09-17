import React, { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const Profiles = lazy(() => import('./Profiles'));
const NewEmployee = lazy(() => import('./NewEmployee'));
const EditEmployee = lazy(() => import('./EditEmployee'));
const ViewEmployee = lazy(() => import('./ViewEmployee'));
const Conferences = lazy(() => import('./Conferences'));
const Deployments = lazy(() => import('./Deployments'));
const Postings = lazy(() => import('./Postings'));
const ReturningFromPosting = lazy(() => import('./ReturningFromPosting'));
const Trainings = lazy(() => import('./Trainings'));
const Awards = lazy(() => import('./Awards'));
const PromotionIndex = lazy(() => import('./promotions/Index'));
const Sanctions = lazy(() => import('./Sanctions'));
const RetiredEmployees = lazy(() => import('./RetiredEmployees'));
const UpComingRetirements = lazy(() => import('./UpComingRetirements'));

const Index = () => {
	return (
		<Routes>
			<Route path="profiles" element={<Profiles />} />
			<Route path="new" element={<NewEmployee />} />
			<Route path=":id/view" element={<ViewEmployee />} />
			<Route path=":id/edit" element={<EditEmployee />} />
			<Route path="deployments" element={<Deployments />} />
			<Route path="postings" element={<Postings />} />
			<Route path="returning-from-post" element={<ReturningFromPosting />} />
			<Route path="trainings" element={<Trainings />} />
			<Route path="conferences" element={<Conferences />} />
			<Route path="awards" element={<Awards/>} />
			<Route path="promotions/*" element={<PromotionIndex />} />
			<Route path="sanctions" element={<Sanctions />} />
			<Route path="retired-employees" element={<RetiredEmployees />} />
			<Route path="upcoming-retirees" element={<UpComingRetirements />} />
			<Route path="*" element={<Navigate to="/not-found" />} />
			<Route path="*" element={<Navigate to="/not-found" />} />
		</Routes>
	);
};

export default Index;
