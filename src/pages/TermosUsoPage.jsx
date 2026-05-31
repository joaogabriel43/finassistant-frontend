import React, { useState, useEffect } from 'react'
import { Box, CircularProgress, Container, Typography } from '@mui/material'

/**
 * Página pública dos Termos de Uso — rota /termos.
 * Acessível sem login. Renderiza markdown de /termos-de-uso.md.
 */
const TermosUsoPage = () => {
  const [conteudo, setConteudo] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/termos-de-uso.md')
      .then((res) => res.text())
      .then((text) => setConteudo(text))
      .catch(() => setConteudo('# Termos de Uso\n\nConteúdo temporariamente indisponível.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box
        component="article"
        sx={{
          '& h1': { variant: 'h4', fontWeight: 700, mb: 2, color: '#7C6AF7' },
          '& h2': { variant: 'h6', fontWeight: 600, mt: 4, mb: 1 },
          '& h3': { fontWeight: 600, mt: 3, mb: 1, fontSize: '1rem' },
          '& p': { color: 'text.secondary', lineHeight: 1.8, mb: 1.5 },
          '& ul, & ol': { pl: 3, color: 'text.secondary', lineHeight: 1.8 },
          '& strong': { color: 'text.primary', fontWeight: 600 },
          '& hr': { borderColor: 'rgba(255,255,255,0.08)', my: 3 },
        }}
      >
        {/* Renderização simples de markdown sem dependências externas */}
        {conteudo.split('\n').map((linha, i) => {
          if (linha.startsWith('# '))
            return <Typography key={i} variant="h4" fontWeight={700} sx={{ color: '#7C6AF7', mb: 2 }}>{linha.slice(2)}</Typography>
          if (linha.startsWith('## '))
            return <Typography key={i} variant="h6" fontWeight={600} sx={{ mt: 4, mb: 1 }}>{linha.slice(3)}</Typography>
          if (linha.startsWith('### '))
            return <Typography key={i} variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 1 }}>{linha.slice(4)}</Typography>
          if (linha.startsWith('---'))
            return <Box key={i} sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', my: 3 }} />
          if (linha.startsWith('- '))
            return <Typography key={i} component="li" variant="body2" color="text.secondary" sx={{ ml: 3, lineHeight: 1.8 }}>{linha.slice(2)}</Typography>
          if (linha.trim() === '')
            return <Box key={i} sx={{ mb: 1 }} />
          return (
            <Typography key={i} variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 1 }}>
              {/* Renderiza **bold** simples */}
              {linha.split(/\*\*(.+?)\*\*/g).map((parte, j) =>
                j % 2 === 1 ? <strong key={j}>{parte}</strong> : parte
              )}
            </Typography>
          )
        })}
      </Box>
    </Container>
  )
}

export default TermosUsoPage
