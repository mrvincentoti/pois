import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const Users = lazy(() => import('./Users'));
const Roles = lazy(() => import('./Roles'));
const Permissions = lazy(() => import('./Permissions'));

const Index = () => {
	return (
		<Routes>
			<Route path="users" element={<Users />} />
			<Route path="roles" element={<Roles />} />
			<Route path="permissions" element={<Permissions />} />
		</Routes>
	);
};

export default Index;
