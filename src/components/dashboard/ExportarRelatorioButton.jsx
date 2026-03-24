import React, { useState } from 'react'
import { Button, CircularProgress } from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import api from '../../services/api'

const ExportarRelatorioButton = () => {
  const [loading, setLoading] = useState(false)

  const handleExportar = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const mes = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      const response = await api.get(`/relatorio/mensal?mes=${mes}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `relatorio-${mes}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      // silently fail — user will see no download
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={loading ? <CircularProgress size={16} /> : <PictureAsPdfIcon />}
      onClick={handleExportar}
      disabled={loading}
      data-testid="exportar-relatorio-btn"
      sx={{
        borderRadius: '8px',
        textTransform: 'none',
        borderColor: 'rgba(124,106,247,0.4)',
        color: '#7C6AF7',
        '&:hover': { borderColor: '#7C6AF7', backgroundColor: 'rgba(124,106,247,0.08)' },
      }}
    >
      {loading ? 'Gerando...' : 'Exportar PDF'}
    </Button>
  )
}

export default ExportarRelatorioButton
