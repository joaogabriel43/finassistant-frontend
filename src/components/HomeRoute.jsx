import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Porta de entrada da rota "/" (ADR-039): visitante vê a landing page;
 * usuário autenticado vai direto ao dashboard (padrão de SaaS — a landing
 * é material de aquisição, não navegação interna). Enquanto a sessão está
 * sendo validada não renderiza nada, para não piscar a landing para quem
 * já está logado.
 */
const HomeRoute = ({ landing }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return null;
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return landing;
};

export default HomeRoute;
