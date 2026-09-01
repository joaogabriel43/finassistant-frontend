import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

/**
 * Faixa de erro PARCIAL: aparece dentro do módulo cuja fonte falhou, sem
 * derrubar o resto da tela. Sempre oferece nova tentativa.
 *
 * A severidade não depende só da cor — há ícone e texto explícito.
 */
export default function ModuloIndisponivel({ mensagem, onTentarNovamente }) {
  return (
    <Box
      role="status"
      sx={(t) => ({
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        px: '14px',
        py: '12px',
        borderRadius: `${t.radius.md}px`,
        border: `1px solid ${t.palette.lines.subtle}`,
        backgroundColor: t.palette.surfaces.surfaceSoft,
      })}
    >
      <ErrorOutlineIcon sx={{ fontSize: 18, color: 'warning.main' }} />
      <Typography sx={{ fontSize: 13.5, color: 'text.secondary', flex: 1, minWidth: 180 }}>
        {mensagem}
      </Typography>
      {onTentarNovamente && (
        <Button
          onClick={onTentarNovamente}
          size="small"
          sx={{ fontSize: 13, fontWeight: 600, textTransform: 'none', px: '8px' }}
        >
          Tentar novamente
        </Button>
      )}
    </Box>
  )
}
