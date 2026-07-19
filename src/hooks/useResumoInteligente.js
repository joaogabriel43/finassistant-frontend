import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook do Resumo Inteligente do Período (ADR-045).
 *
 * O backend calcula TODOS os insights em Java (variação por categoria, saldo,
 * limites, assinaturas, impacto em metas) e prioriza os 3 mais relevantes.
 * O modo direto NUNCA aciona a IA (nem consome cota); o modo completo tenta
 * redigir a narrativa via Gemini quando há cota disponível.
 *
 * Expõe:
 * - resumo: ResumoInteligenteDTO ({ mes, ano, modoDireto, geradoComIa,
 *   narrativa, topInsights[], outrosInsights[], disclaimer })
 * - loading, error
 * - gerar(mes, ano, modoDireto): GET /resumo-inteligente
 */
const useResumoInteligente = () => {
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const gerar = useCallback(async (mes, ano, modoDireto = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/resumo-inteligente', {
        params: { mes, ano, modoDireto },
      });
      setResumo(res.data);
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.mensagem
        || e.response?.data?.message
        || 'Não foi possível gerar o resumo do período.';
      setError(msg);
      setResumo(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { resumo, loading, error, gerar };
};

export default useResumoInteligente;
