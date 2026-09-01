/* eslint-env serviceworker */
/*
 * Purga de caches legados do PWA — F-01.
 *
 * ATENÇÃO: este arquivo roda DENTRO do escopo do Service Worker, carregado por
 * `importScripts()` (opção `workbox.importScripts` em vite.config.js). Não é um
 * módulo ESM: nada de `import`/`export` aqui.
 *
 * POR QUE EXISTE: remover a regra genérica de cache do `/api/**` protege as
 * instalações futuras, mas não faz nada pelos navegadores que JÁ têm um Service
 * Worker antigo instalado e um Cache Storage populado com respostas
 * autenticadas. Sem esta purga, esses usuários continuariam carregando o
 * 'api-cache' antigo — inerte para novas gravações, mas ainda cheio de dados de
 * quem usou o app naquele navegador. O `activate` é o gancho certo: dispara
 * quando a nova versão do SW assume o controle.
 *
 * Os nomes abaixo espelham `src/pwa/apiRuntimeCaching.js`; há teste travando a
 * sincronia entre os dois arquivos (apiRuntimeCaching.test.js não pode importar
 * este, por não ser ESM).
 */

var CACHE_API_PUBLICA = 'api-publica-cache-v1'
var CACHES_LEGADOS = ['api-cache']

/**
 * Um cache deve ser destruído no activate?
 *
 * Allowlist na prática: preserva o cache público atual e os caches internos do
 * Workbox (`workbox-precache-*`), destrói o resto do namespace de API — os
 * nomes explicitamente conhecidos e, defensivamente, qualquer `api-*`/`api_*`
 * deixado por uma versão anterior.
 */
function ehCacheLegadoDeApi(nome) {
  if (nome === CACHE_API_PUBLICA) return false
  if (CACHES_LEGADOS.indexOf(nome) !== -1) return true
  return /^api[-_]/i.test(nome)
}

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (nomes) {
        return Promise.all(
          nomes.filter(ehCacheLegadoDeApi).map(function (nome) {
            return caches.delete(nome)
          }),
        )
      })
      .catch(function () {
        // Purga é best-effort: falhar aqui não pode impedir a ativação do SW
        // novo, que é justamente o que para de gravar dado autenticado.
      }),
  )
})
