import React, { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const Feedback = lazy(() => import('./Feedbacks'));
const NewFeedback = lazy(() => import('./NewFeedback'));
const ViewFeedback = lazy(() => import('./ViewFeedback'));

const Index = () => {
    return (
        <Routes>
            <Route path="/" element={<Feedback />} />
            <Route path="new" element={<NewFeedback />} />
            <Route path=":id/view" element={<ViewFeedback />} />
            <Route path="*" element={<Navigate to="/not-found" />} />
        </Routes>
    );
};

export default Index;
