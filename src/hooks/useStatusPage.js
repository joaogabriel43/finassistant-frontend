import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api'

export function useStatusPage() {
  const [servicos, setServicos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStatus = useCallback(() => {
    setLoading(true)
    axios.get(`${BASE_URL}/status`)
      .then(res => {
        setServicos(res.data)
        setError(null)
      })
      .catch(() => setError('Erro ao verificar status'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  return { servicos, loading, error, refetch: fetchStatus }
}
