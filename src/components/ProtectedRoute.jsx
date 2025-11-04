import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './layout/Layout';

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Verificando autenticação...</div>;
    }

    return isAuthenticated ? <Layout /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
