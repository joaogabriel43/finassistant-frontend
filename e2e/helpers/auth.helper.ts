import { Page, request as playwrightRequest } from '@playwright/test'

// O global setup é carregado antes dos workers. Persistir o identificador no
// ambiente garante uma única credencial por execução, inclusive após restart
// de worker, conforme o mecanismo de compartilhamento documentado pelo Playwright.
const E2E_RUN_ID = process.env.PLAYWRIGHT_E2E_RUN_ID ?? `${Date.now()}-${process.pid}`
process.env.PLAYWRIGHT_E2E_RUN_ID = E2E_RUN_ID

export const TEST_USER_EMAIL = `e2e-${E2E_RUN_ID}@fortunai-test.com`
export const TEST_USER_PASSWORD = `E2ePass${E2E_RUN_ID}!`

const BACKEND_URL = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3333'

/**
 * Registra usuário de teste via API (não via UI — mais rápido).
 * Ignora conflito 409 (usuário já existe entre retries).
 */
export async function createTestUser(email: string, password: string): Promise<void> {
  const context = await playwrightRequest.newContext({ baseURL: BACKEND_URL })
  const response = await context.post('/api/auth/registrar', {
    data: { email, senha: password },
  })
  // 201 = criado, 409 = já existe — ambos são aceitáveis
  if (response.status() !== 201 && response.status() !== 409) {
    throw new Error(`Falha ao registrar usuário E2E: ${response.status()} ${await response.text()}`)
  }
  await context.dispose()
}

/**
 * Faz login via UI: navega para /login, preenche formulário e aguarda /dashboard.
 */
export async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login')
  await page.getByLabel('Endereço de Email').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  // Aguarda redirect — pode ir para /dashboard ou /questionario
  await page.waitForURL(/\/(dashboard|questionario)/, { timeout: 10_000 })
}

/**
 * Obtém JWT via API e retorna o token para uso em requisições autenticadas.
 */
export async function getAuthToken(email: string, password: string): Promise<string> {
  const context = await playwrightRequest.newContext({ baseURL: BACKEND_URL })
  const response = await context.post('/api/auth/login', {
    data: { username: email, password },
  })
  if (!response.ok()) {
    throw new Error(`Falha no login E2E: ${response.status()}`)
  }
  const body = await response.json()
  await context.dispose()
  return body.token
}
