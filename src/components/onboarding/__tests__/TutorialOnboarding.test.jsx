import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ThemeProvider } from '@mui/material/styles'
import theme from '../../../theme'

// ── Mocks ────────────────────────────────────────────────────────────────────

/**
 * Mock do AuthContext — controla user.tutorialConcluido por teste.
 * Valor padrão: tutorialConcluido = false (tutorial pendente).
 */
const mockUseAuth = vi.fn(() => ({
  user: { id: 'user-1', email: 'test@test.com', tutorialConcluido: false },
}))

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

/**
 * Mock do useTutorial — controla estado do tutorial por teste.
 * Valores padrão: visible=false, step=0.
 */
const mockUseTutorial = vi.fn(() => ({
  visible: false,
  step: 0,
  totalSteps: 5,
  concluirTutorial: vi.fn(),
  pularTutorial: vi.fn(),
  proximoStep: vi.fn(),
  voltarStep: vi.fn(),
}))

vi.mock('../../../hooks/useTutorial', () => ({
  default: () => mockUseTutorial(),
}))

import TutorialOnboarding from '../TutorialOnboarding'

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  // Reset defaults: tutorial pendente, overlay não visível
  mockUseAuth.mockReturnValue({
    user: { id: 'user-1', email: 'test@test.com', tutorialConcluido: false },
  })
  mockUseTutorial.mockReturnValue({
    visible: false,
    step: 0,
    totalSteps: 5,
    concluirTutorial: vi.fn(),
    pularTutorial: vi.fn(),
    proximoStep: vi.fn(),
    voltarStep: vi.fn(),
  })
})

// ── Testes ───────────────────────────────────────────────────────────────────

describe('TutorialOnboarding — RED phase (stub renders null)', () => {

  /**
   * RED PASS — o stub renderiza null; com tutorialConcluido=true também seria null.
   * Serve como regression guard: quando a implementação real existir, deve
   * continuar não renderizando o backdrop quando o tutorial já foi concluído.
   */
  it('nao renderiza backdrop quando tutorialConcluido === true', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@test.com', tutorialConcluido: true },
    })
    mockUseTutorial.mockReturnValue({
      visible: false,
      step: 0,
      totalSteps: 5,
      concluirTutorial: vi.fn(),
      pularTutorial: vi.fn(),
      proximoStep: vi.fn(),
      voltarStep: vi.fn(),
    })

    render(<ThemeProvider theme={theme}><TutorialOnboarding /></ThemeProvider>)

    // backdrop/overlay não deve existir
    expect(document.querySelector('[data-testid="tutorial-backdrop"]')).toBeNull()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  /**
   * RED FAIL — o stub renderiza null, mas esperamos backdrop presente.
   * Fase GREEN: renderizar overlay quando visible=true e tutorialConcluido=false.
   */
  it('renderiza backdrop quando tutorialConcluido === false e visible === true', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@test.com', tutorialConcluido: false },
    })
    mockUseTutorial.mockReturnValue({
      visible: true,
      step: 0,
      totalSteps: 5,
      concluirTutorial: vi.fn(),
      pularTutorial: vi.fn(),
      proximoStep: vi.fn(),
      voltarStep: vi.fn(),
    })

    render(<ThemeProvider theme={theme}><TutorialOnboarding /></ThemeProvider>)

    // Verifica que o overlay/tooltip está visível quando visible=true
    // Aceita: backdrop legado, dialog, textos, ou o novo tooltip
    const backdrop =
      document.querySelector('[data-testid="tutorial-backdrop"]') ||
      document.querySelector('[role="dialog"]') ||
      screen.queryByText(/bem-vindo/i) ||
      screen.queryByText(/tutorial/i) ||
      document.querySelector('[data-testid="tutorial-tooltip"]')
    expect(backdrop).not.toBeNull()
  })

  /**
   * RED FAIL — o stub renderiza null, então o botão "Próximo" não existe.
   * Fase GREEN: clicar em "Próximo" deve chamar proximoStep do hook.
   */
  it('clique em Proximo chama proximoStep do hook', () => {
    const proximoStepMock = vi.fn()
    mockUseTutorial.mockReturnValue({
      visible: true,
      step: 0,
      totalSteps: 5,
      concluirTutorial: vi.fn(),
      pularTutorial: vi.fn(),
      proximoStep: proximoStepMock,
      voltarStep: vi.fn(),
    })

    render(<ThemeProvider theme={theme}><TutorialOnboarding /></ThemeProvider>)

    // RED: botão não existe → getByRole lança → teste falha
    const botaoProximo = screen.queryByRole('button', { name: /próximo|proximo/i })
    expect(botaoProximo).not.toBeNull()
    fireEvent.click(botaoProximo)
    expect(proximoStepMock).toHaveBeenCalledTimes(1)
  })

  /**
   * RED FAIL — o stub renderiza null, então o botão "Começar" não existe.
   * Fase GREEN: no último step (step === totalSteps - 1) exibir "Começar"
   * que chama concluirTutorial ao ser clicado.
   */
  it('clique em Comecar no ultimo step chama concluirTutorial', () => {
    const concluirMock = vi.fn()
    mockUseTutorial.mockReturnValue({
      visible: true,
      step: 4, // último step (totalSteps - 1)
      totalSteps: 5,
      concluirTutorial: concluirMock,
      pularTutorial: vi.fn(),
      proximoStep: vi.fn(),
      voltarStep: vi.fn(),
    })

    render(<ThemeProvider theme={theme}><TutorialOnboarding /></ThemeProvider>)

    // RED: botão não existe → queryByRole retorna null → expect falha
    const botaoComecar = screen.queryByRole('button', { name: /começar|comecar/i })
    expect(botaoComecar).not.toBeNull()
    fireEvent.click(botaoComecar)
    expect(concluirMock).toHaveBeenCalledTimes(1)
  })

  /**
   * RED FAIL — o stub renderiza null, então o botão "Pular" não existe.
   * Fase GREEN: exibir botão "Pular" em qualquer step e chamar pularTutorial.
   */
  it('clique em Pular no step 1 chama pularTutorial', () => {
    const pularMock = vi.fn()
    mockUseTutorial.mockReturnValue({
      visible: true,
      step: 0,
      totalSteps: 5,
      concluirTutorial: vi.fn(),
      pularTutorial: pularMock,
      proximoStep: vi.fn(),
      voltarStep: vi.fn(),
    })

    render(<ThemeProvider theme={theme}><TutorialOnboarding /></ThemeProvider>)

    // RED: botão não existe → queryByRole retorna null → expect falha
    const botaoPular = screen.queryByRole('button', { name: /pular/i })
    expect(botaoPular).not.toBeNull()
    fireEvent.click(botaoPular)
    expect(pularMock).toHaveBeenCalledTimes(1)
  })

  /**
   * RED PASS — após o tutorial ser concluído (visible=false), o overlay desaparece.
   * O stub já renderiza null, então backdrop já não existe → este teste passa
   * e serve como regression guard para o estado pós-conclusão.
   */
  it('overlay desaparece apos conclusao do tutorial (visible === false)', () => {
    mockUseTutorial.mockReturnValue({
      visible: false,
      step: 0,
      totalSteps: 5,
      concluirTutorial: vi.fn(),
      pularTutorial: vi.fn(),
      proximoStep: vi.fn(),
      voltarStep: vi.fn(),
    })

    render(<ThemeProvider theme={theme}><TutorialOnboarding /></ThemeProvider>)

    // Nenhum backdrop deve existir após conclusão
    expect(document.querySelector('[data-testid="tutorial-backdrop"]')).toBeNull()
    expect(screen.queryByRole('button', { name: /próximo|proximo/i })).toBeNull()
  })

  /**
   * Voltar button must NOT appear on step 0 (first step).
   */
  it('nao exibe botao Voltar no step 1', () => {
    mockUseTutorial.mockReturnValue({
      visible: true,
      step: 0,
      totalSteps: 5,
      currentStep: undefined,
      concluirTutorial: vi.fn(),
      pularTutorial: vi.fn(),
      proximoStep: vi.fn(),
      voltarStep: vi.fn(),
    })

    render(<ThemeProvider theme={theme}><TutorialOnboarding /></ThemeProvider>)
    expect(screen.queryByRole('button', { name: /voltar/i })).not.toBeInTheDocument()
  })

  /**
   * Voltar button must be visible on step 2+ and call voltarStep when clicked.
   */
  it('clique em Voltar no step 2 chama voltarStep', () => {
    const voltarStep = vi.fn()
    mockUseTutorial.mockReturnValue({
      visible: true,
      step: 1,
      totalSteps: 5,
      currentStep: undefined,
      concluirTutorial: vi.fn(),
      pularTutorial: vi.fn(),
      proximoStep: vi.fn(),
      voltarStep,
    })

    render(<ThemeProvider theme={theme}><TutorialOnboarding /></ThemeProvider>)
    const botaoVoltar = screen.getByRole('button', { name: /voltar/i })
    expect(botaoVoltar).toBeInTheDocument()
    fireEvent.click(botaoVoltar)
    expect(voltarStep).toHaveBeenCalledTimes(1)
  })
})

// ── Comportamento modal ──────────────────────────────────────────────────────

/**
 * Contexto: o commit 09fd706 adicionou `pointerEvents: 'none'` nos painéis do
 * scrim para destravar um E2E em que o clique em "Próximo"/"Pular" era
 * interceptado. Isso mascarou a causa raiz e quebrou a semântica de modal — com
 * o scrim transparente a cliques, o app inteiro atrás do tutorial ficava
 * clicável.
 *
 * Causa raiz: `tooltipStyle` nasce `{}` e o effect que o preenche tem um
 * early-return quando `targetRect === null`. Sem `position`, o <Paper> renderiza
 * `position: static`, e `z-index` é ignorado em elemento estático — o tooltip
 * fica ATRÁS do overlay (fixed, z-index 10000).
 */
describe('TutorialOnboarding — comportamento modal', () => {
  const stepFalso = {
    target: '[data-tutorial="inexistente-no-dom"]',
    title: 'Fale com seu assistente',
    description: 'Descrição do passo.',
    placement: 'right',
  }

  const montarTutorialVisivel = (overrides = {}) => {
    const hook = {
      visible: true,
      step: 0,
      totalSteps: 5,
      currentStep: stepFalso,
      concluirTutorial: vi.fn(),
      pularTutorial: vi.fn(),
      proximoStep: vi.fn(),
      voltarStep: vi.fn(),
      ...overrides,
    }
    mockUseTutorial.mockReturnValue(hook)
    render(<ThemeProvider theme={theme}><TutorialOnboarding /></ThemeProvider>)
    return hook
  }

  // Os painéis do scrim são os únicos elementos que aplicam backdrop-filter
  // inline — serve de seletor estável sem depender de testid de produção.
  const scrims = () =>
    Array.from(document.querySelectorAll('div')).filter((d) => d.style.backdropFilter)

  it('mantem o tooltip em position fixed mesmo sem targetRect (alvo ausente do DOM)', () => {
    montarTutorialVisivel()

    const tooltip = document.querySelector('[data-testid="tutorial-tooltip"]')
    expect(tooltip).not.toBeNull()
    // RED: sem targetRect o effect faz early-return, tooltipStyle continua {}
    // e o Paper cai em position: static — z-index ignorado, tooltip sob o scrim.
    expect(window.getComputedStyle(tooltip).position).toBe('fixed')
  })

  it('o scrim bloqueia cliques no app por tras (nao usa pointerEvents none)', () => {
    montarTutorialVisivel()

    const paineis = scrims()
    expect(paineis.length).toBeGreaterThan(0)
    // RED: 09fd706 marcou todos os painéis com pointerEvents: 'none'.
    paineis.forEach((painel) => {
      expect(painel.style.pointerEvents).not.toBe('none')
    })
  })

  it('expoe o tooltip como dialogo modal acessivel', () => {
    montarTutorialVisivel()

    const dialogo = screen.getByRole('dialog')
    expect(dialogo).toBe(document.querySelector('[data-testid="tutorial-tooltip"]'))
    expect(dialogo).toHaveAttribute('aria-modal', 'true')
    expect(dialogo).toHaveAccessibleName(stepFalso.title)
  })

  it('move o foco para dentro do dialogo ao abrir', () => {
    montarTutorialVisivel()

    const dialogo = screen.getByRole('dialog')
    expect(dialogo.contains(document.activeElement)).toBe(true)
  })

  it('Escape encerra o tutorial chamando pularTutorial', () => {
    const { pularTutorial } = montarTutorialVisivel()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(pularTutorial).toHaveBeenCalledTimes(1)
  })

  it('prende o foco: Tab no ultimo botao volta para o primeiro', () => {
    montarTutorialVisivel()

    const dialogo = screen.getByRole('dialog')
    const focaveis = Array.from(dialogo.querySelectorAll('button'))
    expect(focaveis.length).toBeGreaterThan(1)

    const primeiro = focaveis[0]
    const ultimo = focaveis[focaveis.length - 1]

    ultimo.focus()
    fireEvent.keyDown(ultimo, { key: 'Tab' })
    expect(document.activeElement).toBe(primeiro)

    fireEvent.keyDown(primeiro, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(ultimo)
  })

  it('nao intercepta teclado quando o tutorial esta invisivel', () => {
    const pularTutorial = vi.fn()
    mockUseTutorial.mockReturnValue({
      visible: false,
      step: 0,
      totalSteps: 5,
      currentStep: stepFalso,
      concluirTutorial: vi.fn(),
      pularTutorial,
      proximoStep: vi.fn(),
      voltarStep: vi.fn(),
    })

    render(<ThemeProvider theme={theme}><TutorialOnboarding /></ThemeProvider>)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(pularTutorial).not.toHaveBeenCalled()
  })
})
