import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const POLL_INTERVAL_MS = 30000

export function useStatusPage() {
  const [servicos, setServicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStatus = useCallback(() => {
    setLoading(true)
    api.get('/status')
      .then(res => {
        setServicos(res.data)
        setError(null)
      })
      .catch(() => setError('Erro ao verificar status'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchStatus()

    // Diagnostico de consumo de compute do Neon (2026-08): uma aba de Status
    // esquecida aberta em background continuava pollando a cada 30s, o que
    // mantinha o banco sempre acordado. Polling agora pausa quando a aba
    // sai de foco e retoma (com um fetch imediato) quando ela volta a ficar
    // visivel — comportamento com a aba ativa/visivel fica inalterado.
    let interval = null

    const startPolling = () => {
      if (interval) return
      interval = setInterval(fetchStatus, POLL_INTERVAL_MS)
    }

    const stopPolling = () => {
      clearInterval(interval)
      interval = null
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchStatus()
        startPolling()
      } else {
        stopPolling()
      }
    }

    if (document.visibilityState === 'visible') {
      startPolling()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchStatus])

  return { servicos, loading, error, refetch: fetchStatus }
}
