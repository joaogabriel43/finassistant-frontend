import { defineConfig } from '@playwright/test'

/**
 * Config DEDICADO aos smoke tests contra ambiente REAL (produção/staging).
 *
 * Diferente de `playwright.config.ts` (usado pelo job `e2e` contra o backend
 * efêmero do CI), este config é ESTRITAMENTE READ-ONLY. Três omissões são
 * deliberadas e não devem ser "corrigidas":
 *
 *   1. SEM `globalSetup` — o setup do config principal registra um usuário
 *      novo (`e2e-<Date.now()>-<pid>@fortunai-test.com`), faz login, marca o
 *      tutorial como concluído e grava um consentimento LGPD. Contra o backend
 *      efêmero do CI isso é inofensivo; contra produção, cria um titular de
 *      dados sintético por execução, sem base legal para existir.
 *   2. SEM `webServer` — o smoke roda contra uma URL já publicada. Subir um
 *      vite dev local só custaria até 120s de timeout irrelevante.
 *   3. SEM `storageState` — nenhum teste de `smoke.spec.ts` depende de estado
 *      de autenticação; todos criam contexto próprio ou usam rota pública.
 *      Além disso `e2e/.auth/` é gitignored, então o arquivo não existe em
 *      clone limpo e o Playwright falharia ao iniciar.
 *
 * `testMatch` restringe o escopo ao smoke mesmo se invocado sem argumento de
 * arquivo — defesa em profundidade contra rodar a suíte E2E completa (que
 * escreve dados) contra produção.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /smoke\.spec\.ts$/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html'], ['list']],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
})
