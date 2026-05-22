import { test, expect } from '@playwright/test'

const AUTH_STATE = 'e2e/.auth/user.json'
test.use({ storageState: AUTH_STATE })

test.describe('Página 404', () => {

  test('Cenário 1 — /rota-invalida mostra "Página não encontrada"', async ({ page }) => {
    await page.goto('/rota-que-nao-existe-xyzabc')
    await expect(page.getByText('Página não encontrada')).toBeVisible({ timeout: 8_000 })
  })

  test('Cenário 2 — Botão Voltar ao Dashboard redireciona para /dashboard', async ({ page }) => {
    await page.goto('/outra-rota-invalida-123')
    await page.getByRole('button', { name: /Voltar ao Dashboard/i }).click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8_000 })
  })
})
