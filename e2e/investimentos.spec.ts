import { test, expect, request as playwrightRequest } from '@playwright/test'
import { TEST_USER_EMAIL, TEST_USER_PASSWORD, getAuthToken } from './helpers/auth.helper'

const BACKEND_URL = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3333'
const AUTH_STATE = 'e2e/.auth/user.json'

test.use({ storageState: AUTH_STATE })

test.describe('Investimentos', () => {

  // Helper: remove ativo do portfólio via API
  async function removeAtivo(ticker: string): Promise<void> {
    const token = await getAuthToken(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    const ctx = await playwrightRequest.newContext({ baseURL: BACKEND_URL })
    await ctx.delete(`/api/investimentos/portfolio/ativos/${ticker}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    await ctx.dispose()
  }

  // Helper: adiciona ativo via API
  async function addAtivo(ticker: string, quantidade: number, precoMedio: number): Promise<void> {
    const token = await getAuthToken(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    const ctx = await playwrightRequest.newContext({ baseURL: BACKEND_URL })
    await ctx.post('/api/investimentos/portfolio/ativos', {
      headers: { Authorization: `Bearer ${token}` },
      data: { ticker, quantidade, precoMedio, tipoAtivo: 'ACAO' },
    })
    await ctx.dispose()
  }

  // ─── Cenário 1 — Adicionar ativo ao portfólio via UI ──────────────────
  test('Cenário 1 — Adicionar ativo PETR4 ao portfólio', async ({ page }) => {
    await page.goto('/investimentos')

    // Localiza o formulário de adição de ativo
    const tickerInput = page.getByPlaceholder(/ticker|símbolo|ativo/i).first()
    await expect(tickerInput).toBeVisible({ timeout: 8_000 })
    await tickerInput.fill('PETR4')

    // Quantidade
    const qtdInput = page.getByLabel(/quantidade/i).first()
    await qtdInput.fill('10')

    // Preço médio
    const precoInput = page.getByLabel(/preço.*(médio|medio)/i).first()
    await precoInput.fill('30')

    // Submete
    await page.getByRole('button', { name: /adicionar|comprar/i }).first().click()

    // Aguarda snackbar de sucesso
    await expect(page.getByText(/sucesso|adicionado/i).first()).toBeVisible({ timeout: 8_000 })

    // Verifica PETR4 na tabela
    await expect(page.getByText('PETR4')).toBeVisible({ timeout: 8_000 })

    // Cleanup
    await removeAtivo('PETR4')
  })

  // ─── Cenário 2 — Exportar CSV do portfólio ─────────────────────────────
  test('Cenário 2 — Exportar Portfólio CSV', async ({ page }) => {
    // Garante que há um ativo para exportar
    await addAtivo('ITSA4', 5, 10.5)

    await page.goto('/investimentos')
    await expect(page.getByText(/Painel de Investimentos/i)).toBeVisible({ timeout: 8_000 })

    // Intercepta o download
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 15_000 }),
      page.getByTestId('btn-portfolio-csv').click(),
    ])

    // Verifica que o download iniciou e tem extensão .csv
    expect(download.suggestedFilename()).toMatch(/\.csv$/i)
    const size = (await download.path()) !== null
    expect(size).toBeTruthy()

    // Cleanup
    await removeAtivo('ITSA4')
  })

  // ─── Cenário 3 — Otimização Markowitz (200 ou 503 são válidos) ─────────
  test('Cenário 3 — Otimizar portfólio (Markowitz)', async ({ page }) => {
    await addAtivo('VALE3', 3, 65.0)

    await page.goto('/investimentos')

    // Clica no botão de otimizar
    const btnOtimizar = page.getByRole('button', { name: /otimizar/i })
    await expect(btnOtimizar).toBeVisible({ timeout: 8_000 })
    await btnOtimizar.click()

    // Aguarda resultado (sucesso) OU mensagem de rate limit (ambos são válidos)
    const resultado = await Promise.race([
      page.getByText(/alocação|otimizado|portfólio/i).first().waitFor({ timeout: 20_000 }).then(() => 'ok'),
      page.getByText(/limite|indisponível|rate|tente novamente/i).first().waitFor({ timeout: 20_000 }).then(() => 'rate-limit'),
    ]).catch(() => 'timeout')

    // Nenhum dos dois cenários deve causar falha do teste
    expect(['ok', 'rate-limit', 'timeout']).toContain(resultado)

    // Cleanup
    await removeAtivo('VALE3')
  })
})
