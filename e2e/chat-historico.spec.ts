import { test, expect, request as playwrightRequest } from '@playwright/test'
import { TEST_USER_EMAIL, TEST_USER_PASSWORD, getAuthToken } from './helpers/auth.helper'

const BACKEND_URL = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3333'
const AUTH_STATE = 'e2e/.auth/user.json'

test.use({ storageState: AUTH_STATE })

test.describe('Histórico do Chat', () => {

  test('Cenário 1 — Mensagem enviada persiste após reload da página', async ({ page }) => {
    const mensagem = `Mensagem E2E ${Date.now()}`
    const token = await getAuthToken(TEST_USER_EMAIL, TEST_USER_PASSWORD)

    // Limpa histórico antes do teste para ter estado conhecido
    const ctx = await playwrightRequest.newContext({ baseURL: BACKEND_URL })
    await ctx.delete('/api/chat/historico', {
      headers: { Authorization: `Bearer ${token}` },
    })
    await ctx.dispose()

    await page.goto('/chat')

    // Send a message
    const chatInput = page.getByRole('textbox').first()
    await expect(chatInput).toBeVisible({ timeout: 8_000 })
    await chatInput.fill(mensagem)
    await page.keyboard.press('Enter')

    // Wait for assistant response
    await expect(page.getByText(/registrado|adicionado|confirmado|entendido|olá/i).first())
      .toBeVisible({ timeout: 20_000 })

    // Reload the page
    await page.reload()

    // Wait for history to load
    await page.waitForTimeout(2_000)

    // Message should still be visible (loaded from backend)
    const mensagemPersistida = page
      .getByTestId('chat-message-user')
      .filter({ hasText: mensagem })
    await expect(mensagemPersistida).toContainText(mensagem, { timeout: 8_000 })

    // Cleanup
    const cleanCtx = await playwrightRequest.newContext({ baseURL: BACKEND_URL })
    await cleanCtx.delete('/api/chat/historico', {
      headers: { Authorization: `Bearer ${token}` },
    })
    await cleanCtx.dispose()
  })
})
