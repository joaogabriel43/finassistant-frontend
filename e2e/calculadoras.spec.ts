import { test, expect } from '@playwright/test'

const AUTH_STATE = 'e2e/.auth/user.json'

test.use({ storageState: AUTH_STATE })

test.describe('Calculadoras Financeiras', () => {

  // ─── Cenário 1 — FIRE Calculator ──────────────────────────────────────
  test('Cenário 1 — FIRE Calculator: 3 cards de resultado', async ({ page }) => {
    await page.goto('/calculadoras')

    // Garante que a aba "Independência Financeira" está ativa (é a primeira)
    await expect(page.getByRole('tab', { name: /Independência Financeira/i })).toBeVisible({ timeout: 8_000 })

    // Preenche os campos do FIRE Calculator
    await page.getByLabel('Patrimônio Atual').fill('10000')
    await page.getByLabel('Aporte Mensal').fill('1000')
    await page.getByLabel('Despesa Mensal').fill('3000')
    await page.getByLabel('Idade Atual').fill('25')

    // Clica em Calcular
    await page.getByRole('button', { name: /Calcular minha independência/i }).click()

    // Aguarda os 3 cards de resultado (Conservador, Moderado, Arrojado)
    await expect(page.getByText('Conservador').first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Moderado').first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Arrojado').first()).toBeVisible({ timeout: 10_000 })

    // Cada card deve ter anos e/ou idade de aposentadoria
    await expect(page.getByText(/anos|idade/i).first()).toBeVisible({ timeout: 5_000 })
  })

  // ─── Cenário 2 — Juros Compostos com dados reais ──────────────────────
  test('Cenário 2 — Juros Compostos: toggle dados reais e gráfico', async ({ page }) => {
    await page.goto('/calculadoras')

    // Navega para a aba "Juros Compostos"
    await page.getByRole('tab', { name: /Juros Compostos/i }).click()
    await expect(page.getByText(/Juros Compostos/i).first()).toBeVisible({ timeout: 5_000 })

    // Ativa o toggle "Usar dados reais do meu portfólio"
    const toggle = page.getByRole('checkbox', { name: /dados reais|portfólio real/i })
    await toggle.check()
    await expect(toggle).toBeChecked()

    // Preenche campos manuais para garantir que o cálculo funciona
    // (pode ser que dados reais preencham automaticamente, mas garantimos um valor)
    const patrimonioField = page.getByLabel(/patrimônio.*(inicial)?/i).first()
    if (await patrimonioField.isVisible()) {
      const currentVal = await patrimonioField.inputValue()
      if (!currentVal) await patrimonioField.fill('5000')
    }

    const aporteField = page.getByLabel(/aporte mensal/i).first()
    if (await aporteField.isVisible()) {
      const currentVal = await aporteField.inputValue()
      if (!currentVal) await aporteField.fill('500')
    }

    // Clica em Calcular
    await page.getByRole('button', { name: /calcular/i }).click()

    // Aguarda gráfico de área (Recharts renderiza um SVG)
    await expect(page.locator('svg').first()).toBeVisible({ timeout: 10_000 })

    // Verifica que os 3 cenários aparecem
    await expect(page.getByText('Conservador').first()).toBeVisible({ timeout: 8_000 })
  })

  // ─── Cenário 3 — Calculadora de Aposentadoria ─────────────────────────
  test('Cenário 3 — Calculadora de Aposentadoria: IPCA chip e cards', async ({ page }) => {
    await page.goto('/calculadoras')

    // Navega para a aba "Aposentadoria"
    await page.getByRole('tab', { name: /Aposentadoria/i }).click()
    await expect(page.getByText(/Aposentadoria/i).first()).toBeVisible({ timeout: 5_000 })

    // Chip IPCA visível antes mesmo do cálculo
    await expect(page.getByText(/4[,.]8|IPCA/i).first()).toBeVisible({ timeout: 5_000 })

    // Preenche renda desejada e aporte (sliders já têm defaults)
    await page.getByLabel(/renda mensal desejada/i).fill('5000')
    await page.getByLabel(/aporte mensal/i).first().fill('1500')

    // Clica em Calcular
    await page.getByRole('button', { name: /calcular/i }).click()

    // Aguarda os 3 cards de resultado
    await expect(page.getByText('Conservador').first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Moderado').first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Arrojado').first()).toBeVisible({ timeout: 10_000 })

    // Verifica suficiente/insuficiente por cenário
    const suficienteOuNao = page.getByText(/suficiente|insuficiente/i).first()
    await expect(suficienteOuNao).toBeVisible({ timeout: 8_000 })
  })
})
