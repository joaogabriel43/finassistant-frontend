import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import PageLoader from './components/ui/PageLoader';
import ConsentimentoModal from './components/ConsentimentoModal';
import api from './services/api';

const LoginPage               = lazy(() => import('./pages/LoginPage'));
const Registro                = lazy(() => import('./pages/Registro'));
const Dashboard               = lazy(() => import('./pages/Dashboard'));
const Chat                    = lazy(() => import('./pages/Chat'));
const Orcamento               = lazy(() => import('./pages/Orcamento'));
const Investimentos           = lazy(() => import('./pages/Investimentos'));
const Questionario            = lazy(() => import('./pages/Questionario'));
const FluxoCaixa              = lazy(() => import('./pages/FluxoCaixa'));
const Metas                   = lazy(() => import('./pages/Metas'));
const Configuracoes           = lazy(() => import('./pages/Configuracoes'));
const CalculadorasPage        = lazy(() => import('./pages/CalculadorasPage'));
const StatusPage              = lazy(() => import('./pages/StatusPage'));
const NotFound                = lazy(() => import('./pages/NotFound'));
const PlanoPage               = lazy(() => import('./pages/PlanoPage'));
const IrPage                  = lazy(() => import('./pages/IrPage'));
const TermosUsoPage           = lazy(() => import('./pages/TermosUsoPage'));
const PoliticaPrivacidadePage = lazy(() => import('./pages/PoliticaPrivacidadePage'));

/**
 * Wrapper interno (dentro de AuthProvider) — verifica consentimento LGPD após login.
 * Exibe ConsentimentoModal se o usuário autenticado não consentiu com a versão vigente.
 */
function AppContent({ children }) {
    const { user } = useAuth();
    const [consentimentoPendente, setConsentimentoPendente] = useState(false);

    useEffect(() => {
        if (!user) { setConsentimentoPendente(false); return; }
        api.get('/conta/consentimento/status')
            .then(res => setConsentimentoPendente(!res.data.consentido))
            .catch(() => { /* falha silenciosa — não bloqueia o uso */ });
    }, [user?.id]);

    return (
        <>
            {children}
            {/* ConsentimentoModal LGPD sobrepõe qualquer tela quando pendente */}
            <ConsentimentoModal
                open={consentimentoPendente}
                onAceitar={() => setConsentimentoPendente(false)}
            />
        </>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
              <ErrorBoundary>
                <AppContent>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Rotas Públicas — acessíveis sem login (inclui páginas legais LGPD) */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/registrar" element={<Registro />} />
                        <Route path="/status" element={<StatusPage />} />
                        <Route path="/termos" element={<TermosUsoPage />} />
                        <Route path="/privacidade" element={<PoliticaPrivacidadePage />} />

                        {/* Rotas Protegidas aninhadas sob o ProtectedRoute */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/chat" element={<Chat />} />
                            <Route path="/orcamento" element={<Orcamento />} />
                            <Route path="/investimentos" element={<Investimentos />} />
                            <Route path="/questionario" element={<Questionario />} />
                            <Route path="/questionario-perfil" element={<Questionario />} />
                            <Route path="/fire-calculator" element={<Navigate to="/calculadoras" replace />} />
                            <Route path="/fluxo-caixa" element={<FluxoCaixa />} />
                            <Route path="/metas" element={<Metas />} />
                            <Route path="/configuracoes" element={<Configuracoes />} />
                            <Route path="/calculadoras" element={<CalculadorasPage />} />
                            <Route path="/plano" element={<PlanoPage />} />
                            <Route path="/ir" element={<IrPage />} />
                        </Route>

                        {/* Rota Catch-all para caminhos não encontrados */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </AppContent>
              </ErrorBoundary>
            </AuthProvider>
        </Router>
    );
}

export default App;
