import { useState, useEffect } from 'react'

/**
 * Hook utilitário para controlar estado de carregamento (skeleton).
 * @param {Function} fetchFn - função assíncrona que busca os dados
 * @param {Array} deps - dependências do useEffect (padrão: [])
 * @returns {{ isLoading: boolean }}
 */
const useSkeletonLoader = (fetchFn, deps = []) => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    fetchFn()
      .catch(() => { /* errors handled by caller */ })
      .finally(() => setIsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { isLoading }
}

export default useSkeletonLoader
