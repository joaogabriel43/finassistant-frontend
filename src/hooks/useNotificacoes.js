import { useState, useCallback, useEffect } from 'react'
import api from '../services/api'
import { useWebSocket } from './useWebSocket'

/**
 * Hook de estado para notificações do usuário.
 * Gerencia contagem de não lidas e integra com WebSocket para receber em tempo real.
 */
export function useNotificacoes() {
  const [notificacoes, setNotificacoes] = useState([])
  const [naoLidas, setNaoLidas] = useState(0)

  // Estado para o Snackbar especial de meta atingida
  const [metaAtingidaOpen, setMetaAtingidaOpen] = useState(false)
  const [metaAtingidaMensagem, setMetaAtingidaMensagem] = useState('')

  // Estado para o Snackbar especial de digest semanal
  const [digestSemanalOpen, setDigestSemanalOpen] = useState(false)
  const [digestSemanalMensagem, setDigestSemanalMensagem] = useState('')

  // Busca contagem inicial
  useEffect(() => {
    api.get('/notificacoes/count')
      .then(res => setNaoLidas(res.data.naoLidas ?? 0))
      .catch(() => {/* sem conexão ou não autenticado — ignora */})
  }, [])

  const handleNovaNotificacao = useCallback((notificacao) => {
    // META_ATINGIDA tem tratamento especial: exibe Snackbar de celebração
    // e não entra na lista normal de notificações
    if (notificacao.tipo === 'META_ATINGIDA') {
      setMetaAtingidaMensagem(notificacao.mensagem || '🎉 Você atingiu uma meta financeira!')
      setMetaAtingidaOpen(true)
      return
    }

    // DIGEST_SEMANAL tem Snackbar especial com botão "Ver resumo", mas
    // também entra na lista para acesso posterior no drawer
    if (notificacao.tipo === 'DIGEST_SEMANAL') {
      setDigestSemanalMensagem(notificacao.mensagem || '📊 Seu resumo semanal chegou!')
      setDigestSemanalOpen(true)
      setNotificacoes(prev => [notificacao, ...prev])
      setNaoLidas(prev => prev + 1)
      return
    }

    setNotificacoes(prev => [notificacao, ...prev])
    setNaoLidas(prev => prev + 1)
  }, [])

  useWebSocket({ onNotificacao: handleNovaNotificacao })

  const marcarComoLida = useCallback(async (id) => {
    await api.patch(`/notificacoes/${id}/lida`)
    setNotificacoes(prev =>
      prev.map(n => n.id === id ? { ...n, lida: true } : n)
    )
    setNaoLidas(prev => Math.max(0, prev - 1))
  }, [])

  return {
    notificacoes,
    naoLidas,
    marcarComoLida,
    metaAtingidaOpen,
    metaAtingidaMensagem,
    fecharMetaAtingida: () => setMetaAtingidaOpen(false),
    digestSemanalOpen,
    digestSemanalMensagem,
    fecharDigestSemanal: () => setDigestSemanalOpen(false),
  }
}
