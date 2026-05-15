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
      background: '#0a0a0f',
      gap: 2.5,
    }}>
      <WifiOffIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.3)' }} />
      <Typography variant="h5" fontWeight={600} sx={{ color: '#fff' }}>
        Sem conexão
      </Typography>
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', px: 4 }}>
        Verifique sua internet e tente novamente
      </Typography>
      <Button
        variant="contained"
        onClick={() => window.location.reload()}
        sx={{
          mt: 1,
          backgroundColor: '#7C3AED',
          '&:hover': { backgroundColor: '#6D28D9' },
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
