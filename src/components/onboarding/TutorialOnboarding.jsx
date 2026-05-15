import React, { useEffect, useState } from 'react'
import { Box, Paper, Typography, Button } from '@mui/material'
import useTutorial from '../../hooks/useTutorial'

const FullDarkOverlay = () => (
  <div style={{
    position: 'fixed', zIndex: 10000,
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(2px)',
  }} />
)

const SpotlightOverlay = ({ targetRect }) => {
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
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(2px)',
      }} />
      {/* Left */}
      <div style={{
        position: 'fixed', zIndex: 10000,
        top: top - pad, left: 0,
        width: Math.max(0, left - pad),
        height: height + pad * 2,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(2px)',
      }} />
      {/* Right */}
      <div style={{
        position: 'fixed', zIndex: 10000,
        top: top - pad,
        left: left + width + pad,
        right: 0,
        height: height + pad * 2,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(2px)',
      }} />
      {/* Bottom */}
      <div style={{
        position: 'fixed', zIndex: 10000,
        top: top + height + pad,
        left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(2px)',
      }} />
      {/* Purple border ring around target */}
      <div
        data-testid="tutorial-spotlight"
        style={{
          position: 'fixed', zIndex: 10001,
          top: top - pad,
          left: left - pad,
          width: width + pad * 2,
          height: height + pad * 2,
          borderRadius: 8,
          border: '2px solid rgba(124, 58, 237, 0.6)',
          boxShadow: '0 0 0 4px rgba(124, 58, 237, 0.15)',
          pointerEvents: 'none',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </>
  )
}

const TutorialOnboarding = () => {
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
  const [tooltipStyle, setTooltipStyle] = useState({})

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
    if (!targetRect) return

    const TOOLTIP_WIDTH = 320
    const TOOLTIP_HEIGHT = 230
    const GAP = 16
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

    setTooltipStyle({ position: 'fixed', top, left, width: TOOLTIP_WIDTH, zIndex: 10002 })
  }, [targetRect, currentStep])

  if (!visible) return null

  const isLastStep = step === totalSteps - 1

  return (
    <>
      <SpotlightOverlay targetRect={targetRect} />

      <Paper
        data-testid="tutorial-tooltip"
        elevation={0}
        sx={{
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
          {/* Left side: Pular on step 1, empty spacer on steps 2-5 */}
          {step === 0 ? (
            <Button
              size="small"
              onClick={pularTutorial}
              sx={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, textTransform: 'none' }}
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
                sx={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, textTransform: 'none' }}
              >
                Voltar
              </Button>
            )}
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
        </Box>
      </Paper>
    </>
  )
}

export default TutorialOnboarding
