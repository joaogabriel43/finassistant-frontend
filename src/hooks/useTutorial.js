import { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'

const STEPS = [
  {
    target: '[data-tutorial="chat"]',
    title: 'Fale com seu assistente',
    description: 'Digite qualquer coisa: "gastei 50 reais no mercado" ou "comprei 20 ações de PETR4". O FortunAI entende linguagem natural em português.',
    placement: 'right',
  },
  {
    target: '[data-tutorial="orcamento"]',
    title: 'Acompanhe seus gastos',
    description: 'Todas as suas transações organizadas por categoria, com comparativo mensal e análise de anomalias automática.',
    placement: 'right',
  },
  {
    target: '[data-tutorial="investimentos"]',
    title: 'Seu portfólio em tempo real',
    description: 'Cotações ao vivo, rentabilidade vs CDI/IBOV e otimização de carteira com o modelo de Markowitz.',
    placement: 'right',
  },
  {
    target: '[data-tutorial="calculadoras"]',
    title: 'Planeje seu futuro',
    description: 'Calcule quando alcança independência financeira, simule juros compostos e projete sua aposentadoria — tudo integrado com seus dados reais.',
    placement: 'right',
  },
  {
    target: '[data-tutorial="patrimonio"]',
    title: 'Tudo em um só lugar',
    description: 'Seu patrimônio, score de saúde financeira e composição do portfólio atualizados em tempo real.',
    placement: 'bottom',
  },
]

const useTutorial = () => {
  const { user, updateUser } = useAuth()
  const [step, setStep] = useState(0)

  const visible = !!(user && user.tutorialConcluido === false)

  const _finalizar = useCallback(async () => {
    try {
      await api.patch('/usuario/tutorial-concluido')
    } catch (e) {
      // best-effort
    } finally {
      if (updateUser) updateUser({ tutorialConcluido: true })
    }
  }, [updateUser])

  const concluirTutorial = useCallback(async () => {
    await _finalizar()
  }, [_finalizar])

  const pularTutorial = useCallback(async () => {
    await _finalizar()
  }, [_finalizar])

  const proximoStep = useCallback(() => {
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }, [])

  return {
    visible,
    step,
    totalSteps: STEPS.length,
    steps: STEPS,
    currentStep: STEPS[step],
    concluirTutorial,
    pularTutorial,
    proximoStep,
  }
}

export default useTutorial
export { STEPS }
