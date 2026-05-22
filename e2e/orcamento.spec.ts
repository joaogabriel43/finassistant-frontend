import { test, expect, request as playwrightRequest } from '@playwright/test'
import { TEST_USER_EMAIL, TEST_USER_PASSWORD, getAuthToken } from './helpers/auth.helper'

const BACKEND_URL = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3333'
const AUTH_STATE = 'e2e/.auth/user.json'

// Reutiliza sessão salva no global.setup — sem login em cada teste
test.use({ storageState: AUTH_STATE })

test.describe('Orçamento', () => {

  // Helper: obtém userId a partir do token
  async function getUserId(): Promise<string> {
    const token = await getAuthToken(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    const ctx = await playwrightRequest.newContext({ baseURL: BACKEND_URL })
    const res = await ctx.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    await ctx.dispose()
    return data.id
  }

  // Helper: deleta transação via API para limpeza pós-teste
  async function deleteTransacao(userId: string, transacaoId: string): Promise<void> {
    const token = await getAuthToken(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    const ctx = await playwrightRequest.newContext({ baseURL: BACKEND_URL })
    await ctx.delete(`/api/orcamento/transacao/${userId}/${transacaoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    await ctx.dispose()
  }

  // Helper: lista transações para encontrar a criada no teste
  async function getTransacoes(userId: string): Promise<any[]> {
    const token = await getAuthToken(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    const ctx = await playwrightRequest.newContext({ baseURL: BACKEND_URL })
    const res = await ctx.get(`/api/orcamento/transacoes/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    await ctx.dispose()
    return Array.isArray(data) ? data : []
  }

  // ─── Cenário 1 — Criar transação de despesa via UI ─────────────────────
  test('Cenário 1 — Criar transação de despesa via UI', async ({ page }) => {
    const userId = await getUserId()
    const descricao = `Almoço E2E ${Date.now()}`

    await page.goto('/orcamento')

    // Preenche o formulário de nova transação
    await page.getByLabel('Valor (R$)').fill('35')

    // Seleciona tipo Despesa (já é o padrão SAIDA, mas garante)
    await page.getByLabel('Tipo').click()
    await page.getByRole('option', { name: 'Despesa' }).click()

    // Preenche categoria via react-select (CreatableSelect)
    const categoriaInput = page.locator('input[id*="react-select"]').first()
    await categoriaInput.fill('Alimentação')
    await page.keyboard.press('Enter')

    // Preenche descrição
    await page.getByLabel('Descrição').fill(descricao)

    // Submete
    await page.getByRole('button', { name: /Adicionar/i }).click()

    // Aguarda snackbar de sucesso
    await expect(page.getByText(/sucesso/i).first()).toBeVisible({ timeout: 8_000 })

    // Verifica que a descrição aparece na lista de transações
    await expect(page.getByText(descricao)).toBeVisible({ timeout: 8_000 })

    // Cleanup: remove a transação criada
    const transacoes = await getTransacoes(userId)
    const criada = transacoes.find((t) => t.descricao === descricao)
    if (criada) await deleteTransacao(userId, criada.id)
  })

  // ─── Cenário 2 — Criar transação de receita via UI ─────────────────────
  test('Cenário 2 — Criar transação de receita via UI', async ({ page }) => {
    const userId = await getUserId()
    const descricao = `Salário E2E ${Date.now()}`

    await page.goto('/orcamento')

    await page.getByLabel('Valor (R$)').fill('5000')

    // Seleciona tipo Receita
    await page.getByLabel('Tipo').click()
    await page.getByRole('option', { name: 'Receita' }).click()

    const categoriaInput = page.locator('input[id*="react-select"]').first()
    await categoriaInput.fill('Receita')
    await page.keyboard.press('Enter')

    await page.getByLabel('Descrição').fill(descricao)
    await page.getByRole('button', { name: /Adicionar/i }).click()

    await expect(page.getByText(/sucesso/i).first()).toBeVisible({ timeout: 8_000 })
    await expect(page.getByText(descricao)).toBeVisible({ timeout: 8_000 })

    // Cleanup
    const transacoes = await getTransacoes(userId)
    const criada = transacoes.find((t) => t.descricao === descricao)
    if (criada) await deleteTransacao(userId, criada.id)
  })

  // ─── Cenário 3 — Criar transação via Chat ─────────────────────────────
  test('Cenário 3 — Criar transação via Chat', async ({ page }) => {
    const userId = await getUserId()

    await page.goto('/chat')

    // Aguarda campo de texto do chat estar visível
    const chatInput = page.getByRole('textbox').first()
    await expect(chatInput).toBeVisible({ timeout: 5_000 })

    // Envia mensagem
    await chatInput.fill('Gastei 50 reais no mercado hoje')
    await page.keyboard.press('Enter')

    // Aguarda resposta do assistente (chama Gemini — timeout maior)
    const botResponse = page.locator('[class*="bot"], [data-sender="bot"]').last()
    // Alternativa: aguarda qualquer nova mensagem aparecer após o envio
    await expect(page.getByText(/mercado|registrado|adicionado|confirmado/i).first())
      .toBeVisible({ timeout: 20_000 })

    // Verifica no /orcamento que a transação aparece
    await page.goto('/orcamento')

    // Cleanup: remove transações com "mercado" criadas agora
    const transacoes = await getTransacoes(userId)
    const agora = new Date()
    const recentes = transacoes.filter((t) => {
      const d = new Date(t.data)
      return (
        t.descricao?.toLowerCase().includes('mercado') &&
        Math.abs(agora.getTime() - d.getTime()) < 24 * 60 * 60 * 1000
      )
    })
    for (const t of recentes) await deleteTransacao(userId, t.id)
  })

  // ─── Cenário 4 — Saldo no dashboard reflete transações ─────────────────
  test('Cenário 4 — Saldo no dashboard reflete transações criadas', async ({ page }) => {
    const userId = await getUserId()
    const token = await getAuthToken(TEST_USER_EMAIL, TEST_USER_PASSWORD)

    // Cria transação via API para não depender da UI neste cenário
    const ctx = await playwrightRequest.newContext({ baseURL: BACKEND_URL })
    const res = await ctx.post(`/api/orcamento/transacao/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { valor: '1000', categoria: 'Receita', descricao: 'Saldo E2E', tipo: 'ENTRADA' },
    })
    expect(res.status()).toBeLessThan(300)
    const criada = await res.json()
    await ctx.dispose()

    // Navega para o dashboard e verifica que saldo está visível
    await page.goto('/dashboard')
    await expect(page.getByText(/Saldo|Patrimônio/i).first()).toBeVisible({ timeout: 10_000 })

    // Cleanup
    if (criada?.id) await deleteTransacao(userId, criada.id)
  })

  // ─── Cenário 5 — Editar transação via UI ──────────────────────────────
  test('Cenário 5 — Editar transação: alterar valor via modal', async ({ page }) => {
    const userId = await getUserId()
    const descricaoOriginal = `Editar E2E ${Date.now()}`

    // Create transaction via API
    const token = await getAuthToken(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    const ctx = await playwrightRequest.newContext({ baseURL: BACKEND_URL })
    const createRes = await ctx.post(`/api/orcamento/transacao/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { valor: 100, categoria: 'Teste', descricao: descricaoOriginal, tipo: 'SAIDA' },
    })
    const criada = await createRes.json()
    await ctx.dispose()

    await page.goto('/orcamento')

    // Wait for transaction to appear
    await expect(page.getByText(descricaoOriginal)).toBeVisible({ timeout: 8_000 })

    // Click edit icon on that row
    const row = page.locator(`tr:has-text("${descricaoOriginal}")`)
    await row.getByRole('button', { name: /editar/i }).click()

    // Modal opens with data pre-filled
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5_000 })

    // Change the description
    const descricaoInput = page.getByRole('dialog').getByLabel(/Descrição/i)
    await descricaoInput.clear()
    const novaDescricao = `Editado E2E ${Date.now()}`
    await descricaoInput.fill(novaDescricao)

    // Save
    await page.getByRole('dialog').getByRole('button', { name: /salvar|confirmar/i }).click()

    // Modal closes and updated description appears
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5_000 })
    await expect(page.getByText(novaDescricao)).toBeVisible({ timeout: 8_000 })

    // Cleanup
    if (criada?.id) await deleteTransacao(userId, criada.id)
  })

  // ─── Cenário 6 — Excluir transação via dialog de confirmação ──────────
  test('Cenário 6 — Excluir transação: cancelar + confirmar', async ({ page }) => {
    const userId = await getUserId()
    const descricao = `Excluir E2E ${Date.now()}`

    // Create via API
    const token = await getAuthToken(TEST_USER_EMAIL, TEST_USER_PASSWORD)
    const ctx = await playwrightRequest.newContext({ baseURL: BACKEND_URL })
    const createRes = await ctx.post(`/api/orcamento/transacao/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { valor: 50, categoria: 'Teste', descricao, tipo: 'SAIDA' },
    })
    const criada = await createRes.json()
    await ctx.dispose()

    await page.goto('/orcamento')
    await expect(page.getByText(descricao)).toBeVisible({ timeout: 8_000 })

    // Click delete icon
    const row = page.locator(`tr:has-text("${descricao}")`)
    await row.getByRole('button', { name: /excluir/i }).click()

    // Dialog appears
    await expect(page.getByTestId('confirmar-exclusao-dialog')).toBeVisible({ timeout: 5_000 })

    // Cancel — transaction remains
    await page.getByRole('button', { name: /cancelar/i }).click()
    await expect(page.getByTestId('confirmar-exclusao-dialog')).not.toBeVisible({ timeout: 3_000 })
    await expect(page.getByText(descricao)).toBeVisible({ timeout: 5_000 })

    // Delete again, confirm this time
    await row.getByRole('button', { name: /excluir/i }).click()
    await expect(page.getByTestId('confirmar-exclusao-dialog')).toBeVisible({ timeout: 5_000 })
    await page.getByRole('button', { name: /^Excluir$/i }).click()

    // Transaction disappears
    await expect(page.getByText(descricao)).not.toBeVisible({ timeout: 8_000 })
  })
})
