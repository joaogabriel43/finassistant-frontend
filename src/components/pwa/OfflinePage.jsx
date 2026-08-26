import React, { useState, useEffect } from 'react'
import { Box, Typography, Button } from '@mui/material'
import WifiOffIcon from '@mui/icons-material/WifiOff'

const OfflinePage = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => {
      setIsOffline(false)
      window.location.reload()
    }

    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <Box sx={{
      position: 'fixed', inset: 0, zIndex: 99999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      bgcolor: 'background.default',
      gap: 2.5,
    }}>
      <WifiOffIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
      <Typography variant="h5" fontWeight={600} sx={{ color: 'text.primary' }}>
        Sem conexão
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', px: 4 }}>
        Verifique sua internet e tente novamente
      </Typography>
      <Button
        variant="contained"
        onClick={() => window.location.reload()}
        sx={{
          mt: 1,
          borderRadius: '10px',
          textTransform: 'none',
          fontWeight: 600,
          px: 4,
        }}
      >
        Tentar novamente
      </Button>
    </Box>
  )
}

export default OfflinePage
