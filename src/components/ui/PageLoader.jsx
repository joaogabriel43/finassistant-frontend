import React from 'react'
import { Box, CircularProgress } from '@mui/material'

const PageLoader = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100vh',
      bgcolor: 'background.default',
    }}
  >
    <CircularProgress sx={{ color: 'primary.main' }} />
  </Box>
)

export default PageLoader
