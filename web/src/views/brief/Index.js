import React, { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const Brief = lazy(() => import('./Brief'));
const NewBrief = lazy(() => import('./NewBrief'));
const ViewBrief = lazy(() => import('./ViewBrief'));
const EditBrief = lazy(() => import('./EditBrief'));
// const ManagePoi = lazy(() => import('./ManagePoi'));

const Index = () => {
    return (
        <Routes>
            <Route path="/" element={<Brief />} />
            <Route path="new" element={<NewBrief />} />
            <Route path=":id/view" element={<ViewBrief />} />
            <Route path=":id/edit" element={<EditBrief />} />
            {/* <Route path=":id/manage" element={<ManagePoi />} /> */}
            <Route path="*" element={<Navigate to="/not-found" />} />
            <Route path="*" element={<Navigate to="/not-found" />} />
        </Routes>
    );
};

export default Index;
