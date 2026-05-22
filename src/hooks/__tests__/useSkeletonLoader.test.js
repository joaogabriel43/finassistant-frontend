import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import useSkeletonLoader from '../useSkeletonLoader'

describe('useSkeletonLoader', () => {
  it('isLoading=true durante o fetch', async () => {
    let resolve
    const fetchFn = () => new Promise(r => { resolve = r })
    const { result } = renderHook(() => useSkeletonLoader(fetchFn))
    expect(result.current.isLoading).toBe(true)
    await act(async () => resolve())
  })

  it('isLoading=false após fetch resolver', async () => {
    const fetchFn = vi.fn().mockResolvedValue([])
    const { result } = renderHook(() => useSkeletonLoader(fetchFn))
    await act(async () => {})
    expect(result.current.isLoading).toBe(false)
  })

  it('isLoading=false após fetch rejeitar', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('fail'))
    const { result } = renderHook(() => useSkeletonLoader(fetchFn))
    await act(async () => {})
    expect(result.current.isLoading).toBe(false)
  })
})
