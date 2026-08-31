/**
 * F-01 — o logout precisa AGUARDAR a destruição dos caches de API.
 *
 * Antes da correção, `caches.keys().then(...)` era uma promise solta: o logout
 * retornava, a UI navegava para /login e a próxima conta podia autenticar com o
 * cache da conta anterior ainda de pé. Estes testes travam o comportamento novo.
 *
 * A purga é escopada ao namespace de API (`ehCacheDeApi`). O precache do Workbox
 * fica de fora de propósito — ver o teste dedicado no meio do arquivo.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../api', () => ({
  default: { post: vi.fn(() => Promise.resolve({ data: {} })) },
}))

import api from '../api'
import { logout, limparCachesDoPwa, TIMEOUT_LIMPEZA_CACHE_MS } from '../authService'
import { CACHE_API_PUBLICA } from '../../pwa/apiRuntimeCaching'

/** Nome real gerado pelo Workbox: precache + escopo da instalação. */
const PRECACHE_WORKBOX = 'workbox-precache-v2-https://pondero.vercel.app/'

/** Cache Storage falso com controle explícito de quando cada delete resolve. */
function cacheStorageFalso(nomes, { atrasarDelete = false } = {}) {
  const armazenados = new Set(nomes)
  const pendentes = []
  return {
    armazenados,
    liberarDeletes: () => pendentes.splice(0).forEach((liberar) => liberar()),
    keys: vi.fn(async () => [...armazenados]),
    delete: vi.fn(
      (nome) =>
        new Promise((resolve) => {
          const aplicar = () => {
            armazenados.delete(nome)
            resolve(true)
          }
          if (atrasarDelete) pendentes.push(aplicar)
          else aplicar()
        }),
    ),
  }
}

let storage

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem('authToken', 'token-da-conta-A')
  localStorage.setItem('refreshToken', 'refresh-da-conta-A')
  storage = cacheStorageFalso(['api-cache', CACHE_API_PUBLICA, PRECACHE_WORKBOX])
  vi.stubGlobal('caches', storage)
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('logout — limpeza de cache aguardada', () => {
  it('encerra a sessão local de forma síncrona, antes de qualquer I/O', async () => {
    const promessa = logout()
    // Sem await ainda: o storage já tem de estar limpo.
    expect(localStorage.getItem('authToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
    await promessa
  })

  it('só resolve depois que os caches de API foram destruídos', async () => {
    storage = cacheStorageFalso(['api-cache', CACHE_API_PUBLICA], {
      atrasarDelete: true,
    })
    vi.stubGlobal('caches', storage)

    let resolvido = false
    const promessa = logout().then(() => {
      resolvido = true
    })

    // Deletes ainda pendentes → logout NÃO pode ter resolvido.
    await Promise.resolve()
    expect(resolvido).toBe(false)
    expect(storage.armazenados.size).toBe(2)

    storage.liberarDeletes()
    await promessa

    expect(resolvido).toBe(true)
    expect([...storage.armazenados]).toEqual([])
  })

  it('destrói o namespace de API por completo', async () => {
    await logout()
    expect(storage.keys).toHaveBeenCalledTimes(1)
    expect(storage.delete).toHaveBeenCalledWith('api-cache')
    expect(storage.delete).toHaveBeenCalledWith(CACHE_API_PUBLICA)
    expect(storage.armazenados.has('api-cache')).toBe(false)
    expect(storage.armazenados.has(CACHE_API_PUBLICA)).toBe(false)
  })

  it('destrói defensivamente caches api-* deixados por versão anterior', async () => {
    // Mesmo padrão defensivo do activate (sw-purge-caches.js), para que os dois
    // pontos de purga não divirjam sobre o que é "cache de API".
    storage = cacheStorageFalso(['api-cache-v2', 'api_respostas', 'API-Cache'])
    vi.stubGlobal('caches', storage)
    await logout()
    expect([...storage.armazenados]).toEqual([])
  })

  it('revoga a sessão no servidor com o token que acabou de ser removido', async () => {
    await logout()
    expect(api.post).toHaveBeenCalledWith('/auth/logout', null, {
      headers: { Authorization: 'Bearer token-da-conta-A' },
    })
  })

  it('completa o logout mesmo quando a revogação no servidor falha', async () => {
    api.post.mockRejectedValueOnce({ response: { status: 500 } })
    await expect(logout()).resolves.toBeUndefined()
    expect(storage.armazenados.has('api-cache')).toBe(false)
  })
})

describe('logout — o que NÃO pode ser apagado', () => {
  it('preserva o precache do Workbox e demais caches fora do namespace de API', async () => {
    // O precache guarda só os globPatterns estáticos (js/css/html/ico/png/svg):
    // nunca resposta de API, nunca dado de usuário. Apagá-lo não protegeria nada
    // a mais e quebraria a navegação offline, que depende dele via
    // createHandlerBoundToURL('index.html').
    storage = cacheStorageFalso([
      'api-cache',
      PRECACHE_WORKBOX,
      'workbox-runtime',
      'google-fonts-stylesheets',
    ])
    vi.stubGlobal('caches', storage)

    await logout()

    expect(storage.delete).toHaveBeenCalledWith('api-cache')
    expect(storage.delete).not.toHaveBeenCalledWith(PRECACHE_WORKBOX)
    expect(storage.delete).not.toHaveBeenCalledWith('workbox-runtime')
    expect(storage.delete).not.toHaveBeenCalledWith('google-fonts-stylesheets')
    expect([...storage.armazenados]).toEqual([
      PRECACHE_WORKBOX,
      'workbox-runtime',
      'google-fonts-stylesheets',
    ])
  })
})

describe('limparCachesDoPwa — falha tratada, nunca propagada', () => {
  it('não rejeita quando a enumeração de caches falha', async () => {
    vi.stubGlobal('caches', {
      keys: vi.fn(async () => {
        throw new Error('Cache Storage indisponível')
      }),
      delete: vi.fn(),
    })
    await expect(limparCachesDoPwa()).resolves.toBeUndefined()
    expect(console.warn).toHaveBeenCalled()
  })

  it('não rejeita quando a exclusão de um cache específico falha', async () => {
    vi.stubGlobal('caches', {
      keys: vi.fn(async () => ['api-cache', 'api-legado-v0']),
      delete: vi.fn(async (nome) => {
        if (nome === 'api-cache') throw new Error('QuotaExceededError')
        return true
      }),
    })
    await expect(limparCachesDoPwa()).resolves.toBeUndefined()
    // A falha é registrada — silenciar seria repetir o defeito original.
    expect(console.warn).toHaveBeenCalled()
  })

  it('não trava a UI se o Cache Storage nunca responder (teto de tempo)', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('caches', {
      keys: vi.fn(() => new Promise(() => {})),
      delete: vi.fn(),
    })

    let resolvido = false
    const promessa = limparCachesDoPwa().then(() => {
      resolvido = true
    })

    await vi.advanceTimersByTimeAsync(TIMEOUT_LIMPEZA_CACHE_MS - 1)
    expect(resolvido).toBe(false)

    await vi.advanceTimersByTimeAsync(2)
    await promessa
    expect(resolvido).toBe(true)
    expect(console.warn).toHaveBeenCalled()
  })

  it('é inofensiva em ambiente sem Cache Storage', async () => {
    vi.stubGlobal('caches', undefined)
    await expect(limparCachesDoPwa()).resolves.toBeUndefined()
  })
})
