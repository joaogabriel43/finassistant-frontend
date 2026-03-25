import { useState, useCallback } from 'react';
import api from '../services/api';

export function useMarkowitz() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resultado, setResultado] = useState(null);

    const otimizar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/investimentos/otimizacao-markowitz');
            setResultado(response.data);
        } catch (err) {
            const msg = err.response?.status === 503
                ? 'Serviço de dados de mercado temporariamente indisponível. Tente novamente em alguns minutos.'
                : err.message || 'Erro ao otimizar portfólio.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, resultado, otimizar };
}
