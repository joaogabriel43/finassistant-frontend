import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Paper, Typography, Button } from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import useTutorial from '../../hooks/useTutorial'

const SCRIM = {
  background: 'rgba(0,0,0,0.75)',
  backdropFilter: 'blur(2px)',
}

const TITULO_ID = 'tutorial-onboarding-titulo'
const DESCRICAO_ID = 'tutorial-onboarding-descricao'

// O scrim é opaco a cliques de propósito: enquanto o tutorial está aberto, o
// app atrás dele não deve ser operável. O tooltip fica acima (z-index 10002).
const FullDarkOverlay = () => (
  <div style={{
    position: 'fixed', zIndex: 10000,
    top: 0, left: 0, right: 0, bottom: 0,
    ...SCRIM,
  }} />
)

const SpotlightOverlay = ({ targetRect, theme }) => {
  if (!targetRect) return <FullDarkOverlay />

  const { top, left, width, height } = targetRect
  const pad = 8

  return (
    <>
      {/* Top */}
      <div style={{
        position: 'fixed', zIndex: 10000,
        top: 0, left: 0, right: 0,
        height: Math.max(0, top - pad),
        ...SCRIM,
      }} />
      {/* Left */}
      <div style={{
        position: 'fixed', zIndex: 10000,
        top: top - pad, left: 0,
        width: Math.max(0, left - pad),
        height: height + pad * 2,
        ...SCRIM,
      }} />
      {/* Right */}
      <div style={{
        position: 'fixed', zIndex: 10000,
        top: top - pad,
        left: left + width + pad,
        right: 0,
        height: height + pad * 2,
        ...SCRIM,
      }} />
      {/* Bottom */}
      <div style={{
        position: 'fixed', zIndex: 10000,
        top: top + height + pad,
        left: 0, right: 0, bottom: 0,
        ...SCRIM,
      }} />
      {/* Anel de destaque ao redor do alvo — decorativo: nunca captura clique,
          senão engoliria a interação com o próprio elemento em destaque. */}
      <div
        data-testid="tutorial-spotlight"
        style={{
          position: 'fixed', zIndex: 10001,
          top: top - pad,
          left: left - pad,
          width: width + pad * 2,
          height: height + pad * 2,
          borderRadius: 8,
          border: `2px solid ${alpha(theme.palette.primary.main, 0.6)}`,
          boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.15)}`,
          pointerEvents: 'none',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </>
  )
}

const TOOLTIP_WIDTH = 320
const TOOLTIP_HEIGHT = 230
const GAP = 16

// Fallback usado enquanto (ou caso) o alvo do passo não exista no DOM: o
// tooltip vira um diálogo centrado. O que não pode mudar NUNCA é o
// `position: fixed` — z-index é ignorado em elemento estático, e sem ele o
// tooltip afunda para trás do scrim.
const ESTILO_CENTRALIZADO = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: TOOLTIP_WIDTH,
  zIndex: 10002,
}

const SELETOR_FOCAVEIS =
  'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

const TutorialOnboarding = () => {
  const theme = useTheme()
  const {
    visible,
    step,
    totalSteps,
    currentStep,
    concluirTutorial,
    pularTutorial,
    proximoStep,
    voltarStep,
  } = useTutorial()

  const [targetRect, setTargetRect] = useState(null)
  const [tooltipStyle, setTooltipStyle] = useState(ESTILO_CENTRALIZADO)
  const dialogoRef = useRef(null)

  useEffect(() => {
    if (!visible || !currentStep) return

    const updateRect = () => {
      const el = document.querySelector(currentStep.target)
      if (el) {
        setTargetRect(el.getBoundingClientRect())
      } else {
        setTargetRect(null)
      }
    }

    updateRect()
    window.addEventListener('resize', updateRect)
    return () => window.removeEventListener('resize', updateRect)
  }, [visible, step, currentStep])

  useEffect(() => {
    if (!targetRect) {
      setTooltipStyle(ESTILO_CENTRALIZADO)
      return
    }

    const placement = currentStep?.placement || 'right'

    let top, left

    if (placement === 'right') {
      top = targetRect.top + targetRect.height / 2 - TOOLTIP_HEIGHT / 2
      left = targetRect.right + GAP
    } else if (placement === 'bottom') {
      top = targetRect.bottom + GAP
      left = targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2
    } else { // top
      top = targetRect.top - TOOLTIP_HEIGHT - GAP
      left = targetRect.left + targetRect.width / 2 - TOOLTIP_WIDTH / 2
    }

    // Clamp to viewport
    top = Math.max(16, Math.min(top, window.innerHeight - TOOLTIP_HEIGHT - 16))
    left = Math.max(16, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - 16))

    setTooltipStyle({
      position: 'fixed',
      top,
      left,
      transform: 'none',
      width: TOOLTIP_WIDTH,
      zIndex: 10002,
    })
  }, [targetRect, currentStep])

  // Foco entra no diálogo ao abrir e a cada troca de passo, para que leitores
  // de tela anunciem o conteúdo novo.
  useEffect(() => {
    if (!visible) return
    dialogoRef.current?.focus()
  }, [visible, step])

  const aoTeclar = useCallback((evento) => {
    if (evento.key === 'Escape') {
      evento.preventDefault()
      pularTutorial()
      return
    }
    if (evento.key !== 'Tab') return

    const dialogo = dialogoRef.current
    if (!dialogo) return

    const focaveis = Array.from(dialogo.querySelectorAll(SELETOR_FOCAVEIS))
    if (focaveis.length === 0) {
      evento.preventDefault()
      return
    }

    const primeiro = focaveis[0]
    const ultimo = focaveis[focaveis.length - 1]
    const ativo = document.activeElement

    if (!dialogo.contains(ativo)) {
      evento.preventDefault()
      primeiro.focus()
    } else if (evento.shiftKey && ativo === primeiro) {
      evento.preventDefault()
      ultimo.focus()
    } else if (!evento.shiftKey && ativo === ultimo) {
      evento.preventDefault()
      primeiro.focus()
    }
  }, [pularTutorial])

  useEffect(() => {
    if (!visible) return
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [visible, aoTeclar])

  if (!visible) return null

  const isLastStep = step === totalSteps - 1

  return (
    <>
      <SpotlightOverlay targetRect={targetRect} theme={theme} />

      <Paper
        data-testid="tutorial-tooltip"
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={currentStep ? TITULO_ID : undefined}
        aria-describedby={currentStep ? DESCRICAO_ID : undefined}
        tabIndex={-1}
        elevation={0}
        // Geometria vai por `style` (e não por `sx`) de propósito: é estado
        // calculado por instância, não estilo de tema — evita gerar uma classe
        // nova do emotion a cada reposicionamento.
        style={tooltipStyle}
        sx={{
          bgcolor: 'surfaces.raised',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          borderRadius: '12px',
          p: '20px 24px',
          outline: 'none',
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1 }}>
          {step + 1} de {totalSteps}
        </Typography>

        {currentStep && (
          <>
            <Typography
              id={TITULO_ID}
              variant="h6"
              fontWeight={600}
              sx={{ color: 'text.primary', mb: 1, lineHeight: 1.3 }}
            >
              {currentStep.title}
            </Typography>
            <Typography
              id={DESCRICAO_ID}
              variant="body2"
              sx={{ color: 'text.secondary', mb: 2.5, lineHeight: 1.6 }}
            >
              {currentStep.description}
            </Typography>
          </>
        )}

        <Box sx={{ display: 'flex', gap: '6px', mb: 2.5 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <Box key={i} sx={(theme) => ({
              height: 6,
              width: i === step ? 16 : 6,
              borderRadius: 3,
              backgroundColor: i === step ? theme.palette.primary.main : theme.palette.lines.subtle,
              transition: 'all 250ms ease',
            })} />
          ))}
        </Box>

        <Box sx={{ height: '1px', bgcolor: 'divider', mb: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Left side: Pular on step 1, empty spacer on steps 2-5 */}
          {step === 0 ? (
            <Button
              size="small"
              onClick={pularTutorial}
              sx={{ color: 'text.disabled', fontSize: 12, textTransform: 'none' }}
            >
              Pular
            </Button>
          ) : (
            <Box />
          )}

          {/* Right side: Voltar (steps 2+) + Próximo/Começar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {step > 0 && (
              <Button
                size="small"
                onClick={voltarStep}
                sx={{ color: 'text.disabled', fontSize: 12, textTransform: 'none' }}
              >
                Voltar
              </Button>
            )}
            <Button
              variant="contained"
              size="small"
              onClick={isLastStep ? concluirTutorial : proximoStep}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                px: 2.5,
              }}
            >
              {isLastStep ? 'Começar' : 'Próximo'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </>
  )
}

export default TutorialOnboarding
