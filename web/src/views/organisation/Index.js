import React, { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Organisation from './Organisation';
import NewOrganisation from './NewOrganisation';
import EditOrganisation from './EditOrganisation';
import ViewOrganisation from './ViewOrganisation';


const Index = () => {
    return (
        <Routes>
            <Route path="organisation" element={<Organisation />} />
            <Route path="new" element={<NewOrganisation />} />
            <Route path=":id/edit" element={<EditOrganisation />} />
            <Route path=":id/view" element={<ViewOrganisation />} />
            <Route path="*" element={<Navigate to="/not-found" />} />
            <Route path="*" element={<Navigate to="/not-found" />} />
        </Routes>
    );
};

export default Index;
