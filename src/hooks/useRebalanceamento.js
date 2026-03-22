import { useState, useCallback } from 'react';
import api from '../services/api';

export function useRebalanceamento() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sugestoes, setSugestoes] = useState(null);

    const analisar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/rebalanceamento/analisar');
            setSugestoes(response.data);
        } catch (err) {
            setError(err.message || 'Erro ao analisar rebalanceamento.');
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, sugestoes, analisar };
}
