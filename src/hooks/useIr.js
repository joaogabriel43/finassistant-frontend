import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Hook para gerenciar apuração de IR sobre renda variável.
 *
 * Expõe:
 * - apuracao: IrApuracaoDTO do mês/ano selecionado
 * - operacoes: lista de OperacaoBolsaDTO do período
 * - darf: DarfDTO gerado (null até gerarDarf ser chamado)
 * - loading, error
 * - apurar(mes, ano): chama GET /ir/apuracao e GET /ir/operacoes
 * - registrarOperacao(body): POST /ir/operacao
 * - excluirOperacao(id): DELETE /ir/operacao/{id}
 * - gerarDarf(apuracaoId): POST /ir/apuracao/{id}/darf
 */
const useIr = () => {
  const [apuracao, setApuracao] = useState(null);
  const [operacoes, setOperacoes] = useState([]);
  const [darf, setDarf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDarf, setLoadingDarf] = useState(false);
  const [error, setError] = useState(null);
  const [errorDarf, setErrorDarf] = useState(null);

  const apurar = useCallback(async (mes, ano) => {
    setLoading(true);
    setError(null);
    setDarf(null); // limpa DARF ao re-apurar
    try {
      const [apRes, opRes] = await Promise.all([
        api.get('/ir/apuracao', { params: { mes, ano } }),
        api.get('/ir/operacoes', { params: { mes, ano } }),
      ]);
      setApuracao(apRes.data);
      setOperacoes(opRes.data ?? []);
    } catch (e) {
      const msg = e.response?.data?.mensagem
        || e.response?.data?.message
        || 'Erro ao calcular apuração de IR.';
      setError(msg);
      setApuracao(null);
      setOperacoes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const registrarOperacao = useCallback(async (body) => {
    const res = await api.post('/ir/operacao', body);
    return res.data;
  }, []);

  const excluirOperacao = useCallback(async (id) => {
    await api.delete(`/ir/operacao/${id}`);
  }, []);

  const gerarDarf = useCallback(async (apuracaoId) => {
    setLoadingDarf(true);
    setErrorDarf(null);
    try {
      const res = await api.post(`/ir/apuracao/${apuracaoId}/darf`);
      setDarf(res.data);
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.mensagem
        || e.response?.data?.message
        || 'Não foi possível gerar o DARF.';
      setErrorDarf(msg);
      return null;
    } finally {
      setLoadingDarf(false);
    }
  }, []);

  return {
    apuracao,
    operacoes,
    darf,
    loading,
    loadingDarf,
    error,
    errorDarf,
    apurar,
    registrarOperacao,
    excluirOperacao,
    gerarDarf,
  };
};

export default useIr;
