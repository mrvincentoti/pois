import React, { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const Audit = lazy(() => import('./Audit'));

const Index = () => {
    return (
        <Routes>
            <Route path="/" element={<Audit />} />
            <Route path="*" element={<Navigate to="/not-found" />} />
            <Route path="*" element={<Navigate to="/not-found" />} />
        </Routes>
    );
};

export default Index;
