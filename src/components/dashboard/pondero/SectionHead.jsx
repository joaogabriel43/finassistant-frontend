import React from 'react'
import { Box, Typography } from '@mui/material'

/**
 * Cabeçalho de seção do dashboard Pondero: título editorial + descrição do que
 * a seção mostra de fato + uma ação textual opcional à direita.
 *
 * A descrição não é enfeite: é onde o rótulo honesto do dado vive
 * ("saldo em conta nos últimos 30 dias", "distribuição por ativo").
 */
export default function SectionHead({ id, titulo, descricao, acao }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'flex-end' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: '10px',
        mb: '18px',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          id={id}
          component="h2"
          sx={{
            fontSize: 'clamp(17px, 1.6vw, 20px)',
            fontWeight: 700,
            letterSpacing: '-0.015em',
            color: 'text.primary',
            m: 0,
          }}
        >
          {titulo}
        </Typography>
        {descricao && (
          <Typography sx={{ mt: '4px', fontSize: 13.5, color: 'text.secondary' }}>
            {descricao}
          </Typography>
        )}
      </Box>
      {acao}
    </Box>
  )
}
