import React, { useEffect, useState } from 'react'
import { Backdrop, Box, Paper, Typography, Button } from '@mui/material'
import useTutorial from '../../hooks/useTutorial'

const TutorialOnboarding = () => {
  const {
    visible,
    step,
    totalSteps,
    currentStep,
    concluirTutorial,
    pularTutorial,
    proximoStep,
  } = useTutorial()

  const [tooltipStyle, setTooltipStyle] = useState({ top: '50%', left: '50%' })
  const [spotlightStyle, setSpotlightStyle] = useState(null)

  useEffect(() => {
    if (!visible || !currentStep) return
    const el = document.querySelector(currentStep.target)
    if (!el) return
    const rect = el.getBoundingClientRect()
    const placement = currentStep.placement || 'right'

    setSpotlightStyle({
      position: 'fixed',
      top: rect.top - 8,
      left: rect.left - 8,
      width: rect.width + 16,
      height: rect.height + 16,
      borderRadius: 8,
      boxShadow: '0 0 0 9999px rgba(0,0,0,0.75)',
      zIndex: 10001,
      pointerEvents: 'none',
      transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    })

    const TOOLTIP_WIDTH = 320
    const TOOLTIP_HEIGHT = 220
    const GAP = 16
    let top, left
    if (placement === 'right') {
      top = rect.top + rect.height / 2 - TOOLTIP_HEIGHT / 2
      left = rect.right + GAP
    } else {
      top = rect.top - TOOLTIP_HEIGHT - GAP
      left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2
    }
    top = Math.max(16, Math.min(top, window.innerHeight - TOOLTIP_HEIGHT - 16))
    left = Math.max(16, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - 16))
    setTooltipStyle({ top, left, width: TOOLTIP_WIDTH })
  }, [visible, step, currentStep])

  if (!visible) return null

  const isLastStep = step === totalSteps - 1

  return (
    <>
      <Backdrop
        open={visible}
        data-testid="tutorial-backdrop"
        sx={{ zIndex: 10000, backgroundColor: 'transparent', backdropFilter: 'blur(1px)' }}
      />

      {spotlightStyle && (
        <Box data-testid="tutorial-spotlight" sx={spotlightStyle} />
      )}

      <Paper
        data-testid="tutorial-tooltip"
        elevation={0}
        sx={{
          position: 'fixed',
          ...tooltipStyle,
          zIndex: 10002,
          background: '#1a1a2e',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          borderRadius: '12px',
          p: '20px 24px',
        }}
      >
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', mb: 1 }}>
          {step + 1} de {totalSteps}
        </Typography>

        {currentStep && (
          <>
            <Typography variant="h6" fontWeight={600} sx={{ color: '#fff', mb: 1, lineHeight: 1.3 }}>
              {currentStep.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2.5, lineHeight: 1.6 }}>
              {currentStep.description}
            </Typography>
          </>
        )}

        <Box sx={{ display: 'flex', gap: '6px', mb: 2.5 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <Box key={i} sx={{
              height: 6,
              width: i === step ? 16 : 6,
              borderRadius: 3,
              backgroundColor: i === step ? '#7C3AED' : 'rgba(255,255,255,0.25)',
              transition: 'all 250ms ease',
            }} />
          ))}
        </Box>

        <Box sx={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', mb: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {step === 0 ? (
            <Button
              size="small"
              onClick={pularTutorial}
              sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textTransform: 'none' }}
            >
              Pular
            </Button>
          ) : <Box />}

          <Button
            variant="contained"
            size="small"
            onClick={isLastStep ? concluirTutorial : proximoStep}
            sx={{
              backgroundColor: '#7C3AED',
              '&:hover': { backgroundColor: '#6D28D9' },
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
            }}
          >
            {isLastStep ? 'Começar' : 'Próximo'}
          </Button>
        </Box>
      </Paper>
    </>
  )
}

export default TutorialOnboarding
