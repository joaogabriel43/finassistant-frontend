import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const RECURSO_LABELS = {
  CHAT_MENSAGEM: 'Mensagens no chat',
  ANOMALIA_DETECCAO: 'Detecção de anomalias',
  MARKOWITZ: 'Otimização de portfólio',
  COTACAO_TEMPO_REAL: 'Cotação em tempo real',
  EXPORTACAO_PDF: 'Exportação de relatórios PDF',
  ALERTA_PRECO: 'Alertas de preço',
}

const usePlano = () => {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    try {
      const res = await api.get('/plano/status')
      setStatus(res.data)
    } catch {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const isPremium = status?.isPremium ?? false

  const isLimitado = (recurso) => {
    if (isPremium) return false
    const uso = status?.usos?.[recurso]
    if (!uso) return false
    if (uso.bloqueado) return true
    return uso.usado >= uso.limite && uso.limite > 0
  }

  const getUso = (recurso) => status?.usos?.[recurso] ?? null

  const isUpgradeNeeded = (recurso) => isLimitado(recurso)

  return { plano: status?.plano ?? 'FREE', isPremium, isLimitado, getUso, isUpgradeNeeded, loading, recarregar: carregar }
}

export { RECURSO_LABELS }
export default usePlano
