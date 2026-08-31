/**
 * Prepara o escopo global mínimo de Service Worker.
 *
 * DEVE ser o PRIMEIRO import do arquivo de teste: `workbox-core/_private/logger`
 * toca `self.__WB_DISABLE_DEV_LOGS` já no carregamento do módulo, antes de
 * qualquer `beforeEach`. Em ambiente `node` não existe `self`, e o import do
 * Workbox explode com ReferenceError se este arquivo não rodar antes.
 */
globalThis.__WB_DISABLE_DEV_LOGS = true
globalThis.self = globalThis
globalThis.self.registration = { scope: 'https://pondero.vercel.app/' }
// O Router do Workbox resolve toda requisicao contra `location.href`.
globalThis.location = new URL('https://pondero.vercel.app/')

// `Strategy.handleAll` faz `options instanceof FetchEvent` para decidir como ler
// os argumentos. Em node o construtor não existe; o stub abaixo só precisa
// existir — nosso evento falso é um objeto simples e cai no branch correto.
if (typeof globalThis.FetchEvent === 'undefined') {
  globalThis.FetchEvent = class FetchEvent {}
}

// Em modo dev o Workbox assere `options.event instanceof ExtendableEvent`.
if (typeof globalThis.ExtendableEvent === 'undefined') {
  globalThis.ExtendableEvent = class ExtendableEvent {}
}
