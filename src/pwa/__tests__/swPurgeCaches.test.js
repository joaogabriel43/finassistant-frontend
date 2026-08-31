// @vitest-environment node
//
// Testa `public/sw-purge-caches.js` — o script que o Workbox carrega via
// importScripts dentro do Service Worker. Como ele NÃO é um módulo ESM (roda em
// escopo de SW), o teste lê o arquivo e o avalia com `self`/`caches` injetados.

import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL as NodeURL } from 'node:url'

import { CACHE_API_PUBLICA, CACHES_LEGADOS } from '../apiRuntimeCaching.js'

const CAMINHO_SCRIPT = fileURLToPath(
  new NodeURL('../../../public/sw-purge-caches.js', import.meta.url),
)
const TEXTO_SCRIPT = readFileSync(CAMINHO_SCRIPT, 'utf-8')

/** Avalia o script de SW e devolve o handler de `activate` que ele registrou. */
function carregarScript(cacheStorage) {
  const ouvintes = {}
  const selfFalso = {
    addEventListener: (tipo, handler) => {
      ouvintes[tipo] = handler
    },
  }
  new Function('self', 'caches', TEXTO_SCRIPT)(selfFalso, cacheStorage)
  return ouvintes
}

/** Dispara o `activate` e aguarda tudo que o handler passou ao waitUntil. */
async function dispararActivate(handler) {
  const pendentes = []
  handler({ waitUntil: (p) => pendentes.push(p) })
  await Promise.allSettled(pendentes)
}

function cacheStorageFalso(nomes) {
  const armazenados = new Set(nomes)
  return {
    armazenados,
    keys: async () => [...armazenados],
    delete: async (nome) => armazenados.delete(nome),
  }
}

const PRECACHE_WORKBOX = 'workbox-precache-v2-https://pondero.vercel.app/'

let ouvintes
let storage

beforeEach(() => {
  storage = cacheStorageFalso([
    'api-cache',
    CACHE_API_PUBLICA,
    PRECACHE_WORKBOX,
    'workbox-runtime',
  ])
  ouvintes = carregarScript(storage)
})

describe('sw-purge-caches — purga de cache legado no activate', () => {
  it('registra um handler de activate', () => {
    expect(typeof ouvintes.activate).toBe('function')
  })

  it("destrói o 'api-cache' legado, que guarda respostas autenticadas antigas", async () => {
    await dispararActivate(ouvintes.activate)
    expect(storage.armazenados.has('api-cache')).toBe(false)
  })

  it('preserva o cache público atual e o precache do Workbox', async () => {
    await dispararActivate(ouvintes.activate)
    expect(storage.armazenados.has(CACHE_API_PUBLICA)).toBe(true)
    // Apagar o precache quebraria o app inteiro offline.
    expect(storage.armazenados.has(PRECACHE_WORKBOX)).toBe(true)
    expect(storage.armazenados.has('workbox-runtime')).toBe(true)
  })

  it('destrói defensivamente qualquer cache api-* deixado por versão anterior', async () => {
    storage = cacheStorageFalso(['api-cache-v2', 'api_respostas', 'API-Cache'])
    ouvintes = carregarScript(storage)
    await dispararActivate(ouvintes.activate)
    expect([...storage.armazenados]).toEqual([])
  })

  it('não deixa a ativação falhar se a purga der erro', async () => {
    const quebrado = {
      keys: async () => {
        throw new Error('Cache Storage indisponível')
      },
      delete: async () => true,
    }
    const handlers = carregarScript(quebrado)
    await expect(dispararActivate(handlers.activate)).resolves.toBeUndefined()
  })
})

describe('sw-purge-caches — sincronia de nomes com apiRuntimeCaching.js', () => {
  // O script do SW não pode importar o módulo ESM, então os nomes são repetidos
  // nos dois arquivos. Estes testes impedem que eles divirjam em silêncio.
  it('usa o mesmo nome de cache público do módulo de config', () => {
    expect(TEXTO_SCRIPT).toContain(`'${CACHE_API_PUBLICA}'`)
  })

  it.each(CACHES_LEGADOS)('declara o cache legado %s para purga', (nome) => {
    expect(TEXTO_SCRIPT).toContain(`'${nome}'`)
  })
})
