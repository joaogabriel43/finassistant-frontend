import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { login as authLogin, logout as authLogout, getToken as getStoredToken } from '../services/authService';

// Export nomeado exigido
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Carrega somente o usuário se houver token armazenado. NÃO redireciona.
    useEffect(() => {
        const existingToken = getStoredToken();
        if (existingToken) {
            setToken(existingToken);
            api.get('/auth/me')
                .then(response => {
                    setUser(response.data);
                })
                .catch(() => {
                    localStorage.removeItem('authToken');
                    setUser(null);
                    setToken(null);
                    // também zera header default por segurança
                    try { delete api.defaults.headers.common['Authorization']; } catch (_) {}
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (credentials) => {
        // Sinaliza início do processo de autenticação
        setLoading(true);
        // remove qualquer Authorization antigo antes de chamar /auth/login
        try { delete api.defaults.headers.common['Authorization']; } catch (_) {}

        const data = await authLogin(credentials.username, credentials.password);
        if (!data?.token) {
            setLoading(false); // garante que o loading finalize em falha precoce
            return data;
        }

        setToken(data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

        try {
            const userResponse = await api.get('/auth/me');
            const userData = userResponse.data;
            setUser(userData);
            if (userData && userData.questionarioRespondido === false) {
                navigate('/questionario');
            } else {
                navigate('/dashboard');
            }
        } catch (e) {
            authLogout();
            setUser(null);
            setToken(null);
            try { delete api.defaults.headers.common['Authorization']; } catch (_) {}
        } finally {
            setLoading(false);
        }
        return data;
    }, [navigate, authLogout]);

    const logout = useCallback(() => {
        authLogout();
        setUser(null);
        setToken(null);
        try { delete api.defaults.headers.common['Authorization']; } catch (_) {}
        navigate('/login');
    }, [navigate]);

    const updateUser = useCallback(async () => {
        try {
            const me = await api.get('/auth/me');
            setUser(me.data);
        } catch {/* ignore */}
    }, []);

    const value = useMemo(() => ({
        user,
        token,
        loading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!token
    }), [user, token, loading, login, logout, updateUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() { return useContext(AuthContext); }
