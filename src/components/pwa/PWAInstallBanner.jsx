import React, { useState, useEffect } from 'react'
import { Snackbar, Button, Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid'
import usePWAInstall from '../../hooks/usePWAInstall'

const DISMISSED_KEY = 'fortunai:pwa:dismissed'
const DELAY_MS = 30000 // 30 seconds

const PWAInstallBanner = () => {
  const { canInstall, isInstalled, install } = usePWAInstall()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!canInstall || isInstalled) return
    if (sessionStorage.getItem(DISMISSED_KEY)) return

    const timer = setTimeout(() => setOpen(true), DELAY_MS)
    return () => clearTimeout(timer)
  }, [canInstall, isInstalled])

  const handleInstall = async () => {
    await install()
    setOpen(false)
  }

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, 'true')
    setOpen(false)
  }

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ zIndex: 9000, mb: { xs: 2, md: 3 } }}
    >
      <Box sx={(theme) => ({
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 2.5, py: 1.5,
        bgcolor: 'surfaces.raised',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      })}>
        <PhoneAndroidIcon sx={{ color: 'primary.main', fontSize: 22, flexShrink: 0 }} />
        <Typography variant="body2" sx={{ color: 'text.primary', flex: 1 }}>
          Instale o Pondero no seu celular
        </Typography>
        <Button
          size="small"
          onClick={handleDismiss}
          sx={{ color: 'text.disabled', textTransform: 'none', fontSize: 12, minWidth: 'auto' }}
        >
          Agora não
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleInstall}
          sx={{
            textTransform: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: 12,
          }}
        >
          Instalar
        </Button>
      </Box>
    </Snackbar>
  )
}

export default PWAInstallBanner
