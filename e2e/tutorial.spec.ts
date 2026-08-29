import { test, expect, request as playwrightRequest } from '@playwright/test'

const BACKEND_URL = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3333'

// These tests create FRESH users — no storageState — to ensure tutorial appears
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Tutorial de Onboarding', () => {

  async function registrarNovoUsuario(): Promise<{ email: string; senha: string; token: string }> {
    const ts = Date.now()
    const email = `tutorial-${ts}@fortunai-test.com`
    const senha = `TutTest${ts}!`
    const ctx = await playwrightRequest.newContext({ baseURL: BACKEND_URL })
    await ctx.post('/api/auth/registrar', { data: { email, senha } })
    const loginRes = await ctx.post('/api/auth/login', {
      data: { username: email, password: senha },
    })
    const { token } = await loginRes.json()
    const consentimentoRes = await ctx.post('/api/conta/consentimento', {
      headers: { Authorization: `Bearer ${token}` },
      data: { versaoTermos: '1.0', versaoPrivacidade: '1.0' },
    })
    if (!consentimentoRes.ok()) {
      throw new Error(
        `Falha ao registrar consentimento do usuário de tutorial: ${consentimentoRes.status()} ${await consentimentoRes.text()}`,
      )
    }
    await ctx.dispose()
    return { email, senha, token }
  }

  async function responderQuestionario(page: any): Promise<void> {
    // If questionnaire appears, answer it to reach dashboard
    if (page.url().includes('questionario')) {
      // Click all available options (conservative answers)
      const buttons = page.getByRole('button')
      const firstOption = buttons.first()
      if (await firstOption.isVisible()) {
        // Navigate through questionnaire — accept whatever is shown
        await page.getByRole('button', { name: /próxima|calcular|finalizar|concluir/i })
          .first().click({ timeout: 3_000 }).catch(() => {})
      }
      await page.goto('/dashboard')
    }
  }

  // Cenário 1 — Tutorial aparece para novo usuário após questionário
  test('Cenário 1 — Tutorial aparece após questionário + concluir com Próximo+Começar', async ({ page }) => {
    const { email, senha } = await registrarNovoUsuario()

    // Login via UI
    await page.goto('/login')
    await page.getByLabel('Endereço de Email').fill(email)
    await page.locator('input[type="password"]').first().fill(senha)
    await page.getByRole('button', { name: 'Entrar' }).click()

    // May land on questionário first
    await page.waitForURL(/\/(dashboard|questionario)/, { timeout: 10_000 })
    await responderQuestionario(page)

    // On dashboard — tutorial tooltip should appear
    await expect(page.getByText(/Fale com seu assistente|Próximo|Começar/i).first())
      .toBeVisible({ timeout: 10_000 })

    // Click through all steps
    for (let i = 0; i < 4; i++) {
      const nextBtn = page.getByRole('button', { name: /Próximo/i })
      if (await nextBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await nextBtn.click()
        await page.waitForTimeout(400)
      }
    }

    // Click "Começar" on last step
    const comecarBtn = page.getByRole('button', { name: /Começar/i })
    await expect(comecarBtn).toBeVisible({ timeout: 5_000 })
    await comecarBtn.click()

    // Tutorial disappears
    await expect(page.getByRole('button', { name: /Começar/i })).not.toBeVisible({ timeout: 5_000 })
  })

  // Cenário 2 — Tutorial NÃO aparece novamente após reload
  test('Cenário 2 — Tutorial não reaparece após reload', async ({ page }) => {
    const { email, senha, token } = await registrarNovoUsuario()

    // Mark tutorial as done via API
    const ctx = await playwrightRequest.newContext({ baseURL: BACKEND_URL })
    await ctx.patch('/api/usuario/tutorial-concluido', {
      headers: { Authorization: `Bearer ${token}` },
    })
    await ctx.dispose()

    // Login and go to dashboard
    await page.goto('/login')
    await page.getByLabel('Endereço de Email').fill(email)
    await page.locator('input[type="password"]').first().fill(senha)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL(/\/(dashboard|questionario)/, { timeout: 10_000 })
    await responderQuestionario(page)
    await page.goto('/dashboard')

    // Tutorial should NOT appear
    await page.waitForTimeout(2_000) // give time for tutorial to potentially load
    await expect(page.getByRole('button', { name: /Próximo|Começar/i })).not.toBeVisible({ timeout: 3_000 })
  })

  // Cenário 3 — Clicar "Pular" no step 1 fecha o tutorial
  test('Cenário 3 — Pular tutorial no step 1 fecha overlay', async ({ page }) => {
    const { email, senha } = await registrarNovoUsuario()

    await page.goto('/login')
    await page.getByLabel('Endereço de Email').fill(email)
    await page.locator('input[type="password"]').first().fill(senha)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL(/\/(dashboard|questionario)/, { timeout: 10_000 })
    await responderQuestionario(page)

    // Tutorial should appear
    const pularBtn = page.getByRole('button', { name: /Pular/i })
    await expect(pularBtn).toBeVisible({ timeout: 10_000 })
    await pularBtn.click()

    // Tutorial disappears
    await expect(pularBtn).not.toBeVisible({ timeout: 5_000 })
  })
})
