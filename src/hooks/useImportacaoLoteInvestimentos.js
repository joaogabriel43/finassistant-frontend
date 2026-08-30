import { useState } from 'react';
import { investimentoService } from '../services/investimentoService';
import { extrairMensagemErroApi, logErroSeguro } from '../utils/apiErrorUtils';

/**
 * Estado + orquestração do fluxo preview → confirmar da importação em lote de
 * investimentos via CSV (ADR-052). Espelha `useExtratoImportacao` (ADR-010),
 * substituindo apenas os endpoints e o formato do payload de confirmação
 * (array de `ImportacaoLoteItemPreviewDTO`, cada um já com `previewId`).
 */
export function useImportacaoLoteInvestimentos() {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [eventoCorporativoNaoDetectado, setEventoCorporativoNaoDetectado] = useState(null);

  const analisarArquivo = async (file) => {
    setLoading(true);
    setError(null);
    setPreview(null);
    setResultado(null);
    setEventoCorporativoNaoDetectado(null);
    try {
      const data = await investimentoService.previewImportacaoLote(file);
      setPreview(data);
    } catch (err) {
      logErroSeguro('Erro ao analisar CSV de importação em lote', err);
      setError(extrairMensagemErroApi(err, 'Erro ao analisar o arquivo.'));
    } finally {
      setLoading(false);
    }
  };

  const confirmarImportacao = async (itens, eventosCorporativos = []) => {
    setConfirming(true);
    setError(null);
    try {
      const data = await investimentoService.confirmarImportacaoLote(itens, eventosCorporativos);
      setEventoCorporativoNaoDetectado(null);
      setResultado(data);
    } catch (err) {
      logErroSeguro('Erro ao confirmar importação em lote', err);
      const detalhe = err?.response?.data;
      if (detalhe?.erro === 'EVENTO_CORPORATIVO_NAO_DETECTADO') {
        setEventoCorporativoNaoDetectado({
          ticker: detalhe.ticker,
          linha: detalhe.linha,
          dataVenda: detalhe.dataVenda,
          mensagem: detalhe.mensagem,
        });
        setError(null);
      } else {
        setError(extrairMensagemErroApi(err, 'Erro ao importar os ativos.'));
      }
    } finally {
      setConfirming(false);
    }
  };

  const resetar = () => {
    setPreview(null);
    setLoading(false);
    setConfirming(false);
    setError(null);
    setResultado(null);
    setEventoCorporativoNaoDetectado(null);
  };

  return {
    preview,
    loading,
    confirming,
    error,
    resultado,
    eventoCorporativoNaoDetectado,
    analisarArquivo,
    confirmarImportacao,
    resetar,
  };
}
