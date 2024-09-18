import React, { Suspense, lazy, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
	Navigate,
	Route,
	Routes,
	useLocation,
	useNavigate,
} from 'react-router-dom';

import { useAuth } from './hooks/auth';
import Layout from './layouts/Layout';
import Splash from './views/Splash';
import NoMatch from './views/NoMatch';
import GuestLayout from './layouts/GuestLayout';
import { PREVIOUS_PATH } from './services/constants';
import LocalStorage from './services/storage';
import { checkPermission } from './services/utilities';

// public routes
const Login = lazy(() => import('./views/authentication/Login'));
const SetPassword = lazy(() => import('./views/authentication/SetPassword'));
const ForgotPassword = lazy(
	() => import('./views/authentication/ForgotPassword')
);
const ResetPassword = lazy(
	() => import('./views/authentication/ResetPassword')
);
const EmailSent = lazy(() => import('./views/authentication/EmailSent'));
const Logout = lazy(() => import('./views/authentication/Logout'));

const publicRoutes = [
	{ path: '/login', component: <Login /> },
	{ path: '/set-password', component: <SetPassword /> },
	{ path: '/forgot-password', component: <ForgotPassword /> },
	{ path: '/reset-link-sent', component: <EmailSent /> },
	{ path: '/reset-link-sent', component: <EmailSent /> },
	{ path: '/reset-password/:token', component: <ResetPassword /> },
	{ path: '/logout', component: <Logout /> },
];

// authenticated routes
const Dashboard = lazy(() => import('./views/Dashboard'));
const EntityIndex = lazy(() => import('./views/Entity/Index'));
const EmployeesIndex = lazy(() => import('./views/employees/Index'));
const AuditTrail = lazy(() => import('./views/AuditTrail'));
const AccountsIndex = lazy(() => import('./views/accounts/Index'));
const Setup = lazy(() => import('./views/setup/Index'));
const Profile = lazy(() => import('./views/Profile'));
const DependentsProfile = lazy(() => import('./views/Dependents-Profile'));
const PostingProfile = lazy(() => import('./views/employees/EmployeePostings'));
const TrainingsProfile = lazy(() => import('./views/employees/TrainingsProfile'));
const ConferencesProfile = lazy(() => import('./views/employees/ConferencesProfile'));
const NextOfKinProfile = lazy(() => import('./views/employees/NextOfKinProfile'));
const DeploymentsProfile = lazy(() => import('./views/employees/DeploymentProfile'));
const PromotionsProfile = lazy(() => import('./views/employees/PromotionsProfile'));
const AwardsProfile = lazy(() => import('./views/employees/AwardsProfile'));
const SanctionsProfile = lazy(() => import('./views/employees/SanctionsProfile'));
const Dependents = lazy(() => import('./views/Dependents'));
const NextOfKin = lazy(() => import('./views/NextOfKin'));
const Trainings = lazy(() => import('./views/Trainings'));
const Conferences = lazy(() => import('./views/Conferences'));
const RetiredEmployees = lazy(
	() => import('./views/employees/RetiredEmployees')
);

const authProtectedRoutes = [
	{ path: '/', component: <Dashboard /> },
	{ path: 'entity/*', component: <EntityIndex /> },
	{ path: 'users/:username', component: <Profile /> },
	{ path: 'dependents/:id', component: <DependentsProfile /> },
	{ path: 'deployments/:id', component: <DeploymentsProfile /> },
	{ path: 'next-of-kin/:id', component: <NextOfKinProfile /> },
	{ path: 'trainings/:id', component: <TrainingsProfile /> },
	{ path: 'conferences/:id', component: <ConferencesProfile /> },
	{ path: 'promotions/:id', component: <PromotionsProfile /> },
	{ path: 'awards/:id', component: <AwardsProfile /> },
	{ path: 'sanctions/:id', component: <SanctionsProfile /> },
	{ path: 'employee-posting/:id', component: <PostingProfile /> },
	{ path: 'employees/*', component: <EmployeesIndex /> },
	{ path: 'accounts/*', component: <AccountsIndex /> },
	{ path: 'audit-trail', component: <AuditTrail /> },
	{ path: 'setup/*', component: <Setup /> },
	{ path: 'dependents', component: <Dependents /> },
	{ path: 'next-of-kin', component: <NextOfKin /> },
	{ path: 'trainings', component: <Trainings /> },
	{ path: 'conferences', component: <Conferences /> },
	{ path: 'retired-employees', component: <RetiredEmployees /> },
];

function RequireAuth({ children }) {
	const location = useLocation();

	const preloading = useSelector(state => state.setting.preloading);
	const permissions = useSelector(state => state.user.permissions);

	const navigate = useNavigate();

	const { user, logout } = useAuth();

	useEffect(() => {
		if (!user && preloading) {
			logout(() => {});
		}
	}, [logout, navigate, preloading, user]);

	if (!user) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	} else if (user && user.is_first_time) {
		return <Navigate to="/set-password" state={{ from: location }} replace />;
	}

	if (user) {
		if (
			!checkPermission(permissions, 'can-view-dashboard') &&
			location.pathname === '/'
		) {
			return (
				<Navigate
					to={`/users/${user?.username}`}
					state={{ from: location }}
					replace
				/>
			);
		}
	}

	return <>{children}</>;
}

const storage = new LocalStorage();

function CheckLoggedIn({ children, user }) {
	const location = useLocation();
	const path = location.pathname.split('/').pop();

	if (user) {
		if (user.is_first_time) {
			if (path === 'set-password') {
				return children;
			} else {
				return (
					<Navigate to="/set-password" state={{ from: location }} replace />
				);
			}
		}

		if (path === 'login' || path === 'logout') {
			const previous_path = storage.getItem(PREVIOUS_PATH);
			return (
				<Navigate
					to={previous_path || '/'}
					state={{ from: location }}
					replace
				/>
			);
		}
	}

	return children;
}

const AppRoutes = () => {
	const { user } = useAuth();

	return (
		<Routes>
			<Route
				path="/"
				element={
					<RequireAuth>
						<Layout />
					</RequireAuth>
				}
			>
				{authProtectedRoutes.map((route, idx) => (
					<Route
						path={route.path}
						element={
							<Suspense fallback={<Splash />}>{route.component}</Suspense>
						}
						key={idx}
						exact={true}
					/>
				))}
			</Route>
			{publicRoutes.map((route, idx) => (
				<Route
					path={route.path}
					element={
						<Suspense fallback={<Splash />}>
							<CheckLoggedIn user={user}>
								<GuestLayout>{route.component}</GuestLayout>
							</CheckLoggedIn>
						</Suspense>
					}
					key={idx}
					exact={true}
				/>
			))}
			<Route path="*" element={<NoMatch />} />
		</Routes>
	);
};

export default AppRoutes;
